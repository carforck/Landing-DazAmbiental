"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { LETRAS, categoriaDe, type Letra, type Pregunta } from "@/lib/mision";

/**
 * Pregunta a pantalla completa sobre el mapa. Por pedido del cliente, el
 * feedback al elegir es puramente visual: nunca revela si acertó o no.
 */
export function PanelPregunta({
  pregunta,
  posicion,
  total,
  onResponder,
  onCerrar,
}: {
  pregunta: Pregunta;
  posicion: number;
  total: number;
  onResponder: (letra: Letra) => void;
  onCerrar: () => void;
}) {
  const [elegida, setElegida] = useState<Letra | null>(null);
  const categoria = categoriaDe(pregunta);

  // No hace falta resetear `elegida`: el panel se monta por pregunta (key en
  // AnimatePresence), así que cada situación arranca con el estado limpio.

  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [onCerrar]);

  function elegir(letra: Letra) {
    if (elegida) return;
    setElegida(letra);
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
      className="fixed inset-0 z-50 overflow-y-auto bg-selva-950"
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
          <span className="font-display text-sm font-semibold text-crema/50 tabular-nums">
            {posicion}/{total}
          </span>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Volver al mapa"
            className="cursor-pointer rounded-full p-1.5 text-crema/40 transition duration-200 hover:bg-crema/10 hover:text-crema"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center py-8">
          {categoria && (
            <span className="font-display text-xs font-semibold tracking-[0.2em] text-oro-400 uppercase">
              {categoria.nombre}
            </span>
          )}
          <h1 className="mt-3 font-display text-2xl leading-tight font-bold text-crema sm:text-3xl">
            {pregunta.titulo}
          </h1>
          <p className="mt-4 leading-relaxed text-crema/75">{pregunta.escenario}</p>

          <div className="mt-8 space-y-3">
            {LETRAS.map((letra, i) => {
              const seleccionada = elegida === letra;
              const atenuada = elegida !== null && !seleccionada;
              return (
                <motion.button
                  key={letra}
                  type="button"
                  onClick={() => elegir(letra)}
                  disabled={elegida !== null}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: atenuada ? 0.35 : 1, y: 0 }}
                  transition={{ delay: elegida ? 0 : 0.06 * i, duration: 0.3 }}
                  className={`flex w-full cursor-pointer items-start gap-4 rounded-2xl border p-4 text-left transition-colors duration-200 disabled:cursor-default ${
                    seleccionada
                      ? "border-oro-400 bg-oro-500/15"
                      : "border-crema/12 bg-selva-900/60 hover:border-crema/30 hover:bg-selva-900"
                  }`}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg font-display font-bold transition-colors duration-200 ${
                      seleccionada
                        ? "bg-oro-500 text-selva-950"
                        : "bg-selva-800 text-oro-300"
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

          <p className="mt-6 text-center text-xs text-crema/35">
            No te decimos si acertaste: al final verás tu resultado completo.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
