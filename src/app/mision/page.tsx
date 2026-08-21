"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { MapaSendero } from "@/components/MapaSendero";
import { PanelPregunta } from "@/components/PanelPregunta";
import { FondoVideo } from "@/components/FondoVideo";
import { sesion, useSesion } from "@/lib/sesion";
import { PREGUNTAS, type Letra } from "@/lib/mision";

export default function MisionPage() {
  const router = useRouter();
  const { participante, respuestas } = useSesion();
  const [abierta, setAbierta] = useState(false);

  /*
    `indiceManual` es null mientras el participante siga el orden natural: ahí
    la parada abierta es la frontera. En cuanto navega a una anterior pasa a
    mandar él, y así puede revisar sin que el avance se lo mueva de sitio.
  */
  const [indiceManual, setIndiceManual] = useState<number | null>(null);

  useEffect(() => {
    if (!sesion.leer().participante) router.replace("/registro");
  }, [router]);

  if (!participante) return null;

  const respondidas = Object.keys(respuestas).length;
  const frontera = Math.min(respondidas, PREGUNTAS.length - 1);
  const indice = indiceManual ?? frontera;
  const pregunta = PREGUNTAS[indice];
  const previa = respuestas[pregunta.numero];

  function irA(nuevo: number) {
    if (nuevo < 0 || nuevo > frontera) return;
    setIndiceManual(nuevo === frontera ? null : nuevo);
    setAbierta(true);
  }

  function responder(letra: Letra) {
    const actualizadas = { ...respuestas, [pregunta.numero]: letra };
    sesion.guardarRespuestas(actualizadas);
    setAbierta(false);

    const completo = Object.keys(actualizadas).length === PREGUNTAS.length;
    const revisaba = Boolean(previa);

    window.setTimeout(
      () => {
        if (completo && !revisaba) {
          router.push("/resultados");
          return;
        }
        // Al corregir una parada vieja, seguimos hacia adelante desde ahí.
        setIndiceManual(revisaba ? Math.min(indice + 1, frontera) : null);
        setAbierta(true);
      },
      completo && !revisaba ? 700 : 1100,
    );
  }

  return (
    <main className="relative min-h-dvh bg-selva-950">
      {/* Velo apenas perceptible: asienta el metraje con la paleta y da un
          piso de contraste al texto, sin apagar la imagen. */}
      <FondoVideo
        webm="/hero/sendero.webm"
        mp4="/hero/sendero.mp4"
        poster="/hero/sendero-poster.jpg"
        velo="bg-selva-950/30"
      />

      <div className="relative z-10">
        <header className="sticky top-0 z-30 bg-selva-950/85 px-5 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-md items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-black tracking-tight text-crema">
                {participante.nombre.split(" ")[0]}, tu sendero
              </p>
              <p className="font-mono text-[11px] text-crema/45">
                {respondidas} de {PREGUNTAS.length} paradas
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-oro-500/15 px-3 py-1 font-mono text-[11px] tracking-wide text-oro-300">
              {participante.rol}
            </span>
          </div>
        </header>

        <div className="pt-6">
          <MapaSendero
            indiceActual={indice}
            frontera={frontera}
            onAbrirEstacion={irA}
          />
        </div>
      </div>

      <AnimatePresence>
        {abierta && (
          <PanelPregunta
            key={pregunta.numero}
            pregunta={pregunta}
            posicion={indice + 1}
            total={PREGUNTAS.length}
            respuestaPrevia={previa}
            puedeAnterior={indice > 0}
            puedeSiguiente={indice < frontera}
            onResponder={responder}
            onAnterior={() => irA(indice - 1)}
            onSiguiente={() => irA(indice + 1)}
            onCerrar={() => setAbierta(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
