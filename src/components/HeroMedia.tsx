"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

/**
 * Fondo del hero: un montaje de tomas reales con los cortes ya editados en el
 * archivo, reproducido en bucle.
 *
 * El póster (primer fotograma) se pinta de inmediato y el video entra encima
 * cuando ya puede reproducirse sin cortarse, así el hero nunca aparece vacío ni
 * bloquea el primer pintado. Es el mismo patrón que usa la referencia.
 *
 * Con `prefers-reduced-motion` el video no se carga siquiera: se queda el
 * póster. Eso ahorra megas a quien pidió menos movimiento, que suele coincidir
 * con quien tiene un equipo modesto.
 */
export function HeroMedia({
  webm,
  mp4,
  poster,
}: {
  webm: string;
  mp4: string;
  poster: string;
}) {
  const reduce = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el || reduce) return;

    // `canplaythrough` puede haber pasado antes de montar el listener.
    if (el.readyState >= 4) setListo(true);
    const alPoder = () => setListo(true);
    el.addEventListener("canplaythrough", alPoder);
    return () => el.removeEventListener("canplaythrough", alPoder);
  }, [reduce]);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-selva-950">
      <Image
        src={poster}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {!reduce && (
        <video
          ref={video}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          poster={poster}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            listo ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src={webm} type="video/webm" />
          <source src={mp4} type="video/mp4" />
        </video>
      )}

      {/* Velo: sin él el titular no alcanza contraste legible sobre el metraje */}
      <div className="absolute inset-0 bg-selva-950/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-selva-950/85 via-selva-950/25 to-selva-950" />
    </div>
  );
}
