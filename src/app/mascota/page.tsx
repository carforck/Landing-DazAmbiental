"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MapachePlush, type PoseMapache } from "@/components/MapachePlush";

/*
  Pantalla interna de validación de la mascota. No está enlazada desde la
  landing; se borra cuando el diseño quede aprobado.
*/

const POSES: { pose: PoseMapache; nombre: string; uso: string }[] = [
  { pose: "reposo", nombre: "Reposo", uso: "Hero de la landing y registro" },
  { pose: "caminando", nombre: "Caminando", uso: "Avance entre estaciones del sendero" },
  { pose: "celebrando", nombre: "Celebrando", uso: "Pantalla de resultados" },
];

export default function ValidarMascota() {
  const [claro, setClaro] = useState(false);

  return (
    <main className="min-h-dvh bg-selva-950 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex cursor-pointer items-center gap-2 text-sm text-crema/50 transition duration-200 hover:text-oro-300"
        >
          <ArrowLeft size={16} aria-hidden /> Volver a la landing
        </Link>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-xs font-semibold tracking-[0.3em] text-oro-400 uppercase">
              Mascota · dirección plush 3D
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold text-crema">
              Así queda el mapache
            </h1>
            <p className="mt-2 max-w-2xl text-crema/60">
              Volumen redondo, pelaje afelpado y ojos vidriosos como la referencia
              que mandaste, pero dibujado en SVG: pesa pocos KB, anima con código y
              no se pixela en ningún tamaño.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setClaro((v) => !v)}
            className="cursor-pointer rounded-full border border-crema/20 px-4 py-2 text-sm text-crema/70 transition duration-200 hover:border-oro-500 hover:text-oro-300"
          >
            Ver sobre fondo {claro ? "oscuro" : "claro"}
          </button>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {POSES.map((p) => (
            <article
              key={p.pose}
              className="overflow-hidden rounded-2xl border border-crema/10 bg-selva-900/40"
            >
              <div
                className={`bg-follaje grid aspect-square place-items-center p-8 transition-colors duration-300 ${
                  claro ? "bg-crema" : "bg-selva-800"
                }`}
              >
                <MapachePlush className="w-full max-w-[260px]" pose={p.pose} />
              </div>
              <div className="p-5">
                <h2 className="font-display text-xl font-bold text-crema">{p.nombre}</h2>
                <p className="mt-1 text-sm text-crema/55">{p.uso}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Prueba de legibilidad en los tamaños reales del producto */}
        <section className="mt-10 rounded-2xl border border-crema/10 bg-selva-900/40 p-6">
          <h2 className="font-display text-lg font-semibold text-crema">
            A los tamaños que se usa de verdad
          </h2>
          <p className="mt-1 text-sm text-crema/55">
            Lo que más importa: que siga leyéndose como mapache cuando va chiquito
            sobre el sendero.
          </p>
          <div className="mt-6 flex flex-wrap items-end gap-10">
            {[
              { px: 44, etiqueta: "44 px · avatar" },
              { px: 68, etiqueta: "68 px · sendero" },
              { px: 144, etiqueta: "144 px · resultados" },
              { px: 240, etiqueta: "240 px · hero" },
            ].map((t) => (
              <div key={t.px} className="text-center">
                <MapachePlush style={{ width: t.px }} pose="reposo" />
                <p className="mt-2 text-xs text-crema/40">{t.etiqueta}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-8 text-sm text-crema/40">
          Dibujo original hecho para este proyecto. Toma de la referencia el
          lenguaje visual (proporciones, volumen, brillos), que es libre. No
          reproduce ningún personaje ni modelo de terceros.
        </p>
      </div>
    </main>
  );
}
