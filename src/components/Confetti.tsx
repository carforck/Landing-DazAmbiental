"use client";

import { motion, useReducedMotion } from "framer-motion";

const COLORES = ["#bf9c41", "#dcc47e", "#93a06d", "#faf7ee", "#6d7a4a"];

/**
 * Confetti propio en vez de una librería: 40 piezas, sin dependencias y
 * silencioso cuando el sistema pide menos movimiento.
 */
export function Confetti({ piezas = 40 }: { piezas?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {Array.from({ length: piezas }, (_, i) => {
        // Determinista: mismas posiciones en servidor y cliente, sin Math.random.
        const izquierda = ((i * 37) % 100) + (i % 3);
        const retraso = (i % 10) * 0.12;
        const duracion = 2.6 + ((i * 7) % 18) / 10;
        const giro = i % 2 ? 360 : -360;
        const ancho = 6 + (i % 4) * 2;

        return (
          <motion.span
            key={i}
            className="absolute top-0 block rounded-[2px]"
            style={{
              left: `${izquierda}%`,
              width: ancho,
              height: ancho * 1.8,
              background: COLORES[i % COLORES.length],
            }}
            initial={{ y: -40, opacity: 0, rotate: 0 }}
            animate={{ y: "105vh", opacity: [0, 1, 1, 0], rotate: giro }}
            transition={{ duration: duracion, delay: retraso, ease: "easeIn" }}
          />
        );
      })}
    </div>
  );
}
