"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Estela del cursor: el mapache va dejando huellas por donde pasas.
 *
 * Se sueltan por **distancia recorrida**, no por tiempo. Si fuera por tiempo,
 * moviendo despacio quedarían amontonadas y moviendo rápido saldrían separadas;
 * por distancia el paso es siempre el mismo, que es lo que hace que se lean como
 * pisadas y no como un rastro de puntos.
 *
 * Cada huella alterna pata izquierda y derecha (desplazada en perpendicular al
 * avance) y gira hacia donde va el cursor.
 *
 * Trabaja fuera de React: un `pointermove` dispara decenas de eventos por
 * segundo y llevarlo por estado volvería a renderizar el formulario en cada uno.
 */

/** Separación entre pisadas, en píxeles. Alta a propósito: moviendo el
 *  mouse rápido, un paso corto se convierte en un borrón. */
const PASO = 108;
/** Cuánto se aparta cada pata del eje de avance. */
const ANCHO_PISADA = 9;

export function RastroHuellas() {
  const capa = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const nodoCapa = capa.current;
    const nodoHalo = halo.current;
    if (!nodoCapa || !nodoHalo) return;

    let x = 0;
    let y = 0;
    let ultimaX: number | null = null;
    let ultimaY: number | null = null;
    let acumulado = 0;
    let izquierda = true;
    let pendiente = false;

    const pintarHalo = () => {
      pendiente = false;
      nodoHalo.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const alMover = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;

      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(pintarHalo);
      }

      if (ultimaX === null || ultimaY === null) {
        ultimaX = x;
        ultimaY = y;
        return;
      }

      const dx = x - ultimaX;
      const dy = y - ultimaY;
      const tramo = Math.hypot(dx, dy);
      ultimaX = x;
      ultimaY = y;

      acumulado += tramo;
      if (acumulado < PASO) return;
      acumulado = 0;

      // Los dedos apuntan hacia donde avanza el cursor.
      const angulo = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      // Perpendicular al avance: una pata a cada lado del eje.
      const lado = izquierda ? -ANCHO_PISADA : ANCHO_PISADA;
      izquierda = !izquierda;
      const rad = Math.atan2(dy, dx);
      const px = x + Math.cos(rad + Math.PI / 2) * lado;
      const py = y + Math.sin(rad + Math.PI / 2) * lado;

      const huella = document.createElement("span");
      huella.className = "huella";
      huella.style.left = `${px}px`;
      huella.style.top = `${py}px`;
      huella.style.setProperty("--giro", `${angulo}deg`);
      huella.addEventListener("animationend", () => huella.remove(), { once: true });
      nodoCapa.appendChild(huella);
    };

    window.addEventListener("pointermove", alMover, { passive: true });
    return () => {
      window.removeEventListener("pointermove", alMover);
      nodoCapa.replaceChildren();
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      <div ref={halo} className="halo-cursor" />
      <div ref={capa} className="absolute inset-0" />
    </div>
  );
}
