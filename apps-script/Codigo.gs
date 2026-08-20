/**
 * Misión Mapache · receptor de resultados
 *
 * Pega este archivo en el Apps Script del Google Sheet de DAZ Ambiental y
 * publícalo como aplicación web. La landing le hace POST cada vez que alguien
 * termina el recorrido, y cada envío se convierte en una fila.
 *
 * Las columnas se crean solas a partir de las claves que llegan y se respeta el
 * orden del primer envío. Si mañana el cliente cambia el número de preguntas,
 * las columnas nuevas se añaden al final sin romper lo ya guardado ni descuadrar
 * las filas viejas.
 *
 * Instalación paso a paso en README-SHEET.md
 */

/** Nombre de la hoja donde se acumulan los resultados. */
const HOJA = "Resultados";

/**
 * Clave compartida. La aplicación web tiene que quedar abierta a cualquiera
 * para que la landing pueda escribir, así que sin esta clave cualquier persona
 * con la URL podría insertar filas falsas.
 *
 * Se guarda en Configuración del proyecto → Propiedades del script, con el
 * nombre TOKEN. El mismo valor va en la variable GOOGLE_SHEETS_TOKEN de Vercel.
 */
function tokenEsperado() {
  return PropertiesService.getScriptProperties().getProperty("TOKEN");
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return respuesta({ ok: false, motivo: "sin-cuerpo" });
    }

    const datos = JSON.parse(e.postData.contents);

    const esperado = tokenEsperado();
    if (esperado && datos.token !== esperado) {
      return respuesta({ ok: false, motivo: "token-invalido" });
    }
    delete datos.token; // no se guarda en la hoja

    // Dos envíos a la vez podrían escribir sobre la misma fila.
    const cerrojo = LockService.getScriptLock();
    cerrojo.waitLock(20000);
    try {
      escribirFila(datos);
    } finally {
      cerrojo.releaseLock();
    }

    return respuesta({ ok: true });
  } catch (error) {
    return respuesta({ ok: false, motivo: String(error) });
  }
}

/** Permite comprobar desde el navegador que la publicación quedó bien. */
function doGet() {
  return respuesta({ ok: true, servicio: "Misión Mapache", estado: "escuchando" });
}

function escribirFila(datos) {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = libro.getSheetByName(HOJA) || libro.insertSheet(HOJA);

  const claves = Object.keys(datos);

  // Primera vez: la fila de encabezados nace del propio envío.
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(claves);
    hoja.getRange(1, 1, 1, claves.length)
      .setFontWeight("bold")
      .setBackground("#313d1a")
      .setFontColor("#faf7ee");
    hoja.setFrozenRows(1);
  }

  let encabezados = hoja
    .getRange(1, 1, 1, Math.max(hoja.getLastColumn(), 1))
    .getValues()[0]
    .filter(String);

  // Claves que no existían: se agregan como columnas nuevas al final.
  const nuevas = claves.filter(function (c) {
    return encabezados.indexOf(c) === -1;
  });
  if (nuevas.length) {
    hoja.getRange(1, encabezados.length + 1, 1, nuevas.length)
      .setValues([nuevas])
      .setFontWeight("bold")
      .setBackground("#313d1a")
      .setFontColor("#faf7ee");
    encabezados = encabezados.concat(nuevas);
  }

  // Se escribe en el orden de los encabezados, no en el del envío.
  const fila = encabezados.map(function (col) {
    return Object.prototype.hasOwnProperty.call(datos, col) ? datos[col] : "";
  });

  hoja.appendRow(fila);
}

function respuesta(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
