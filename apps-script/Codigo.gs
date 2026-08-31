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

/** Nombre de la pestaña donde se acumulan los resultados. */
const HOJA = "Resultados";

/** Pestaña de consulta con los tres cuestionarios completos. */
const HOJA_REF = "Cuestionarios";

/**
 * Devuelve el libro donde escribir.
 *
 * Si el script se creó desde el propio Sheet (Extensiones → Apps Script) queda
 * vinculado a él y `getActiveSpreadsheet()` lo devuelve. Si se creó suelto desde
 * script.google.com, ese método devuelve null y todo falla en el primer envío.
 *
 * Para cubrir los dos casos: si existe la propiedad SHEET_ID, se abre por id.
 * El id es lo que va entre /d/ y /edit en la URL del Sheet.
 */
function libro() {
  const id = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  if (id) return SpreadsheetApp.openById(id);

  const activo = SpreadsheetApp.getActiveSpreadsheet();
  if (!activo) {
    throw new Error(
      "El script no está vinculado a ningún Sheet. Agrega la propiedad SHEET_ID " +
        "con el id del documento, o crea el script desde Extensiones → Apps Script.",
    );
  }
  return activo;
}

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

    // La referencia no es parte de la fila: es la chuleta de la otra pestaña.
    const referencia = datos.referencia;
    delete datos.referencia;

    // Dos envíos a la vez podrían escribir sobre la misma fila.
    const cerrojo = LockService.getScriptLock();
    cerrojo.waitLock(20000);
    try {
      escribirFila(datos);
      if (referencia && referencia.length) actualizarReferencia(referencia);
    } finally {
      cerrojo.releaseLock();
    }

    return respuesta({ ok: true });
  } catch (error) {
    return respuesta({ ok: false, motivo: String(error) });
  }
}

/**
 * Comprobación desde el navegador. Además de confirmar que la publicación
 * quedó bien, verifica que el script alcanza el Sheet: es el fallo que de otro
 * modo solo aparecería con el primer participante real.
 */
function doGet() {
  try {
    const nombre = libro().getName();
    return respuesta({
      ok: true,
      servicio: "Misión Mapache",
      estado: "escuchando",
      documento: nombre,
    });
  } catch (error) {
    return respuesta({ ok: false, motivo: String(error) });
  }
}

function escribirFila(datos) {
  const doc = libro();
  const hoja = doc.getSheetByName(HOJA) || doc.insertSheet(HOJA);

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
    var v = Object.prototype.hasOwnProperty.call(datos, col) ? datos[col] : "";
    return comoTexto(v);
  });

  hoja.appendRow(fila);
}

/**
 * Reconstruye la pestaña de consulta con los tres cuestionarios.
 *
 * Solo hace trabajo si el contenido cambió: se guarda una huella del envío
 * anterior y se compara. Sin ese cortafuegos, cada participante que termina el
 * recorrido reescribiría quince filas para dejarlas idénticas, y con varias
 * personas respondiendo a la vez el script se quedaría sin cuota.
 */
function actualizarReferencia(filas) {
  const props = PropertiesService.getScriptProperties();
  const huella = String(JSON.stringify(filas).length) + ":" + filas.length;
  if (props.getProperty("HUELLA_REF") === huella) return;

  const doc = libro();
  let hoja = doc.getSheetByName(HOJA_REF);
  if (!hoja) hoja = doc.insertSheet(HOJA_REF);
  hoja.clear();

  const encabezado = [
    "Cuestionario", "Perfil", "N°", "Tema", "Situación",
    "Opción A", "Opción B", "Opción C", "Opción D", "Correcta",
  ];
  const cuerpo = filas.map(function (f) {
    return [f.cuestionario, f.perfil, f.numero, f.tema, f.escenario,
            f.A, f.B, f.C, f.D, f.correcta];
  });

  hoja.getRange(1, 1, 1, encabezado.length)
    .setValues([encabezado])
    .setFontWeight("bold")
    .setBackground("#313d1a")
    .setFontColor("#faf7ee");
  hoja.getRange(2, 1, cuerpo.length, encabezado.length).setValues(cuerpo);
  hoja.setFrozenRows(1);
  hoja.setColumnWidth(5, 420); // la situación es el texto largo
  for (var c = 6; c <= 9; c++) hoja.setColumnWidth(c, 300);
  hoja.getRange(2, 5, cuerpo.length, 5).setWrap(true);

  props.setProperty("HUELLA_REF", huella);
}

/**
 * Evita que Sheets interprete un valor como fórmula.
 *
 * Un número de contacto llega como "+57 3001234567" y la hoja lee el signo más
 * de la primera posición como el inicio de una expresión: la celda quedaba en
 * #ERROR! y el teléfono se perdía. El apóstrofo inicial fuerza texto y no se
 * muestra en la celda.
 */
function comoTexto(v) {
  if (typeof v !== "string" || !v.length) return v;
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function respuesta(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
