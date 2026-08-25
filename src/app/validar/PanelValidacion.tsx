"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eraser, ExternalLink, Play, Trophy } from "lucide-react";
import { sesion, useSesion } from "@/lib/sesion";
import {
  LETRAS,
  MAXIMO,
  NIVELES,
  PUNTOS_POR_ACIERTO,
  ROLES,
  cuestionarioDe,
  nivelPara,
  preguntasDe,
  type Letra,
  type Respuestas,
  type Rol,
} from "@/lib/mision";

const PARTICIPANTE = {
  nombre: "Zulay Pérez (prueba)",
  telefono: "+57 3001234567",
  rol: ROLES[0] as Rol,
  autoriza: true as const,
};

/**
 * Construye un set de respuestas con exactamente `aciertos` correctas.
 * Las incorrectas toman la primera letra que no sea la buena, para que el
 * puntaje sea predecible y la validación repetible.
 */
function respuestasCon(
  rol: Rol,
  aciertos: number,
  cuantas = preguntasDe(rol).length,
): Respuestas {
  const respuestas: Respuestas = {};
  preguntasDe(rol)
    .slice(0, cuantas)
    .forEach((pregunta, i) => {
      respuestas[pregunta.numero] =
        i < aciertos
          ? pregunta.correcta
          : (LETRAS.find((l) => l !== pregunta.correcta) as Letra);
    });
  return respuestas;
}

export function PanelValidacion() {
  const router = useRouter();
  const { participante, respuestas } = useSesion();
  const respondidas = Object.keys(respuestas).length;

  function irAlSendero(respondidasPrevias: number) {
    sesion.guardarParticipante(PARTICIPANTE);
    sesion.guardarRespuestas(
      respuestasCon(PARTICIPANTE.rol, respondidasPrevias, respondidasPrevias),
    );
    router.push("/mision");
  }

  function irAResultados(aciertos: number) {
    sesion.guardarParticipante(PARTICIPANTE);
    sesion.guardarRespuestas(respuestasCon(PARTICIPANTE.rol, aciertos));
    router.push("/resultados");
  }

  return (
    <main className="min-h-dvh bg-selva-950 px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="font-display text-xs font-semibold tracking-[0.3em] text-oro-400 uppercase">
          Solo en desarrollo
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-crema">
          Panel de validación
        </h1>
        <p className="mt-2 text-crema/60">
          Atajos para ver cualquier pantalla sin recorrer las {preguntasDe(PARTICIPANTE.rol).length}{" "}
          situaciones. Esta ruta no existe en producción.
        </p>

        <Bloque titulo="Estado actual de la sesión">
          <p className="text-crema/70">
            {participante ? (
              <>
                <span className="text-crema">{participante.nombre}</span> ·{" "}
                {participante.rol} · {respondidas}/{preguntasDe(PARTICIPANTE.rol).length} respondidas
              </>
            ) : (
              "Sin sesión iniciada."
            )}
          </p>
          <button
            type="button"
            onClick={() => sesion.limpiar()}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-crema/20 px-4 py-2 text-sm text-crema/70 transition duration-200 hover:border-oro-500 hover:text-oro-300"
          >
            <Eraser size={15} aria-hidden /> Limpiar sesión
          </button>
        </Bloque>

        <Bloque titulo="Resultados en cada nivel">
          <p className="mb-4 text-sm text-crema/50">
            Lo más útil de validar: los cuatro mensajes, el confetti (solo desde 9
            aciertos) y las barras por categoría.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {NIVELES.map((nivel) => {
              const aciertos = Math.ceil(nivel.max / PUNTOS_POR_ACIERTO);
              return (
                <button
                  key={nivel.nombre}
                  type="button"
                  onClick={() => irAResultados(aciertos)}
                  className="cursor-pointer rounded-xl border border-crema/12 bg-selva-900/50 p-4 text-left transition duration-200 hover:border-oro-500/50"
                >
                  <span className="flex items-center gap-2 font-display font-semibold text-crema">
                    <Trophy size={15} className="text-oro-400" aria-hidden />
                    {nivel.nombre}
                  </span>
                  <span className="mt-1 block text-sm text-crema/50">
                    {nivel.min}-{nivel.max} de {MAXIMO} puntos · {nivel.porcentaje}
                  </span>
                </button>
              );
            })}
          </div>
        </Bloque>

        <Bloque titulo="Sendero en distintos puntos">
          <p className="mb-4 text-sm text-crema/50">
            Para ver cómo camina el mapache, cómo se ven las estaciones completadas y
            cómo entra cada zona nueva.
          </p>
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => irAlSendero(n)}
                className="cursor-pointer rounded-full border border-crema/15 px-4 py-2 text-sm text-crema/75 transition duration-200 hover:border-oro-500 hover:text-oro-300"
              >
                <Play size={13} className="mr-1.5 inline" aria-hidden />
                Situación {n + 1}
              </button>
            ))}
          </div>
        </Bloque>

        <Bloque titulo="Todas las pantallas">
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { href: "/", nombre: "Landing", nota: "Hero, propósito, habeas data" },
              { href: "/registro", nombre: "Registro", nota: "Validación y checkbox" },
              { href: "/mision", nombre: "Sendero", nota: "Requiere sesión" },
              { href: "/resultados", nombre: "Resultados", nota: "Requiere las 15" },
              { href: "/mascota", nombre: "Mascota", nota: "Poses y tamaños reales" },
            ].map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="flex items-center justify-between rounded-xl border border-crema/10 bg-selva-900/40 px-4 py-3 transition duration-200 hover:border-oro-500/40"
              >
                <span>
                  <span className="block font-display font-semibold text-crema">
                    {r.nombre}
                  </span>
                  <span className="text-xs text-crema/45">{r.nota}</span>
                </span>
                <ExternalLink size={15} className="text-crema/30" aria-hidden />
              </Link>
            ))}
          </div>
        </Bloque>

        <Bloque titulo="Comprobaciones de contenido">
          <ul className="space-y-2 text-sm text-crema/70">
            <li>
              · Cuestionarios por perfil cargados desde{" "}
              <code className="text-oro-300">config/preguntas.json</code>
            </li>
            <li>· {distribucion()}</li>
            <li>
              · Puntaje máximo {MAXIMO} → nivel{" "}
              <span className="text-crema">{nivelPara(MAXIMO).nombre}</span>
            </li>
            <li>
              · Puntaje 0 → nivel{" "}
              <span className="text-crema">{nivelPara(0).nombre}</span>
            </li>
          </ul>
        </Bloque>
      </div>
    </main>
  );
}

/** El cliente pidió que la correcta no siempre caiga en la misma letra. */
function distribucion() {
  return ROLES.map((rol) => {
    const preguntas = preguntasDe(rol);
    const conteo = LETRAS.map(
      (letra) => `${letra}${preguntas.filter((p) => p.correcta === letra).length}`,
    ).join(" ");
    return `${cuestionarioDe(rol).nombre}: ${conteo}`;
  }).join(" · ");
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 rounded-2xl border border-crema/10 bg-selva-900/30 p-6">
      <h2 className="mb-3 font-display text-lg font-semibold text-crema">{titulo}</h2>
      {children}
    </section>
  );
}
