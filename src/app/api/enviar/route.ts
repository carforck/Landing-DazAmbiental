import { NextResponse } from "next/server";
import {
  desglosePorCategoria,
  MAXIMO,
  nivelPara,
  puntajeDe,
  type Participante,
  type Respuestas,
} from "@/lib/mision";

/**
 * Puente hacia el Google Apps Script del cliente. La URL del webhook vive en
 * el servidor (GOOGLE_SHEETS_WEBHOOK_URL) para que no quede expuesta en el
 * bundle del navegador.
 *
 * El orden de las columnas que se envían es el que verá el Sheet.
 */
export async function POST(request: Request) {
  let cuerpo: { participante?: Participante; respuestas?: Respuestas };

  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, motivo: "json-invalido" }, { status: 400 });
  }

  const { participante, respuestas } = cuerpo;

  if (!participante?.nombre || !participante.documento || !participante.autoriza) {
    return NextResponse.json(
      { ok: false, motivo: "participante-incompleto" },
      { status: 400 },
    );
  }

  const puntaje = puntajeDe(respuestas ?? {});
  const nivel = nivelPara(puntaje);
  const desglose = desglosePorCategoria(respuestas ?? {});

  const fila: Record<string, string | number> = {
    "Fecha y hora": new Date().toISOString(),
    "Nombre completo": participante.nombre,
    "Documento de identidad": participante.documento,
    Perfil: participante.rol,
    Puntaje: puntaje,
    "Máximo": MAXIMO,
    Nivel: nivel.nombre,
    "Autorización habeas data": "Sí",
  };

  // Una columna por categoría, con el mismo nombre que ve el cliente.
  desglose.forEach(({ categoria, aciertos, total }) => {
    fila[categoria.nombre] = `${aciertos}/${total}`;
  });

  // Una columna por pregunta, para que puedan analizar respuesta por respuesta.
  Object.entries(respuestas ?? {}).forEach(([numero, letra]) => {
    fila[`P${numero}`] = letra;
  });

  const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhook) {
    // En desarrollo todavía no hay Sheet del cliente: no es un error del flujo.
    console.warn("[enviar] GOOGLE_SHEETS_WEBHOOK_URL sin configurar. Fila:", fila);
    return NextResponse.json({ ok: false, motivo: "sin-webhook", fila });
  }

  try {
    const respuesta = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fila),
    });

    if (!respuesta.ok) {
      return NextResponse.json(
        { ok: false, motivo: "webhook-rechazo", estado: respuesta.status },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, motivo: "webhook-inalcanzable" }, { status: 502 });
  }
}
