"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Camera,
  Utensils,
  Footprints,
  Trash2,
  HeartPulse,
  ShieldCheck,
  Clock,
  MapPin,
  ArrowRight,
  Mail,
  Phone,
} from "lucide-react";
import { MapachePlush } from "@/components/MapachePlush";
import config from "@/config/preguntas.json";

const ICONOS = {
  camera: Camera,
  utensils: Utensils,
  footprints: Footprints,
  "trash-2": Trash2,
  "heart-pulse": HeartPulse,
} as const;

const aparecer = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Landing() {
  return (
    <>
      <main className="flex-1">
        <Hero />
        <Proposito />
        <ComoFunciona />
        <Categorias />
        <HabeasData />
        <Contacto />
      </main>
      <Footer />
      <CtaMovil />
    </>
  );
}

/* ─────────── Hero ─────────── */
function Hero() {
  return (
    <section className="bg-follaje relative overflow-hidden bg-selva-950 px-5 pt-8 pb-20 sm:px-8">
      {/* Resplandor cálido detrás de la mascota */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-oro-500/10 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="w-full text-center lg:w-1/2 lg:text-left">
          <Image
            src="/logo/daz-vertical.png"
            alt="Logo de DAZ Ambiental"
            width={200}
            height={170}
            priority
            className="mx-auto h-20 w-auto brightness-0 invert opacity-90 lg:mx-0"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-10 font-display text-xs font-semibold tracking-[0.35em] text-oro-400 uppercase"
          >
            Convivir con la naturaleza
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mt-4 font-display text-5xl leading-[1.05] font-bold text-crema sm:text-6xl lg:text-7xl"
          >
            Misión
            <span className="block text-oro-400">Mapache</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-crema/75 lg:mx-0"
          >
            Un recorrido por {config.preguntas.length} situaciones que pasan de verdad
            en el resort. Aquí no venimos a juzgar:{" "}
            <span className="text-crema">venimos a descubrir</span> cómo convivimos
            con la fauna que vive aquí.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:justify-start"
          >
            <Link
              href="/registro"
              className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-oro-500 px-8 py-4 font-display text-base font-semibold text-selva-950 shadow-lg shadow-oro-500/20 transition duration-200 hover:bg-oro-400 sm:w-auto"
            >
              Comenzar misión
              <ArrowRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
            <div className="flex items-center gap-4 text-sm text-crema/55">
              <span className="inline-flex items-center gap-1.5">
                <Clock size={15} className="text-oro-400" /> 5 minutos
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={15} className="text-oro-400" />
                {config.categorias.length} paradas
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-sm lg:w-1/2 lg:max-w-md"
        >
          <MapachePlush className="w-full drop-shadow-2xl" pose="reposo" />
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────── Propósito ─────────── */
function Proposito() {
  return (
    <section className="bg-crema px-5 py-20 text-selva-900 sm:px-8">
      <motion.div
        variants={aparecer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          No es un examen. Es una conversación.
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-selva-700/80">
          Cada situación tiene cuatro caminos posibles y ninguno te descalifica.
          Queremos entender cómo reacciona el equipo cuando aparece un mapache, para
          reforzar lo que ya se hace bien y acompañar lo que falta.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-selva-700/80">
          Al final verás tu resultado y en qué nivel quedaste. Nadie recibe una
          sanción por responder con honestidad.
        </p>
      </motion.div>
    </section>
  );
}

/* ─────────── Cómo funciona ─────────── */
const PASOS = [
  {
    n: "01",
    titulo: "Te registras",
    texto:
      "Tu nombre, documento y si eres parte del equipo o huésped. Toma menos de un minuto.",
  },
  {
    n: "02",
    titulo: "Recorres el sendero",
    texto:
      "El mapache avanza de estación en estación. En cada parada eliges qué harías tú.",
  },
  {
    n: "03",
    titulo: "Descubres tu nivel",
    texto:
      "Al terminar conoces tu puntaje, tu insignia y en qué temas vale la pena reforzar.",
  },
];

function ComoFunciona() {
  return (
    <section className="bg-crema-200 px-5 py-20 text-selva-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">
          Cómo funciona
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PASOS.map((p, i) => (
            <motion.div
              key={p.n}
              variants={aparecer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-crema p-7 shadow-sm ring-1 ring-selva-900/5"
            >
              <span className="font-display text-4xl font-bold text-oro-500/60">
                {p.n}
              </span>
              <h3 className="mt-3 font-display text-xl font-semibold">{p.titulo}</h3>
              <p className="mt-2 leading-relaxed text-selva-700/75">{p.texto}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── Categorías ─────────── */
function Categorias() {
  return (
    <section className="bg-follaje bg-selva-900 px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-display text-3xl font-bold text-crema sm:text-4xl">
          Las paradas del recorrido
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-crema/65">
          Cinco temas que cubren lo que pasa a diario: desde la foto de más cerca
          hasta qué hacer si alguien sale lastimado.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {config.categorias.map((cat, i) => {
            const Icono = ICONOS[cat.icono as keyof typeof ICONOS];
            return (
              <motion.div
                key={cat.id}
                variants={aparecer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl border border-oro-500/15 bg-selva-800/60 p-6 transition duration-200 hover:border-oro-500/40"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-oro-500/15 text-oro-400">
                  <Icono size={20} aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-crema">
                  {cat.nombre}
                </h3>
                <p className="mt-1 text-sm text-crema/55">
                  {cat.preguntas.length}{" "}
                  {cat.preguntas.length === 1 ? "situación" : "situaciones"}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────── Habeas data ─────────── */
function HabeasData() {
  return (
    <section id="datos" className="bg-crema px-5 py-20 text-selva-900 sm:px-8">
      <motion.div
        variants={aparecer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-3xl rounded-2xl bg-crema-200 p-8 ring-1 ring-selva-900/5 sm:p-10"
      >
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-selva-700 text-oro-300">
          <ShieldCheck size={20} aria-hidden />
        </span>
        <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
          Qué hacemos con tus datos
        </h2>
        <p className="mt-4 leading-relaxed text-selva-700/80">
          Al participar autorizas a <strong>DAZ Ambiental</strong> a tratar tus datos
          personales (nombre, documento y respuestas) con la única finalidad de
          elaborar el diagnóstico de convivencia con fauna silvestre y sus
          estadísticas agregadas, conforme a la{" "}
          <strong>Ley 1581 de 2012</strong> y el <strong>Decreto 1377 de 2013</strong>.
        </p>
        <ul className="mt-5 space-y-2 text-selva-700/80">
          <li>· No se comparten con terceros ajenos a la actividad.</li>
          <li>· No se usan con fines disciplinarios ni sancionatorios.</li>
          <li>
            · Puedes conocer, actualizar, rectificar o suprimir tus datos cuando
            quieras escribiéndonos.
          </li>
        </ul>
        <p className="mt-5 text-sm text-selva-700/60">
          La autorización se confirma con una casilla antes de comenzar. Sin ella no
          se inicia el recorrido.
        </p>
      </motion.div>
    </section>
  );
}

/* ─────────── Contacto ─────────── */
function Contacto() {
  return (
    <section id="contacto" className="bg-selva-950 px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-bold text-crema sm:text-4xl">
          ¿Quieres esta actividad para tu equipo?
        </h2>
        <p className="mt-4 text-crema/65">
          DAZ Ambiental acompaña procesos de capacitación y manejo de fauna en
          hoteles y resorts.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="mailto:contacto@dazambiental.com"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-oro-500/30 px-6 py-3 text-crema transition duration-200 hover:border-oro-500 hover:text-oro-300"
          >
            <Mail size={17} aria-hidden /> Escríbenos
          </a>
          <a
            href="tel:+573105080356"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-oro-500/30 px-6 py-3 text-crema transition duration-200 hover:border-oro-500 hover:text-oro-300"
          >
            <Phone size={17} aria-hidden /> Llámanos
          </a>
        </div>
        <p className="mt-4 text-xs text-crema/35">
          Datos de contacto por confirmar con el cliente.
        </p>
      </div>
    </section>
  );
}

/* ─────────── Footer ─────────── */
function Footer() {
  return (
    <footer className="border-t border-oro-500/10 bg-selva-950 px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
        <p className="font-display text-lg text-oro-400">
          Protegemos su naturaleza, respetamos su espacio
        </p>
        <p className="text-xs text-crema/35">
          © {new Date().getFullYear()} DAZ Ambiental · Misión Mapache
        </p>
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
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-oro-500 py-3.5 font-display font-semibold text-selva-950"
      >
        Comenzar misión <ArrowRight size={18} />
      </Link>
    </div>
  );
}
