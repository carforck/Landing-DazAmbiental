import { NextResponse } from "next/server";
import {
  cuestionarioDe,
  desglosePorTema,
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
    Una columna por pregunta con la letra elegida y otra con el acierto. Los
    tres perfiles responden cuestionarios distintos, así que el encabezado lleva
    el tema: sin él, "P1" significaría cosas diferentes según quién respondió.
  */
  desglose.forEach(({ pregunta, elegida, acerto }) => {
    fila[`P${pregunta.numero} · ${pregunta.tema}`] = elegida ?? "";
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
      body: JSON.stringify(token ? { ...fila, token } : fila),
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
