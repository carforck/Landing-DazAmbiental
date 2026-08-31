import { NextResponse } from "next/server";
import {
  cuestionarioDe,
  desglosePorTema,
  MAXIMO,
  nivelPara,
  puntajeDe,
  referenciaCuestionarios,
  type Participante,
  type Respuestas,
} from "@/lib/mision";

/**
 * Puente hacia el Google Apps Script del cliente. La URL del webhook vive en
 * el servidor (GOOGLE_SHEETS_WEBHOOK_URL) para que no quede expuesta en el
 * bundle del navegador.
 *
 * El orden de las claves que se envían es el de las columnas del Sheet.
 */
export async function POST(request: Request) {
  let cuerpo: { participante?: Participante; respuestas?: Respuestas };

  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, motivo: "json-invalido" }, { status: 400 });
  }

  const { participante, respuestas } = cuerpo;

  if (!participante?.nombre || !participante.telefono || !participante.autoriza) {
    return NextResponse.json(
      { ok: false, motivo: "participante-incompleto" },
      { status: 400 },
    );
  }

  const rol = participante.rol;
  const puntaje = puntajeDe(rol, respuestas ?? {});
  const nivel = nivelPara(puntaje);
  const desglose = desglosePorTema(rol, respuestas ?? {});

  const fila: Record<string, string | number> = {
    "Fecha y hora": new Date().toISOString(),
    "Nombre completo": participante.nombre,
    "Número de contacto": participante.telefono,
    Perfil: rol,
    Cuestionario: cuestionarioDe(rol).nombre,
    Puntaje: puntaje,
    "Máximo": MAXIMO,
    Nivel: nivel.nombre,
    Interpretación: nivel.interpretacion,
    "Autorización habeas data": "Sí",
  };

  /*
    Tres columnas fijas por pregunta: tema, letra elegida y acierto.

    Antes el encabezado de la respuesta llevaba el tema incrustado
    ("P1 · Alimentación de mapaches"), y como cada perfil responde un
    cuestionario distinto, cada uno estrenaba sus propias columnas: la hoja
    crecía a quince columnas de respuesta de las que cada fila llenaba cinco.
    Peor aún, la columna de acierto sí era compartida, así que "P1 acierto"
    significaba cosas distintas según quién respondió.

    Con el tema en su propia columna, las tres son iguales para todos los
    perfiles, cada fila las llena todas y la hoja queda lista para filtrar y
    tabular sin trucos.
  */
  desglose.forEach(({ pregunta, elegida, acerto }) => {
    fila[`P${pregunta.numero} tema`] = pregunta.tema;
    fila[`P${pregunta.numero} respuesta`] = elegida ?? "";
    fila[`P${pregunta.numero} acierto`] = acerto ? "Sí" : "No";
  });

  const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const token = process.env.GOOGLE_SHEETS_TOKEN;

  if (!webhook) {
    // En desarrollo todavía no hay Sheet del cliente: no es un error del flujo.
    console.warn("[enviar] GOOGLE_SHEETS_WEBHOOK_URL sin configurar. Fila:", fila);
    return NextResponse.json({ ok: false, motivo: "sin-webhook", fila });
  }

  try {
    const respuesta = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      /*
        El Apps Script tiene que quedar abierto a cualquiera para que esta ruta
        pueda escribir, así que la clave compartida es lo único que impide que
        alguien con la URL inserte filas falsas en el Sheet del cliente.
      */
      /*
        `referencia` viaja con cada envío para que el Apps Script mantenga al
        día la pestaña de consulta. Son unos pocos KB y evita el paso manual de
        volver a subirla cada vez que el cliente edita una pregunta.
      */
      body: JSON.stringify({
        ...fila,
        ...(token ? { token } : {}),
        referencia: referenciaCuestionarios(),
      }),
    });

    if (!respuesta.ok) {
      return NextResponse.json(
        { ok: false, motivo: "webhook-rechazo", estado: respuesta.status },
        { status: 502 },
      );
    }

    /*
      Apps Script responde 200 aunque rechace el envío: si solo miráramos el
      código HTTP, un token mal configurado se vería como éxito y los
      resultados del cliente desaparecerían sin que nadie se entere.
    */
    const texto = await respuesta.text();
    let confirmacion: { ok?: boolean; motivo?: string } = {};
    try {
      confirmacion = JSON.parse(texto);
    } catch {
      console.error("[enviar] el webhook no devolvió JSON:", texto.slice(0, 200));
      return NextResponse.json({ ok: false, motivo: "webhook-sin-json" }, { status: 502 });
    }

    if (!confirmacion.ok) {
      console.error("[enviar] el webhook rechazó la fila:", confirmacion.motivo);
      return NextResponse.json(
        { ok: false, motivo: confirmacion.motivo ?? "webhook-rechazo" },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, motivo: "webhook-inalcanzable" }, { status: 502 });
  }
}
