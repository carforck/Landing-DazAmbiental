"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { MapaSendero } from "@/components/MapaSendero";
import { PanelPregunta } from "@/components/PanelPregunta";
import { sesion, useSesion } from "@/lib/sesion";
import { cuestionarioDe, preguntasDe, type Letra } from "@/lib/mision";

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

  // Cada perfil responde su propio cuestionario.
  const preguntas = preguntasDe(participante.rol);
  const cuestionario = cuestionarioDe(participante.rol);

  const respondidas = Object.keys(respuestas).length;
  const frontera = Math.min(respondidas, preguntas.length - 1);
  const indice = indiceManual ?? frontera;
  const pregunta = preguntas[indice];
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

    const completo = Object.keys(actualizadas).length === preguntas.length;
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
      completo && !revisaba ? 700 : 1000,
    );
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-selva-950">
      {/*
        Mapa ilustrado de fondo, fijo: el sendero se desplaza sobre él. Va en
        webp (206 KB frente a los 2.9 MB del jpeg original) y con dos tamaños,
        para no mandarle al celular una imagen de 1920 px.
      */}
      <div aria-hidden className="fixed inset-0">
        <Image
          src="/hero/mapa-juego.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 900px) 900px, 1920px"
          /* Desenfoque y desaturación: el mapa ambienta, no compite */
          className="mapa-deriva object-cover blur-[3px] saturate-[0.75]"
        />
        {/*
          Velo doble: uno parejo que baja el brillo general y un degradado que
          carga los extremos, donde van la cabecera y el final del recorrido.
          Sin esto el mapa es tan luminoso que las estaciones se pierden.
        */}
        <div className="absolute inset-0 bg-selva-950/72" />
        <div className="absolute inset-0 bg-gradient-to-b from-selva-950/92 via-selva-950/45 to-selva-950/92" />
        {/* Viñeta: cierra los bordes y empuja la mirada al centro, que es por
            donde baja la ruta */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(21,27,13,0.72)_100%)]" />
      </div>
      <div className="relative z-10">
        <header className="sticky top-0 z-30 bg-selva-950/70 px-5 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-md items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-black tracking-tight text-crema">
                {participante.nombre.split(" ")[0]}, tu sendero
              </p>
              <p className="font-mono text-[11px] text-crema/55">
                {respondidas} de {preguntas.length} paradas · {cuestionario.nombre}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-selva-700 px-3 py-1 font-mono text-[11px] tracking-wide text-oro-300">
              {participante.rol}
            </span>
          </div>
        </header>

        <div className="pt-4">
          <MapaSendero
            preguntas={preguntas}
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
            total={preguntas.length}
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
