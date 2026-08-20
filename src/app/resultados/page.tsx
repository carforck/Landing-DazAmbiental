"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Camera,
  Utensils,
  Footprints,
  Trash2,
  HeartPulse,
  RotateCcw,
  Award,
} from "lucide-react";
import { MapachePlush } from "@/components/MapachePlush";
import { Confetti } from "@/components/Confetti";
import { sesion, useSesion } from "@/lib/sesion";
import {
  desglosePorCategoria,
  MAXIMO,
  nivelPara,
  PREGUNTAS,
  puntajeDe,
} from "@/lib/mision";

const ICONOS = {
  camera: Camera,
  utensils: Utensils,
  footprints: Footprints,
  "trash-2": Trash2,
  "heart-pulse": HeartPulse,
} as const;

export default function ResultadosPage() {
  const router = useRouter();
  const { participante, respuestas } = useSesion();
  const enviado = useRef(false);

  useEffect(() => {
    const actual = sesion.leer();
    const p = actual.participante;
    const r = actual.respuestas;

    if (!p || Object.keys(r).length < PREGUNTAS.length) {
      router.replace(p ? "/mision" : "/registro");
      return;
    }

    // Una sola vez por sesión, aunque React monte el efecto dos veces en dev.
    if (enviado.current || actual.enviado) return;
    enviado.current = true;
    sesion.marcarEnviado();

    fetch("/api/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participante: p, respuestas: r }),
    }).catch(() => {
      /* El participante ya terminó: un fallo de red no debe romper su pantalla. */
    });
  }, [router]);

  if (!participante || Object.keys(respuestas).length < PREGUNTAS.length) return null;

  const puntaje = puntajeDe(respuestas);
  const nivel = nivelPara(puntaje);
  const desglose = desglosePorCategoria(respuestas);
  const esBuenResultado = puntaje >= 9;

  function reiniciar() {
    sesion.limpiar();
    router.push("/");
  }

  return (
    <main className="bg-follaje min-h-dvh bg-selva-950 px-5 py-10 sm:px-8">
      {esBuenResultado && <Confetti />}

      <div className="relative z-10 mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center"
        >
          <MapachePlush
            className="mx-auto h-36 w-36"
            pose={esBuenResultado ? "celebrando" : "reposo"}
          />

          <p className="mt-4 text-crema/60">
            {participante.nombre.split(" ")[0]}, terminaste tu misión
          </p>

          <div className="mt-6 flex items-baseline justify-center gap-2">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="font-display text-7xl font-bold text-oro-400 tabular-nums"
            >
              {puntaje}
            </motion.span>
            <span className="font-display text-2xl text-crema/40">/ {MAXIMO}</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-oro-500/15 px-5 py-2.5 ring-1 ring-oro-500/30"
          >
            <Award size={18} className="text-oro-400" aria-hidden />
            <span className="font-display text-lg font-semibold text-oro-300">
              {nivel.nombre}
            </span>
          </motion.div>

          <p className="mx-auto mt-5 max-w-md leading-relaxed text-crema/70">
            {nivel.mensaje}
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-12"
        >
          <h2 className="font-display text-lg font-semibold text-crema">
            Cómo te fue en cada tema
          </h2>
          <div className="mt-4 space-y-3">
            {desglose.map(({ categoria, aciertos, total }) => {
              const Icono = ICONOS[categoria.icono as keyof typeof ICONOS];
              return (
                <div
                  key={categoria.id}
                  className="rounded-2xl border border-crema/10 bg-selva-900/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-oro-500/15 text-oro-400">
                      <Icono size={17} aria-hidden />
                    </span>
                    <span className="flex-1 font-display font-semibold text-crema">
                      {categoria.nombre}
                    </span>
                    <span className="font-display font-bold text-oro-300 tabular-nums">
                      {aciertos}/{total}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-selva-800">
                    <motion.div
                      className="h-full rounded-full bg-oro-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(aciertos / total) * 100}%` }}
                      transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-10 rounded-2xl border border-oro-500/20 bg-selva-900/50 p-6 text-center"
        >
          <p className="leading-relaxed text-crema/75">
            Convivir con los mapaches no es alejarlos: es no darles motivos para
            depender de nosotros. Cada decisión pequeña —una caneca cerrada, una foto
            de lejos— es la que los mantiene silvestres.
          </p>
          <p className="mt-4 font-display text-oro-400">
            Protegemos su naturaleza, respetamos su espacio
          </p>
        </motion.div>

        <button
          type="button"
          onClick={reiniciar}
          className="mx-auto mt-8 flex cursor-pointer items-center gap-2 rounded-full border border-crema/15 px-6 py-3 text-sm text-crema/60 transition duration-200 hover:border-crema/35 hover:text-crema"
        >
          <RotateCcw size={16} aria-hidden /> Que participe otra persona
        </button>
      </div>
    </main>
  );
}
