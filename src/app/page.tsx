"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { HeroMedia } from "@/components/HeroMedia";
import { ROLES, TOTAL_PREGUNTAS, cuestionarioDe } from "@/lib/mision";

/*
  Landing tipográfica. Deliberadamente sin iconos, sin viñetas y sin tarjetas
  numeradas: esos tres recursos son la firma visual de las landings generadas y
  el cliente pidió alejarse de ahí. Lo que estructura la página es el tipo, las
  líneas de separación y el aire.

  Sistema tipográfico verificado contra el hero de sainet.co: Roboto en peso 900
  con tracking negativo para los titulares (la clase .titular) y Roboto Mono
  para las etiquetas. Titulares cortos, declarativos y con punto final.
*/

const aparecer = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const enVista = {
  variants: aparecer,
  initial: "hidden" as const,
  whileInView: "visible" as const,
  viewport: { once: true, margin: "-80px" },
};

/*
  Salto de sección: en vez de una regla de un pixel, cada sección sube y monta
  sobre la anterior con un canto redondeado grande. El cambio se percibe como
  una capa que se superpone, no como una línea.
*/
const MONTA =
  "relative z-10 -mt-10 rounded-t-[2rem] sm:-mt-16 sm:rounded-t-[3.5rem]";

export default function Landing() {
  return (
    <>
      <BarraSuperior />
      <main className="flex-1">
        <Hero />
        <Manifiesto />
        <Recorrido />
        <Cinta />
        <Paradas />
        <Datos />
      </main>
      <Cierre />
      <CtaMovil />
    </>
  );
}

/* ─────────── Punto final que revienta ─────────── */

/** Diez chispas repartidas en círculo; el ángulo lo lleva cada una en --a. */
const CHISPAS = Array.from({ length: 10 }, (_, i) => i * 36);

function Detonante() {
  const caja = useRef<HTMLSpanElement>(null);
  /* once:false → vuelve a dispararse cada vez que se pasa por encima */
  const aLaVista = useInView(caja, { once: false, margin: "-15% 0px" });

  /*
    El núcleo se renderiza siempre: el punto forma parte del titular y no puede
    desaparecer si el observador no ha respondido todavía. Lo que aporta entrar
    en pantalla es la clase `detonar`, y quitarla y volverla a poner es lo que
    reinicia las animaciones CSS en cada pasada.
  */
  return (
    <span
      ref={caja}
      className={`detonante${aLaVista ? " detonar" : ""}`}
      aria-hidden
    >
      <b />
      <i className="anillo" />
      {CHISPAS.map((angulo) => (
        <i
          key={angulo}
          className="chispa"
          style={{ "--a": `${angulo}deg` } as React.CSSProperties}
        />
      ))}
    </span>
  );
}

/* ─────────── Texto que se escribe a máquina ─────────── */

/**
 * `sufijo` se pinta pegado al final de la palabra y **antes** del cursor, que es
 * el orden en que se escribe de verdad: primero la letra, después el punto, y el
 * cursor siempre al final esperando. Aparece solo al terminar de teclear.
 */
function Tecleado({
  texto,
  retraso = 0,
  sufijo,
}: {
  texto: string;
  retraso?: number;
  sufijo?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const [visibles, setVisibles] = useState(reduce ? texto.length : 0);
  const completo = visibles >= texto.length;

  useEffect(() => {
    if (reduce) return;
    let i = 0;
    let tecla: number;
    const arranque = window.setTimeout(function escribir() {
      i += 1;
      setVisibles(i);
      if (i < texto.length) tecla = window.setTimeout(escribir, 85);
    }, retraso);
    return () => {
      window.clearTimeout(arranque);
      window.clearTimeout(tecla);
    };
  }, [texto, retraso, reduce]);

  return (
    <span className="font-mono tracking-tighter">
      <span aria-hidden>{texto.slice(0, visibles)}</span>
      {completo && sufijo}
      <span aria-hidden className={completo ? "cursor cursor-fin" : "cursor"}>
        |
      </span>
      <span className="sr-only">{texto}</span>
    </span>
  );
}

/* ─────────── Contador ─────────── */

/**
 * Numeral que sube hasta su valor al entrar en pantalla.
 *
 * Escribe directo en el DOM en vez de pasar por estado: son cinco contadores
 * corriendo a la vez y un `setState` por fotograma volvería a renderizar la
 * sección entera sesenta veces por segundo.
 */
function Contador({ hasta, digitos = 2 }: { hasta: number; digitos?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const aLaVista = useInView(ref, { once: false, margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const formatear = (n: number) => String(n).padStart(digitos, "0");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduce || !aLaVista) {
      el.textContent = formatear(hasta);
      return;
    }

    const control = animate(0, hasta, {
      duration: 0.7 + hasta * 0.06,
      ease: "easeOut",
      onUpdate: (v) => {
        el.textContent = formatear(Math.round(v));
      },
    });
    return () => control.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aLaVista, hasta, digitos, reduce]);

  return <span ref={ref}>{formatear(hasta)}</span>;
}

/* ─────────── Barra superior ─────────── */
function BarraSuperior() {
  return (
    <header className="absolute inset-x-0 top-0 z-40 px-6 py-6 sm:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Image
          src="/logo/daz-vertical.png"
          alt="DAZ Ambiental"
          width={200}
          height={170}
          priority
          className="h-11 w-auto brightness-0 invert opacity-80"
        />
        <Link
          href="/registro"
          className="hidden cursor-pointer font-mono text-xs font-bold tracking-[0.18em] text-crema/70 uppercase transition-colors duration-200 hover:text-oro-300 sm:block"
        >
          Comenzar
        </Link>
      </div>
    </header>
  );
}

/* ─────────── Hero ─────────── */

function Hero() {
  return (
    <section className="relative flex min-h-[96vh] items-center overflow-hidden px-6 py-24 sm:px-10">
      <HeroMedia
        webm="/hero/mapaches.webm"
        mp4="/hero/mapaches.mp4"
        poster="/hero/mapaches-poster.jpg"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="font-mono text-[11px] font-bold tracking-[0.3em] text-oro-400 uppercase"
        >
          Convivir con la naturaleza
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="titular mt-6 text-[4.2rem] text-crema drop-shadow-[0_4px_40px_rgba(0,0,0,0.6)] sm:text-[6.5rem] lg:text-[9rem]"
        >
          <span className="block">Misión</span>
          <span className="block text-oro-400">
            <Tecleado texto="Mapache" retraso={700} sufijo={<Detonante />} />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.7 }}
          className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-crema/75 drop-shadow-[0_2px_18px_rgba(0,0,0,0.65)]"
        >
          Un juego de {TOTAL_PREGUNTAS} situaciones para descubrir cómo
          convivimos con los mapaches del resort.{" "}
          <strong className="font-bold text-crema">
            Aquí nadie pierde: aquí se descubre.
          </strong>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="mt-11"
        >
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
            <Link
              href="/registro"
              className="cursor-pointer rounded-full bg-oro-500 px-10 py-4.5 text-base font-bold text-selva-950 transition-colors duration-200 hover:bg-oro-400"
            >
              Comenzar misión
            </Link>
            <a
              href="#datos"
              className="inline-flex cursor-pointer items-center px-1 py-3 text-base font-bold text-crema/85 transition-colors duration-200 hover:text-oro-300"
            >
              Cómo tratamos tus datos
            </a>
          </div>
          <p className="mt-7 font-mono text-xs tracking-wider text-crema/40 uppercase">
            {TOTAL_PREGUNTAS} paradas · cinco minutos · sin respuestas malas
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────── Manifiesto ─────────── */
function Manifiesto() {
  return (
    <section className={`${MONTA} bg-crema px-6 pt-20 pb-16 text-selva-900 sm:px-10`}>
      <motion.div {...enVista} className="mx-auto max-w-4xl">
        <h2 className="titular text-4xl sm:text-5xl">
          No es un examen.
          <br />
          Es una aventura.
        </h2>
        <div className="mt-10 space-y-6 text-lg leading-relaxed text-selva-700/85">
          <p>
            Cada parada te pone frente a algo que pasa de verdad en Barú: un
            mapache que se acerca a tu mesa, un huésped que quiere la foto, una
            caneca abierta al atardecer. Cuatro caminos posibles y tú eliges el
            tuyo.
          </p>
          <p>
            Ninguna respuesta te descalifica y nadie recibe una sanción por ser
            honesto. Al final descubres tu insignia: desde{" "}
            <strong className="font-bold">Agente de Riesgo</strong> hasta{" "}
            <strong className="font-bold">Guardián de la Fauna</strong>. ¿Hasta
            dónde llegas?
          </p>
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────── Recorrido ─────────── */
const PASOS = [
  {
    titulo: "Te presentas.",
    texto:
      "Tu nombre, tu número de contacto y si juegas como parte del equipo, como huésped o desde la comunidad.",
  },
  {
    titulo: "Sales al sendero.",
    texto: "El mapache camina contigo de parada en parada. En cada una decides qué harías.",
  },
  {
    titulo: "Ganas tu insignia.",
    texto: "Tu puntaje, tu nivel y en qué temas todavía te queda terreno por explorar.",
  },
];

function Recorrido() {
  return (
    <section className="bg-crema px-6 pb-24 text-selva-900 sm:px-10">
      <div className="mx-auto grid max-w-4xl gap-14 sm:grid-cols-3 sm:gap-8">
        {PASOS.map((paso, i) => (
          <motion.div
            key={paso.titulo}
            {...enVista}
            transition={{ delay: i * 0.1, duration: 0.6 }}
          >
            <span className="numeral-hueco block text-6xl font-black tabular-nums">
              <Contador hasta={i + 1} digitos={1} />
            </span>
            <h3 className="mt-4 text-xl font-black tracking-tight">{paso.titulo}</h3>
            <p className="mt-2 leading-relaxed text-selva-700/80">{paso.texto}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─────────── Cinta que desfila ─────────── */

/** El contenido va duplicado para que el ciclo cierre sin salto visible. */
const LEMA = "Protegemos su naturaleza, respetamos su espacio";

function Cinta() {
  const tramo = Array.from({ length: 4 }, (_, i) => (
    <span key={i} className="flex shrink-0 items-center gap-8 pr-8">
      <span>{LEMA}</span>
      <span className="text-oro-500/50" aria-hidden>
        ✳
      </span>
    </span>
  ));

  return (
    <div className="relative z-10 -mt-10 overflow-hidden bg-oro-500 py-4 sm:-mt-16">
      <div className="flex w-max font-mono text-xs font-bold tracking-[0.2em] whitespace-nowrap text-selva-950 uppercase desfile">
        <div className="flex shrink-0" aria-label={LEMA}>
          {tramo}
        </div>
        <div className="flex shrink-0" aria-hidden>
          {tramo}
        </div>
      </div>
    </div>
  );
}

/* ─────────── Paradas ─────────── */
function Paradas() {
  return (
    <section className={`${MONTA} fondo-selva bg-selva-900 px-6 pt-20 pb-24 sm:px-10`}>
      <div className="mx-auto max-w-4xl">
        <motion.h2
          {...enVista}
          className="titular text-4xl text-crema sm:text-5xl"
        >
          Tres perfiles.
          <br />
          Un sendero para cada uno.
        </motion.h2>

        <div className="mt-14">
          {ROLES.map((rol, i) => (
            <motion.div
              key={rol}
              {...enVista}
              transition={{ delay: i * 0.06, duration: 0.6 }}
              className="group flex items-center gap-6 py-5 sm:gap-10"
            >
              <span className="numeral-hueco text-5xl font-black tabular-nums sm:text-6xl">
                <Contador hasta={i + 1} />
              </span>
              <h3 className="flex-1 text-xl leading-snug font-black tracking-tight text-crema sm:text-2xl">
                {cuestionarioDe(rol).nombre}
              </h3>
              <span className="font-mono text-xs whitespace-nowrap text-crema/35">
                <Contador hasta={TOTAL_PREGUNTAS} digitos={1} /> situaciones
              </span>
            </motion.div>
          ))}
        </div>

        <motion.p {...enVista} className="mt-10 max-w-xl leading-relaxed text-crema/55">
          Cada perfil responde lo suyo: el equipo sobre los protocolos de su
          turno, los huéspedes sobre su estadía y la comunidad sobre el día a
          día del barrio.
        </motion.p>
      </div>
    </section>
  );
}

/* ─────────── Habeas data ─────────── */
function Datos() {
  return (
    <section
      id="datos"
      className="corte-diagonal relative z-10 -mt-[3.5vw] bg-crema px-6 pt-24 pb-16 text-selva-900 sm:px-10"
    >
      <motion.div {...enVista} className="mx-auto max-w-4xl">
        <p className="font-mono text-[11px] tracking-[0.28em] text-selva-700/50 uppercase">
          Tratamiento de datos
        </p>
        <h2 className="mt-5 titular text-4xl sm:text-5xl">
          Qué hacemos con
          <br />
          lo que respondes.
        </h2>
        <div className="mt-10 space-y-6 text-lg leading-relaxed text-selva-700/85">
          <p>
            Al participar autorizas a DAZ Ambiental a tratar tus datos personales
            (nombre, número de contacto y respuestas) con la única finalidad de elaborar el
            diagnóstico de convivencia con fauna silvestre y sus estadísticas
            agregadas, conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013.
          </p>
          <p>
            No se comparten con terceros ajenos a la actividad y no se usan con
            fines disciplinarios ni sancionatorios. Puedes conocer, actualizar,
            rectificar o suprimir tus datos cuando quieras escribiéndonos.
          </p>
          <p className="text-base text-selva-700/60">
            La autorización se confirma con una casilla antes de comenzar. Sin ella
            no se inicia el recorrido.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────── Cierre ─────────── */

/*
  Contacto y pie en un solo bloque. Antes eran dos secciones que repetían el
  mismo correo y el mismo teléfono, con mucho vacío entre ellas.

  El velo sobre la foto del resort es deliberadamente suave: si tapa la imagen
  del todo, la foto no aporta nada y solo pesa. La legibilidad se resuelve con
  un degradado más oscuro justo detrás del texto, no oscureciendo todo.
*/
function Cierre() {
  return (
    <footer
      id="contacto"
      className="relative overflow-hidden bg-selva-950 px-6 pt-20 pb-10 sm:px-10"
    >
      <Image
        src="/hero/mapaches-footer.webp"
        alt=""
        fill
        sizes="100vw"
        aria-hidden
        className="object-cover"
      />
      <div aria-hidden className="absolute inset-0 bg-selva-950/55" />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-selva-950 via-selva-950/35 to-selva-950/92"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-20">
          <motion.div {...enVista}>
            <h2 className="titular text-4xl text-crema sm:text-5xl">
              ¿La quieres para
              <br />
              tu equipo?
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-crema/70">
              DAZ Ambiental acompaña procesos de capacitación y manejo de fauna
              silvestre en hoteles y resorts del Caribe colombiano.
            </p>
          </motion.div>

          <motion.div
            {...enVista}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="rounded-2xl bg-selva-950/70 p-7 backdrop-blur-sm ring-1 ring-crema/10"
          >
            <p className="font-mono text-[11px] tracking-[0.24em] text-oro-400 uppercase">
              Hablemos
            </p>
            <a
              href="mailto:daz.ambiente@gmail.com"
              className="mt-3 block cursor-pointer py-2 text-lg font-bold text-crema transition-colors duration-200 hover:text-oro-300"
            >
              daz.ambiente@gmail.com
            </a>
            <a
              href="tel:+573002295181"
              className="block cursor-pointer py-2 text-lg font-bold text-crema transition-colors duration-200 hover:text-oro-300"
            >
              +57 300 2295181
            </a>
          </motion.div>
        </div>

        <motion.p
          {...enVista}
          className="titular mt-20 max-w-3xl text-3xl text-crema sm:text-[2.75rem]"
        >
          Protegemos su naturaleza,
          <br />
          <span className="text-oro-400">respetamos su espacio</span>
          <Detonante />
        </motion.p>

        <div className="mt-14 flex flex-col gap-6 border-t border-crema/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/logo/daz-vertical.png"
              alt="DAZ Ambiental"
              width={200}
              height={170}
              className="h-12 w-auto opacity-85 brightness-0 invert"
            />
            <p className="max-w-[15rem] text-xs leading-relaxed text-crema/45">
              Consultoría y manejo de fauna silvestre. Cartagena de Indias.
            </p>
          </div>
          <div className="font-mono text-[11px] text-crema/30 sm:text-right">
            <p>© {new Date().getFullYear()} DAZ Ambiental</p>
            <p className="mt-1">
              Desarrollado por{" "}
              <a
                href="https://vanttagetech.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block cursor-pointer py-2 text-crema/45 underline underline-offset-2 transition-colors duration-200 hover:text-oro-300"
              >
                vanttagetech.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────── CTA fijo en móvil ─────────── */
function CtaMovil() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-oro-500/15 bg-selva-950/95 p-3 backdrop-blur-sm sm:hidden">
      <Link
        href="/registro"
        className="block w-full cursor-pointer rounded-full bg-oro-500 py-3.5 text-center font-bold text-selva-950"
      >
        Comenzar misión
      </Link>
    </div>
  );
}
