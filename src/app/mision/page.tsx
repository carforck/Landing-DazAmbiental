"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { MapaSendero } from "@/components/MapaSendero";
import { PanelPregunta } from "@/components/PanelPregunta";
import { sesion, useSesion } from "@/lib/sesion";
import { PREGUNTAS, type Letra } from "@/lib/mision";

export default function MisionPage() {
  const router = useRouter();
  const { participante, respuestas } = useSesion();
  // Arranca cerrado a propósito: primero se ve el sendero completo y la parada
  // que pulsa; de ahí en adelante cada situación se abre sola al avanzar.
  const [abierta, setAbierta] = useState(false);

  // Sin registro no hay misión: nombre, documento y habeas data son obligatorios.
  useEffect(() => {
    if (!sesion.leer().participante) router.replace("/registro");
  }, [router]);

  if (!participante) return null;

  const respondidas = Object.keys(respuestas).length;
  const indice = Math.min(respondidas, PREGUNTAS.length - 1);
  const pregunta = PREGUNTAS[indice];

  function responder(letra: Letra) {
    sesion.guardarRespuestas({ ...respuestas, [pregunta.numero]: letra });
    setAbierta(false);

    const completo = respondidas + 1 === PREGUNTAS.length;
    // Pausa para ver al mapache llegar a la siguiente estación.
    window.setTimeout(
      () => (completo ? router.push("/resultados") : setAbierta(true)),
      completo ? 700 : 1100,
    );
  }

  return (
    <main className="bg-follaje min-h-dvh bg-selva-950">
      <header className="sticky top-0 z-30 border-b border-oro-500/10 bg-selva-950/90 px-5 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate font-display font-semibold text-crema">
              {participante.nombre.split(" ")[0]}, este es tu sendero
            </p>
            <p className="text-xs text-crema/45">
              {respondidas} de {PREGUNTAS.length} situaciones
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-oro-500/15 px-3 py-1 font-display text-xs font-semibold text-oro-300">
            {participante.rol}
          </span>
        </div>
      </header>

      <div className="pt-6">
        <MapaSendero indiceActual={indice} onAbrirEstacion={() => setAbierta(true)} />
      </div>

      <AnimatePresence>
        {abierta && respondidas < PREGUNTAS.length && (
          <PanelPregunta
            key={pregunta.numero}
            pregunta={pregunta}
            posicion={indice + 1}
            total={PREGUNTAS.length}
            onResponder={responder}
            onCerrar={() => setAbierta(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
