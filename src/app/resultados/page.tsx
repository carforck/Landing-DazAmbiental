"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
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

/*
  Mismo lenguaje que la landing: sin iconos, titulares en Roboto 900 con
  tracking negativo, etiquetas en mono y los numerales subiendo desde cero.
*/

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
    <main className="fondo-selva min-h-dvh bg-selva-950 px-6 py-12 sm:px-10">
      {esBuenResultado && <Confetti />}

      <div className="relative z-10 mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <MapachePlush
            className="h-32 w-32"
            pose={esBuenResultado ? "celebrando" : "reposo"}
          />

          <p className="mt-6 font-mono text-[11px] font-bold tracking-[0.3em] text-oro-400 uppercase">
            {participante.nombre.split(" ")[0]}, misión cumplida
          </p>

          <h1 className="titular mt-5 text-5xl text-crema sm:text-6xl">
            {nivel.nombre}
            <span className="text-oro-400">.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-crema/70">
            {nivel.mensaje}
          </p>
        </motion.div>

        {/* Puntaje: el numeral es la pieza grande, no un texto más */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex items-baseline gap-4"
        >
          <span className="titular text-[5.5rem] text-oro-400 tabular-nums sm:text-[7rem]">
            <Cuenta hasta={puntaje} />
          </span>
          <span className="font-mono text-lg text-crema/35">de {MAXIMO}</span>
        </motion.div>

        <section className="mt-16">
          <p className="font-mono text-[11px] tracking-[0.24em] text-crema/45 uppercase">
            Cómo te fue en cada parada
          </p>

          <div className="mt-8 space-y-7">
            {desglose.map(({ categoria, aciertos, total }, i) => (
              <motion.div
                key={categoria.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.08, duration: 0.5 }}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-lg font-black tracking-tight text-crema">
                    {categoria.nombre}
                  </h2>
                  <span className="font-mono text-sm text-oro-300 tabular-nums">
                    <Cuenta hasta={aciertos} /> / {total}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-selva-800">
                  <motion.div
                    className="h-full rounded-full bg-oro-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(aciertos / total) * 100}%` }}
                    transition={{ delay: 0.6 + i * 0.08, duration: 0.7, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-16"
        >
          <p className="text-lg leading-relaxed text-crema/70">
            Convivir con los mapaches no es alejarlos: es no darles motivos para
            depender de nosotros. Una caneca bien cerrada o una foto tomada de lejos
            son las decisiones que los mantienen silvestres.
          </p>
          <p className="titular mt-8 text-2xl text-oro-400 sm:text-3xl">
            Protegemos su naturaleza,
            <br />
            respetamos su espacio.
          </p>
        </motion.div>

        <button
          type="button"
          onClick={reiniciar}
          className="mt-14 cursor-pointer rounded-full border border-crema/15 px-6 py-3 font-mono text-xs tracking-[0.16em] text-crema/55 uppercase transition-colors duration-200 hover:border-oro-500 hover:text-oro-300"
        >
          Que juegue otra persona
        </button>
      </div>
    </main>
  );
}

/**
 * Numeral que sube desde cero al entrar en pantalla. Escribe directo en el DOM
 * para no re-renderizar la pantalla entera en cada fotograma.
 */
function Cuenta({ hasta }: { hasta: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const aLaVista = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduce || !aLaVista) {
      el.textContent = String(hasta);
      return;
    }

    const control = animate(0, hasta, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => control.stop();
  }, [aLaVista, hasta, reduce]);

  return <span ref={ref}>{hasta}</span>;
}
