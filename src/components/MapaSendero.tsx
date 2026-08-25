"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MapachePlush } from "@/components/MapachePlush";
import type { Pregunta } from "@/lib/mision";

interface Punto {
  x: number;
  y: number;
}

/**
 * Sendero vertical serpenteante con una estación por pregunta.
 *
 * El trazo se dibuja midiendo la posición real de cada estación, así que sigue
 * cuadrando cuando cambia el ancho, el tamaño de letra o el número de paradas
 * (que ahora depende del perfil del participante).
 */
export function MapaSendero({
  preguntas,
  indiceActual,
  frontera,
  onAbrirEstacion,
}: {
  preguntas: Pregunta[];
  indiceActual: number;
  /** Última parada desbloqueada: hasta ahí se puede tocar para volver. */
  frontera: number;
  onAbrirEstacion: (indice: number) => void;
}) {
  const reduce = useReducedMotion();
  const contenedor = useRef<HTMLDivElement>(null);
  const estaciones = useRef<(HTMLDivElement | null)[]>([]);
  const [puntos, setPuntos] = useState<Punto[]>([]);

  const medir = useCallback(() => {
    const caja = contenedor.current?.getBoundingClientRect();
    if (!caja) return;
    setPuntos(
      estaciones.current.slice(0, preguntas.length).map((el) => {
        if (!el) return { x: 0, y: 0 };
        const r = el.getBoundingClientRect();
        return {
          x: r.left - caja.left + r.width / 2,
          y: r.top - caja.top + r.height / 2,
        };
      }),
    );
  }, [preguntas.length]);

  useLayoutEffect(() => {
    medir();
  }, [medir]);

  useEffect(() => {
    const observer = new ResizeObserver(medir);
    if (contenedor.current) observer.observe(contenedor.current);
    window.addEventListener("resize", medir);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, [medir]);

  // Lleva la estación actual al centro cuando avanza el mapache.
  useEffect(() => {
    estaciones.current[indiceActual]?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
    });
  }, [indiceActual, reduce]);

  const posicionMapache = puntos[Math.min(indiceActual, puntos.length - 1)];

  return (
    <div ref={contenedor} className="relative mx-auto w-full max-w-md px-4 pt-10 pb-28">
      {/* Sendero, detrás de las estaciones */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        fill="none"
      >
        {puntos.length > 1 && (
          <>
            <path
              d={trazo(puntos)}
              stroke="rgb(49 61 26 / 0.22)"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d={trazo(puntos)}
              stroke="var(--color-crema)"
              strokeWidth="13"
              strokeLinecap="round"
            />
            <path
              d={trazo(puntos)}
              stroke="var(--color-oro-500)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="2 14"
              opacity="0.85"
            />
          </>
        )}
      </svg>

      <div className="relative">
        {preguntas.map((pregunta, i) => {
          const estado =
            i === indiceActual ? "actual" : i <= frontera ? "completada" : "bloqueada";

          return (
            <div
              key={pregunta.numero}
              className="flex flex-col items-center py-5"
              style={{ transform: `translateX(${desvio(i)}px)` }}
            >
              <div ref={(el) => void (estaciones.current[i] = el)}>
                <Estacion
                  numero={pregunta.numero}
                  estado={estado}
                  onClick={() => onAbrirEstacion(i)}
                />
              </div>
              <span
                className={`mt-3 max-w-[10rem] text-center font-mono text-[10px] leading-tight tracking-wide uppercase transition-colors duration-200 ${
                  estado === "bloqueada" ? "text-selva-700/30" : "text-selva-700/70"
                }`}
              >
                {pregunta.tema}
              </span>
            </div>
          );
        })}
      </div>

      {/* El mapache camina hasta la estación actual */}
      {posicionMapache && (
        <motion.div
          className="pointer-events-none absolute top-0 left-0 z-20"
          initial={false}
          animate={{
            x: posicionMapache.x + 26,
            y: Math.max(posicionMapache.y - 56, 0),
          }}
          transition={
            reduce ? { duration: 0 } : { type: "spring", stiffness: 90, damping: 16 }
          }
        >
          <MapachePlush className="h-[72px] w-[72px] drop-shadow-lg" pose="caminando" />
        </motion.div>
      )}
    </div>
  );
}

/** Serpenteo horizontal: suave, acotado y estable entre renders. */
function desvio(i: number) {
  return Math.round(Math.sin(i * 1.1) * 68);
}

/** Curva suave que une los centros medidos de las estaciones. */
function trazo(puntos: Punto[]) {
  return puntos
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const anterior = puntos[i - 1];
      const medio = (anterior.y + p.y) / 2;
      return `C ${anterior.x} ${medio}, ${p.x} ${medio}, ${p.x} ${p.y}`;
    })
    .join(" ");
}

function Estacion({
  numero,
  estado,
  onClick,
}: {
  numero: number;
  estado: "completada" | "actual" | "bloqueada";
  onClick: () => void;
}) {
  const base =
    "relative z-10 grid h-[70px] w-[70px] place-items-center rounded-full text-xl font-black transition duration-200";

  if (estado === "completada") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} cursor-pointer bg-lima text-selva-950 shadow-[0_10px_24px_-10px_rgba(143,191,63,0.9)] hover:bg-lima-claro`}
        aria-label={`Parada ${numero}, respondida. Volver a ella`}
      >
        <span aria-hidden>✓</span>
      </button>
    );
  }

  if (estado === "bloqueada") {
    return (
      <div
        className={`${base} bg-white/70 text-selva-900/25 ring-1 ring-selva-900/8`}
        aria-label={`Parada ${numero}, todavía sin abrir`}
      >
        {/* El número apagado dice más que un candado: se ve cuánto falta */}
        <span aria-hidden>{numero}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} cursor-pointer bg-mango text-selva-950 shadow-[0_12px_30px_-8px_rgba(240,169,46,0.95)] ring-4 ring-mango/30 hover:bg-mango-claro`}
      aria-label={`Parada ${numero}, tu parada actual. Abrir`}
    >
      <span
        className="absolute -inset-1.5 animate-ping rounded-full bg-mango/25"
        aria-hidden
      />
      {numero}
    </button>
  );
}
