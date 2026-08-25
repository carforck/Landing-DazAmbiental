"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { MapachePlush } from "@/components/MapachePlush";
import { Confetti } from "@/components/Confetti";
import { sesion, useSesion } from "@/lib/sesion";
import {
  cuestionarioDe,
  desglosePorTema,
  MAXIMO,
  nivelPara,
  preguntasDe,
  puntajeDe,
} from "@/lib/mision";

export default function ResultadosPage() {
  const router = useRouter();
  const { participante, respuestas } = useSesion();
  const enviado = useRef(false);

  useEffect(() => {
    const actual = sesion.leer();
    const p = actual.participante;
    const r = actual.respuestas;

    if (!p || Object.keys(r).length < preguntasDe(p.rol).length) {
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

  if (!participante) return null;
  const preguntas = preguntasDe(participante.rol);
  if (Object.keys(respuestas).length < preguntas.length) return null;

  const puntaje = puntajeDe(participante.rol, respuestas);
  const nivel = nivelPara(puntaje);
  const desglose = desglosePorTema(participante.rol, respuestas);
  const cuestionario = cuestionarioDe(participante.rol);
  const esBuenResultado = puntaje >= 6;

  function reiniciar() {
    sesion.limpiar();
    router.push("/");
  }

  return (
    <main className="escenario-vivo relative min-h-dvh overflow-hidden bg-crema px-6 py-12 sm:px-10">
      {esBuenResultado && <Confetti />}

      <div className="relative z-10 mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-3xl bg-white/80 p-7 shadow-[0_20px_60px_-30px_rgba(21,27,13,0.5)] ring-1 ring-selva-900/5 backdrop-blur-sm sm:p-10"
        >
          <MapachePlush
            className="h-28 w-28"
            pose={esBuenResultado ? "celebrando" : "reposo"}
          />

          <p className="mt-5 font-mono text-[11px] font-bold tracking-[0.28em] text-oro-600 uppercase">
            {participante.nombre.split(" ")[0]}, misión cumplida
          </p>

          <h1 className="titular mt-4 text-4xl text-selva-900 sm:text-5xl">
            {nivel.nombre}
            <span className="text-mango">.</span>
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-selva-700/85">
            {nivel.mensaje}
          </p>

          {/* Puntaje: el numeral es la pieza grande, no un texto más */}
          <div className="mt-8 flex items-baseline gap-4">
            <span className="titular text-[4.5rem] text-lima tabular-nums sm:text-[5.5rem]">
              <Cuenta hasta={puntaje} />
            </span>
            <span className="font-mono text-lg text-selva-700/40">de {MAXIMO}</span>
          </div>
        </motion.div>

        <section className="mt-10">
          <p className="font-mono text-[11px] tracking-[0.24em] text-selva-700/50 uppercase">
            Tema por tema · {cuestionario.nombre}
          </p>

          <div className="mt-5 space-y-3">
            {desglose.map(({ pregunta, acerto }, i) => (
              <motion.div
                key={pregunta.numero}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.09, duration: 0.45 }}
                className={`flex items-center gap-4 rounded-2xl border-2 bg-white/70 p-4 ${
                  acerto ? "border-lima/50" : "border-coral/40"
                }`}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg font-black ${
                    acerto ? "bg-lima text-selva-950" : "bg-coral/20 text-coral"
                  }`}
                  aria-hidden
                >
                  {acerto ? "✓" : "·"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold tracking-tight text-selva-900">
                    {pregunta.tema}
                  </p>
                  <p className="font-mono text-[11px] text-selva-700/50">
                    {acerto ? "Práctica adecuada" : "Vale la pena reforzarlo"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 rounded-3xl bg-selva-700 p-7 sm:p-9"
        >
          <p className="text-lg leading-relaxed text-crema/85">
            Convivir con los mapaches no es alejarlos: es no darles motivos para
            depender de nosotros. Una caneca bien cerrada o una foto tomada de
            lejos son las decisiones que los mantienen silvestres.
          </p>
          <p className="titular mt-7 text-2xl text-oro-300 sm:text-3xl">
            Protegemos su naturaleza,
            <br />
            respetamos su espacio.
          </p>
        </motion.div>

        <button
          type="button"
          onClick={reiniciar}
          className="mt-10 cursor-pointer rounded-full bg-white/70 px-6 py-3 font-mono text-xs tracking-[0.16em] text-selva-700 uppercase shadow-sm transition-colors duration-200 hover:bg-white"
        >
          Que juegue otra persona
        </button>

        <footer className="mt-10 border-t border-selva-900/10 pt-6 text-center">
          <p className="font-mono text-[11px] tracking-wide text-selva-700/45">
            © {new Date().getFullYear()} DAZ Ambiental. Todos los derechos
            reservados.
          </p>
        </footer>
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
