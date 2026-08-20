"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { MapachePlush } from "@/components/MapachePlush";
import { CATEGORIAS, PREGUNTAS, type Categoria } from "@/lib/mision";

interface Punto {
  x: number;
  y: number;
}

/**
 * Mapa vertical serpenteante con las 15 estaciones agrupadas en 5 zonas.
 * El sendero se dibuja midiendo la posición real de cada estación, así que
 * sigue cuadrando cuando cambia el ancho o el tamaño de letra.
 */
export function MapaSendero({
  indiceActual,
  onAbrirEstacion,
}: {
  indiceActual: number;
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
      estaciones.current.map((el) => {
        if (!el) return { x: 0, y: 0 };
        const r = el.getBoundingClientRect();
        return {
          x: r.left - caja.left + r.width / 2,
          y: r.top - caja.top + r.height / 2,
        };
      }),
    );
  }, []);

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

  // Lleva la estación actual al centro de la pantalla cuando avanza el mapache.
  useEffect(() => {
    const el = estaciones.current[indiceActual];
    el?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
    });
  }, [indiceActual, reduce]);

  const posicionMapache = puntos[Math.min(indiceActual, puntos.length - 1)];

  return (
    <div ref={contenedor} className="relative mx-auto w-full max-w-md px-4 pb-24">
      {/* Sendero punteado, detrás de las estaciones */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        fill="none"
      >
        {puntos.length > 1 && (
          <>
            <path
              d={trazo(puntos)}
              stroke="var(--color-selva-700)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d={trazo(puntos)}
              stroke="var(--color-oro-500)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="2 14"
              opacity="0.55"
            />
          </>
        )}
      </svg>

      <div className="relative">
        {PREGUNTAS.map((pregunta, i) => {
          const zona = CATEGORIAS.find((c) => c.id === pregunta.categoria);
          const abreZona = zona?.preguntas[0] === pregunta.numero;
          const estado =
            i < indiceActual ? "completada" : i === indiceActual ? "actual" : "bloqueada";

          return (
            <div key={pregunta.numero}>
              {abreZona && zona && <TituloZona zona={zona} activa={estado !== "bloqueada"} />}

              <div
                className="flex justify-center py-3"
                style={{ transform: `translateX(${desvio(i)}px)` }}
              >
                <div ref={(el) => void (estaciones.current[i] = el)}>
                  <Estacion
                    numero={pregunta.numero}
                    estado={estado}
                    onClick={() => estado === "actual" && onAbrirEstacion(i)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* El mapache camina hasta la estación actual */}
      {posicionMapache && (
        <motion.div
          className="pointer-events-none absolute top-0 left-0 z-20"
          initial={false}
          animate={{ x: posicionMapache.x - 34, y: posicionMapache.y - 88 }}
          transition={
            reduce ? { duration: 0 } : { type: "spring", stiffness: 90, damping: 16 }
          }
        >
          <MapachePlush className="h-[68px] w-[68px]" pose="caminando" />
        </motion.div>
      )}
    </div>
  );
}

/** Serpenteo horizontal: suave, acotado y estable entre renders. */
function desvio(i: number) {
  return Math.round(Math.sin(i * 0.85) * 74);
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

function TituloZona({ zona, activa }: { zona: Categoria; activa: boolean }) {
  return (
    <div className="relative z-10 flex justify-center pt-10 pb-2">
      <span
        className={`rounded-full px-4 py-1.5 font-display text-xs font-semibold tracking-wide uppercase transition duration-200 ${
          activa
            ? "bg-oro-500/15 text-oro-300 ring-1 ring-oro-500/30"
            : "bg-selva-800/70 text-crema/30"
        }`}
      >
        {zona.nombre}
      </span>
    </div>
  );
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
    "relative z-10 grid h-16 w-16 place-items-center rounded-full font-display text-lg font-bold transition duration-200";

  if (estado === "completada") {
    return (
      <div
        className={`${base} bg-oro-500 text-selva-950 shadow-lg shadow-oro-500/20`}
        aria-label={`Situación ${numero}, respondida`}
      >
        <Check size={26} strokeWidth={3} aria-hidden />
      </div>
    );
  }

  if (estado === "bloqueada") {
    return (
      <div
        className={`${base} bg-selva-800 text-crema/25 ring-1 ring-crema/5`}
        aria-label={`Situación ${numero}, bloqueada`}
      >
        <Lock size={20} aria-hidden />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} cursor-pointer bg-crema text-selva-900 shadow-xl shadow-oro-500/25 ring-4 ring-oro-400 hover:bg-white`}
      aria-label={`Situación ${numero}, tu parada actual. Abrir`}
    >
      <span className="absolute -inset-2 animate-ping rounded-full bg-oro-400/20" aria-hidden />
      {numero}
    </button>
  );
}
