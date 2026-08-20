"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { MapachePlush } from "@/components/MapachePlush";
import { sesion } from "@/lib/sesion";
import type { Rol } from "@/lib/mision";

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
          ? "Necesitamos tu autorización para continuar."
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
    <main className="bg-follaje flex min-h-dvh flex-col bg-selva-950 px-5 py-8 sm:px-8">
      <Link
        href="/"
        className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm text-crema/50 transition duration-200 hover:text-oro-300"
      >
        <ArrowLeft size={16} aria-hidden /> Volver
      </Link>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <MapachePlush className="h-20 w-20 shrink-0" pose="reposo" />
            <div>
              <h1 className="font-display text-3xl font-bold text-crema">
                Antes de empezar
              </h1>
              <p className="mt-1 text-crema/60">
                Cuéntanos quién eres. Toma menos de un minuto.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
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
              <legend className="font-display text-sm font-semibold text-crema/80">
                ¿Cómo participas?
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRol(r)}
                    aria-pressed={rol === r}
                    className={`cursor-pointer rounded-xl border px-4 py-3.5 font-display font-semibold transition duration-200 ${
                      rol === r
                        ? "border-oro-500 bg-oro-500/15 text-oro-300"
                        : "border-crema/15 text-crema/70 hover:border-crema/35"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="flex cursor-pointer gap-3 rounded-xl border border-crema/10 bg-selva-900/60 p-4">
              <input
                type="checkbox"
                checked={autoriza}
                onChange={(e) => setAutoriza(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-oro-500"
              />
              <span className="text-sm leading-relaxed text-crema/70">
                Autorizo a <strong className="text-crema">DAZ Ambiental</strong> el
                tratamiento de mis datos personales con fines del diagnóstico de
                convivencia con fauna silvestre, conforme a la Ley 1581 de 2012.{" "}
                <Link
                  href="/#datos"
                  className="text-oro-400 underline underline-offset-2"
                >
                  Ver detalle
                </Link>
              </span>
            </label>

            {error && (
              <p role="alert" className="text-sm text-oro-300">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={comenzar}
              disabled={!listo}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-oro-500 py-4 font-display text-base font-semibold text-selva-950 transition duration-200 hover:bg-oro-400 disabled:cursor-not-allowed disabled:bg-crema/15 disabled:text-crema/40"
            >
              Comenzar misión <ArrowRight size={18} aria-hidden />
            </button>

            <p className="flex items-start gap-2 text-xs text-crema/40">
              <ShieldCheck size={14} className="mt-0.5 shrink-0" aria-hidden />
              Tus respuestas no se usan con fines disciplinarios. Sirven para
              construir estadísticas del equipo.
            </p>
          </div>
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
      <span className="font-display text-sm font-semibold text-crema/80">
        {etiqueta}
      </span>
      <input
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-xl border border-crema/15 bg-selva-900/60 px-4 py-3.5 text-crema placeholder:text-crema/25 transition duration-200 hover:border-crema/30 focus:border-oro-500 focus:outline-none"
      />
    </label>
  );
}
