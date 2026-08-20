"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

/**
 * Video de fondo fijo, montado sobre el póster.
 *
 * El póster se pinta de inmediato y el video entra encima solo cuando ya puede
 * reproducirse sin cortarse. Con `prefers-reduced-motion` el video ni siquiera
 * se descarga: se queda el póster.
 *
 * `velo` decide cuánto se ve el metraje. En el hero va suave porque la imagen
 * es protagonista; en pantallas donde se lee y se toca va casi opaco, para que
 * el movimiento no compita con el texto.
 */
export function FondoVideo({
  webm,
  mp4,
  poster,
  velo = "bg-selva-950/70",
  fijo = false,
}: {
  webm: string;
  mp4: string;
  poster: string;
  velo?: string;
  fijo?: boolean;
}) {
  const reduce = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el || reduce) return;

    if (el.readyState >= 4) setListo(true);
    const alPoder = () => setListo(true);
    el.addEventListener("canplaythrough", alPoder);
    return () => el.removeEventListener("canplaythrough", alPoder);
  }, [reduce]);

  return (
    <div
      aria-hidden
      className={`${fijo ? "fixed" : "absolute"} inset-0 overflow-hidden bg-selva-950`}
    >
      <Image src={poster} alt="" fill priority sizes="100vw" className="object-cover" />

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

      <div className={`absolute inset-0 ${velo}`} />
    </div>
  );
}
