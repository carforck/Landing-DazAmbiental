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
              stroke="rgb(21 27 13 / 0.45)"
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
                  estado === "bloqueada" ? "text-crema/30" : "text-crema/80"
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
  if (estado === "completada") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="estacion estacion-tocable cursor-pointer bg-[radial-gradient(circle_at_32%_28%,var(--color-lima-claro),var(--color-lima)_62%,#6d9a2e)] text-2xl text-selva-950 shadow-[0_10px_26px_-8px_rgba(143,191,63,0.85),inset_0_-3px_0_rgba(0,0,0,0.16)] ring-2 ring-crema/60"
        aria-label={`Parada ${numero}, respondida. Volver a ella`}
      >
        <span aria-hidden>✓</span>
      </button>
    );
  }

  if (estado === "bloqueada") {
    return (
      <div
        className="estacion bg-selva-950/50 text-xl text-crema/35 ring-2 ring-crema/12 backdrop-blur-sm"
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
      className="estacion estacion-tocable estacion-actual cursor-pointer bg-[radial-gradient(circle_at_32%_26%,var(--color-mango-claro),var(--color-mango)_58%,#d18c14)] text-2xl text-selva-950 shadow-[0_14px_34px_-6px_rgba(240,169,46,0.95),inset_0_-3px_0_rgba(0,0,0,0.18)] ring-[3px] ring-crema/75"
      aria-label={`Parada ${numero}, tu parada actual. Abrir`}
    >
      {/* Dos anillos que se expanden a distinto ritmo: llama sin parpadear */}
      <span
        className="absolute -inset-2 animate-ping rounded-full bg-mango/30"
        aria-hidden
      />
      <span
        className="absolute -inset-5 rounded-full ring-2 ring-mango/35"
        aria-hidden
      />
      {numero}
    </button>
  );
}
