"use client";

import { useState } from "react";
import {
  Lottie,
  LottieControls,
  LottieDisplay,
  LottieError,
  LottieLoading,
} from "lottie-react";

export interface ArchivoLottie {
  nombre: string;
  ruta: string;
  bytes: number;
}

/** Los tamaños reales a los que se usaría la mascota en el producto. */
const TAMANOS = [68, 144, 240];

export function VisorLottie({ archivos }: { archivos: ArchivoLottie[] }) {
  const [claro, setClaro] = useState(false);
  const [urlEscrita, setUrlEscrita] = useState("");
  const [remota, setRemota] = useState<string | null>(null);

  return (
    <main className="min-h-dvh bg-selva-950 px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="font-display text-xs font-semibold tracking-[0.3em] text-oro-400 uppercase">
          Solo en desarrollo
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-crema">
          Banco de pruebas Lottie
        </h1>
        <p className="mt-2 max-w-2xl text-crema/60">
          Copia cualquier <code className="text-oro-300">.json</code> en{" "}
          <code className="text-oro-300">public/lottie/</code> y recarga: aparece
          aquí con controles y a los tamaños reales del producto.
        </p>

        <button
          type="button"
          onClick={() => setClaro((v) => !v)}
          className="mt-6 cursor-pointer rounded-full border border-crema/20 px-4 py-2 text-sm text-crema/70 transition duration-200 hover:border-oro-500 hover:text-oro-300"
        >
          Fondo {claro ? "oscuro" : "claro"}
        </button>

        <section className="mt-8 rounded-2xl border border-crema/10 bg-selva-900/30 p-6">
          <h2 className="font-display text-lg font-semibold text-crema">
            Probar por URL
          </h2>
          <p className="mt-1 text-sm text-crema/50">
            Sirve para enlaces directos al JSON (por ejemplo de lottie.host). Si el
            servidor no permite lectura desde otro dominio, no cargará: en ese caso
            hay que descargar el archivo.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={urlEscrita}
              onChange={(e) => setUrlEscrita(e.target.value)}
              placeholder="https://lottie.host/…/animacion.json"
              className="flex-1 rounded-xl border border-crema/15 bg-selva-900/60 px-4 py-3 text-crema placeholder:text-crema/25 focus:border-oro-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setRemota(urlEscrita.trim() || null)}
              className="cursor-pointer rounded-xl bg-oro-500 px-6 py-3 font-display font-semibold text-selva-950 transition duration-200 hover:bg-oro-400"
            >
              Cargar
            </button>
          </div>
        </section>

        {remota && (
          <Tarjeta
            key={remota}
            titulo="Animación remota"
            subtitulo={remota}
            origen={remota}
            claro={claro}
          />
        )}

        {archivos.length === 0 && !remota && (
          <div className="mt-8 rounded-2xl border border-dashed border-crema/15 p-10 text-center">
            <p className="text-crema/60">
              Todavía no hay archivos en{" "}
              <code className="text-oro-300">public/lottie/</code>.
            </p>
            <p className="mt-2 text-sm text-crema/40">
              Descarga el JSON desde LottieFiles y cópialo ahí.
            </p>
          </div>
        )}

        {archivos.map((a) => (
          <Tarjeta
            key={a.ruta}
            titulo={a.nombre}
            subtitulo={`${(a.bytes / 1024).toFixed(1)} KB en disco`}
            origen={a.ruta}
            claro={claro}
          />
        ))}
      </div>
    </main>
  );
}

function Tarjeta({
  titulo,
  subtitulo,
  origen,
  claro,
}: {
  titulo: string;
  subtitulo: string;
  origen: string;
  claro: boolean;
}) {
  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-crema/10 bg-selva-900/30">
      <div className="border-b border-crema/10 p-5">
        <h2 className="truncate font-display text-lg font-semibold text-crema">
          {titulo}
        </h2>
        <p className="truncate text-xs text-crema/45">{subtitulo}</p>
      </div>

      {/* Con children, <Lottie> es la caja y el dibujo va donde se ponga
          <LottieDisplay>. LottieControls trae transporte, seek, loop y
          velocidad, así que no hace falta reimplementarlos. */}
      <div
        className={`p-6 transition-colors duration-300 ${claro ? "bg-crema" : "bg-selva-800"}`}
      >
        <Lottie src={origen} loop autoplay className="mx-auto max-w-[320px]">
          <LottieDisplay className="aspect-square" />
          <LottieLoading />
          <LottieError />
          <LottieControls />
        </Lottie>
      </div>

      {/* Los tamaños que deciden si sirve o no: el sendero usa 68 px */}
      <div
        className={`flex flex-wrap items-end justify-center gap-8 border-t border-crema/10 p-6 transition-colors duration-300 ${
          claro ? "bg-crema-200" : "bg-selva-900/60"
        }`}
      >
        {TAMANOS.map((px) => (
          <div key={px} className="text-center">
            <Lottie src={origen} loop autoplay style={{ width: px, height: px }} />
            <p
              className={`mt-2 text-xs ${claro ? "text-selva-700/60" : "text-crema/40"}`}
            >
              {px} px{px === 68 ? " · sendero" : ""}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
