"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lottie } from "lottie-react";
import { RastroHuellas } from "@/components/RastroHuellas";
import { sesion } from "@/lib/sesion";
import { PREGUNTAS, type Rol } from "@/lib/mision";

/*
  Pantalla en claro, a dos columnas: el formulario a la izquierda y la animación
  a la derecha.

  El fondo se mueve muy despacio y el cursor va dejando huellas de mapache.
  Ambas cosas van por debajo del umbral de atención: si compiten con el
  formulario, estorban.
*/

const ROLES: Rol[] = ["Colaborador/a", "Huésped"];

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [documento, setDocumento] = useState("");
  const [rol, setRol] = useState<Rol | null>(null);
  const [autoriza, setAutoriza] = useState(false);
  const [error, setError] = useState("");

  const listo = nombre.trim().length > 2 && documento.trim().length > 3 && rol && autoriza;

  function comenzar() {
    if (!listo) {
      setError(
        !autoriza
          ? "Necesitamos tu autorización para salir al sendero."
          : "Completa tus datos para continuar.",
      );
      return;
    }
    sesion.guardarParticipante({
      nombre: nombre.trim(),
      documento: documento.trim(),
      rol: rol!,
      autoriza: true,
    });
    router.push("/mision");
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-crema px-6 py-8 text-selva-900 sm:px-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="fondo-vivo" />
      </div>
      <RastroHuellas />

      <Link
        href="/"
        className="relative z-30 w-fit cursor-pointer font-mono text-xs tracking-[0.18em] text-selva-700/50 uppercase transition-colors duration-200 hover:text-selva-900"
      >
        Volver
      </Link>

      <div className="relative z-30 mx-auto grid max-w-6xl items-center gap-14 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* ── Formulario ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-[11px] font-bold tracking-[0.3em] text-oro-600 uppercase">
            Antes de salir
          </p>
          <h1 className="titular mt-4 text-5xl whitespace-nowrap sm:text-6xl">
            ¿Quién <span className="text-oro-600">juega?</span>
          </h1>
          <p className="mt-5 max-w-md leading-relaxed text-selva-700/80">
            Cuéntanos quién eres y salimos al sendero. Son {PREGUNTAS.length} paradas
            y unos cinco minutos.
          </p>

          <div className="mt-10 max-w-md space-y-6">
            <Campo
              etiqueta="Nombre completo"
              valor={nombre}
              onChange={setNombre}
              placeholder="Ej. María Fernanda Pérez"
              autoComplete="name"
            />
            <Campo
              etiqueta="Documento de identidad"
              valor={documento}
              onChange={(v) => setDocumento(v.replace(/\D/g, ""))}
              placeholder="Solo números"
              inputMode="numeric"
            />

            <fieldset>
              <legend className="font-mono text-[11px] tracking-[0.2em] text-selva-700/60 uppercase">
                Juegas como
              </legend>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRol(r)}
                    aria-pressed={rol === r}
                    className={`cursor-pointer rounded-xl border px-4 py-4 font-bold transition-colors duration-200 ${
                      rol === r
                        ? "border-oro-600 bg-oro-500/15 text-selva-900"
                        : "border-selva-900/15 text-selva-700/70 hover:border-selva-900/35"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="flex cursor-pointer gap-3 rounded-xl border border-selva-900/12 bg-crema-200/60 p-4">
              <input
                type="checkbox"
                checked={autoriza}
                onChange={(e) => setAutoriza(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-oro-600"
              />
              <span className="text-sm leading-relaxed text-selva-700/85">
                Autorizo a <strong className="text-selva-900">DAZ Ambiental</strong>{" "}
                el tratamiento de mis datos personales con fines del diagnóstico de
                convivencia con fauna silvestre, conforme a la Ley 1581 de 2012.{" "}
                <Link
                  href="/#datos"
                  className="text-oro-600 underline underline-offset-2"
                >
                  Ver detalle
                </Link>
              </span>
            </label>

            {error && (
              <p role="alert" className="font-mono text-xs text-oro-600">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={comenzar}
              disabled={!listo}
              className="w-full cursor-pointer rounded-full bg-selva-700 py-4 text-base font-bold text-crema transition-colors duration-200 hover:bg-selva-600 disabled:cursor-not-allowed disabled:bg-selva-900/12 disabled:text-selva-900/30"
            >
              Salir al sendero
            </button>

            <p className="font-mono text-[11px] leading-relaxed text-selva-700/50">
              Aquí nadie pierde. Tus respuestas no se usan con fines
              disciplinarios: sirven para entender al equipo.
            </p>
          </div>
        </motion.div>

        {/* ── Animación ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="order-first lg:order-none"
        >
          <Lottie
            src="/lottie/registro.json"
            loop
            autoplay
            className="mx-auto w-full max-w-[1050px]"
          />
        </motion.div>
      </div>
    </main>
  );
}

function Campo({
  etiqueta,
  valor,
  onChange,
  placeholder,
  inputMode,
  autoComplete,
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "numeric" | "text";
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] tracking-[0.2em] text-selva-700/60 uppercase">
        {etiqueta}
      </span>
      <input
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="mt-3 w-full rounded-xl border border-selva-900/15 bg-white/70 px-4 py-3.5 text-selva-900 transition-colors duration-200 placeholder:text-selva-900/25 hover:border-selva-900/30 focus:border-oro-600 focus:outline-none"
      />
    </label>
  );
}
