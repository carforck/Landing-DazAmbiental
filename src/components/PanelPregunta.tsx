"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LETRAS, categoriaDe, type Letra, type Pregunta } from "@/lib/mision";

/**
 * Pregunta a pantalla completa sobre el mapa.
 *
 * Por pedido del cliente el feedback al elegir es puramente visual: nunca
 * revela si acertó o no.
 *
 * Se puede volver atrás y cambiar una respuesta ya dada. `respuestaPrevia` deja
 * marcada la que eligió antes, así el participante ve qué había contestado en
 * vez de encontrarse la pregunta en blanco.
 */
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
  const categoria = categoriaDe(pregunta);

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
    // Deja ver la selección antes de que el mapache avance.
    window.setTimeout(() => onResponder(letra), 620);
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Situación ${posicion} de ${total}`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="fondo-selva fixed inset-0 z-50 overflow-y-auto bg-selva-950"
    >
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 py-6 sm:px-8">
        <div className="flex items-center gap-4">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-selva-800">
            <motion.div
              className="h-full rounded-full bg-oro-500"
              initial={false}
              animate={{ width: `${(posicion / total) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <span className="font-mono text-sm text-crema/50 tabular-nums">
            {posicion}/{total}
          </span>
          <button
            type="button"
            onClick={onCerrar}
            className="cursor-pointer font-mono text-[11px] tracking-[0.16em] text-crema/40 uppercase transition-colors duration-200 hover:text-oro-300"
          >
            Mapa
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center py-8">
          {categoria && (
            <span className="font-mono text-[11px] font-bold tracking-[0.28em] text-oro-400 uppercase">
              {categoria.nombre}
            </span>
          )}
          <h1 className="titular mt-4 text-3xl text-crema sm:text-4xl">
            {pregunta.titulo}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-crema/75">
            {pregunta.escenario}
          </p>

          <div className="mt-8 space-y-3">
            {LETRAS.map((letra, i) => {
              const seleccionada = elegida === letra;
              const atenuada = elegida !== null && !seleccionada;
              return (
                <motion.button
                  key={letra}
                  type="button"
                  onClick={() => elegir(letra)}
                  disabled={bloqueado}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: atenuada ? 0.4 : 1, y: 0 }}
                  transition={{ delay: bloqueado ? 0 : 0.06 * i, duration: 0.3 }}
                  className={`flex w-full cursor-pointer items-start gap-4 rounded-2xl border p-4 text-left transition-colors duration-200 disabled:cursor-default ${
                    seleccionada
                      ? "border-oro-400 bg-oro-500/15"
                      : "border-crema/12 bg-selva-900/60 hover:border-crema/30 hover:bg-selva-900"
                  }`}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg font-bold transition-colors duration-200 ${
                      seleccionada
                        ? "bg-oro-500 text-selva-950"
                        : "bg-selva-800 font-mono text-oro-300"
                    }`}
                  >
                    {letra}
                  </span>
                  <span className="pt-1 leading-relaxed text-crema/90">
                    {pregunta.opciones[letra]}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {respuestaPrevia && !bloqueado && (
            <p className="mt-5 font-mono text-[11px] text-crema/40">
              Ya respondiste esta parada. Puedes cambiar tu elección.
            </p>
          )}

          {/* Navegación: se puede revisar lo ya contestado sin perder nada */}
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-crema/10 pt-6">
            <button
              type="button"
              onClick={onAnterior}
              disabled={!puedeAnterior}
              className="cursor-pointer font-mono text-xs tracking-[0.16em] text-crema/55 uppercase transition-colors duration-200 hover:text-oro-300 disabled:cursor-not-allowed disabled:text-crema/15"
            >
              ← Anterior
            </button>

            <p className="text-center text-xs text-crema/35">
              Aquí nadie pierde. Al final ves tu resultado.
            </p>

            <button
              type="button"
              onClick={onSiguiente}
              disabled={!puedeSiguiente}
              className="cursor-pointer font-mono text-xs tracking-[0.16em] text-crema/55 uppercase transition-colors duration-200 hover:text-oro-300 disabled:cursor-not-allowed disabled:text-crema/15"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
