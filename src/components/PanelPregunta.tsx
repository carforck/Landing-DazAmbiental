"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapachePlush } from "@/components/MapachePlush";
import { LETRAS, type Letra, type Pregunta } from "@/lib/mision";

/**
 * Pregunta a pantalla completa.
 *
 * Por pedido del cliente el feedback al elegir es puramente visual: nunca
 * revela si acertó o no. Por eso las cuatro opciones tienen colores distintos
 * pero ninguno significa bien o mal; el color solo las separa y le da energía a
 * la pantalla.
 *
 * Se puede volver atrás y cambiar una respuesta ya dada. `respuestaPrevia` deja
 * marcada la que eligió antes, así el participante ve qué había contestado en
 * vez de encontrarse la pregunta en blanco.
 */

/** Un color por letra. Neutros entre sí: ninguno insinúa acierto. */
const TONOS: Record<Letra, { fondo: string; texto: string; borde: string; suave: string }> = {
  A: { fondo: "bg-lima", texto: "text-selva-950", borde: "border-lima", suave: "bg-lima/10" },
  B: { fondo: "bg-agua", texto: "text-selva-950", borde: "border-agua", suave: "bg-agua/10" },
  C: { fondo: "bg-mango", texto: "text-selva-950", borde: "border-mango", suave: "bg-mango/10" },
  D: { fondo: "bg-coral", texto: "text-crema", borde: "border-coral", suave: "bg-coral/10" },
};

export function PanelPregunta({
  pregunta,
  posicion,
  total,
  respuestaPrevia,
  puedeAnterior,
  puedeSiguiente,
  onResponder,
  onAnterior,
  onSiguiente,
  onCerrar,
}: {
  pregunta: Pregunta;
  posicion: number;
  total: number;
  respuestaPrevia?: Letra;
  puedeAnterior: boolean;
  puedeSiguiente: boolean;
  onResponder: (letra: Letra) => void;
  onAnterior: () => void;
  onSiguiente: () => void;
  onCerrar: () => void;
}) {
  const [elegida, setElegida] = useState<Letra | null>(respuestaPrevia ?? null);
  const [bloqueado, setBloqueado] = useState(false);
  const avance = (posicion / total) * 100;

  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
      if (e.key === "ArrowLeft" && puedeAnterior) onAnterior();
      if (e.key === "ArrowRight" && puedeSiguiente) onSiguiente();
    };
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [onCerrar, onAnterior, onSiguiente, puedeAnterior, puedeSiguiente]);

  function elegir(letra: Letra) {
    if (bloqueado) return;
    setElegida(letra);
    setBloqueado(true);
    // Deja ver la selección antes de avanzar.
    window.setTimeout(() => onResponder(letra), 680);
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Situación ${posicion} de ${total}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="escenario-vivo fixed inset-0 z-50 overflow-y-auto bg-crema"
    >
      <div className="relative mx-auto flex min-h-dvh max-w-2xl flex-col px-5 py-6 sm:px-8">
        {/* ── Progreso ── */}
        <div className="flex items-center gap-4">
          <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-selva-900/10 inset-shadow-sm">
            <motion.div
              className="barra-relleno relative h-full overflow-hidden rounded-full"
              initial={false}
              animate={{ width: `${avance}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
            {/* El mapache va montado en la punta de la barra */}
            <motion.div
              className="pointer-events-none absolute -top-3 z-10"
              initial={false}
              animate={{ left: `calc(${avance}% - 20px)` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              <MapachePlush className="h-10 w-10 drop-shadow" pose="caminando" />
            </motion.div>
          </div>

          <span className="shrink-0 rounded-full bg-selva-700 px-3 py-1 font-mono text-xs font-bold text-crema tabular-nums">
            {posicion}/{total}
          </span>
          <button
            type="button"
            onClick={onCerrar}
            className="shrink-0 cursor-pointer font-mono text-[11px] tracking-[0.16em] text-selva-700/50 uppercase transition-colors duration-200 hover:text-selva-900"
          >
            Mapa
          </button>
        </div>

        {/* ── Pregunta ── */}
        <div className="flex flex-1 flex-col justify-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl bg-white/80 p-6 shadow-[0_18px_50px_-24px_rgba(21,27,13,0.45)] ring-1 ring-selva-900/5 backdrop-blur-sm sm:p-8"
          >
            <span className="inline-block rounded-full bg-selva-700 px-3.5 py-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-oro-300 uppercase">
              Parada {posicion} · {pregunta.tema}
            </span>
            <p className="mt-5 text-xl leading-snug font-black tracking-tight text-selva-900 sm:text-2xl">
              {pregunta.escenario}
            </p>
          </motion.div>

          {/* ── Opciones ── */}
          <div className="mt-6 space-y-3">
            {LETRAS.map((letra, i) => {
              const tono = TONOS[letra];
              const seleccionada = elegida === letra;
              const atenuada = elegida !== null && !seleccionada;

              return (
                <motion.button
                  key={letra}
                  type="button"
                  onClick={() => elegir(letra)}
                  disabled={bloqueado}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: atenuada ? 0.35 : 1, x: 0 }}
                  transition={{
                    delay: bloqueado ? 0 : 0.08 + 0.07 * i,
                    duration: 0.35,
                    ease: "easeOut",
                  }}
                  className={`opcion ${seleccionada ? "opcion-elegida" : ""} flex w-full cursor-pointer items-center gap-4 rounded-2xl border-2 p-3.5 text-left disabled:cursor-default sm:p-4 ${
                    seleccionada
                      ? `${tono.borde} ${tono.suave} shadow-[0_14px_34px_-18px_rgba(21,27,13,0.5)]`
                      : "border-selva-900/8 bg-white/75 hover:border-selva-900/20 hover:shadow-[0_14px_34px_-20px_rgba(21,27,13,0.45)]"
                  }`}
                >
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl font-mono text-lg font-bold shadow-sm ${tono.fondo} ${tono.texto}`}
                  >
                    {letra}
                  </span>
                  <span className="leading-snug font-medium text-selva-900">
                    {pregunta.opciones[letra]}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {respuestaPrevia && !bloqueado && (
            <p className="mt-5 text-center font-mono text-[11px] text-selva-700/50">
              Ya respondiste esta parada. Puedes cambiar tu elección.
            </p>
          )}

          {/* ── Navegación ── */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onAnterior}
              disabled={!puedeAnterior}
              className="cursor-pointer rounded-full bg-white/70 px-4 py-2.5 font-mono text-xs tracking-[0.14em] text-selva-700 uppercase shadow-sm transition-colors duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Anterior
            </button>

            <p className="text-center text-xs font-medium text-selva-700/50">
              Aquí nadie pierde
            </p>

            <button
              type="button"
              onClick={onSiguiente}
              disabled={!puedeSiguiente}
              className="cursor-pointer rounded-full bg-white/70 px-4 py-2.5 font-mono text-xs tracking-[0.14em] text-selva-700 uppercase shadow-sm transition-colors duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
