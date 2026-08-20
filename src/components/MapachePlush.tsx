"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Mascota de Misión Mapache — cartoon 3D.
 *
 * Rasgos que definen el personaje, tomados de la referencia aprobada:
 *  · cara crema con el antifaz oscuro como banda ancha sobre los ojos, partida
 *    por una cuña clara que sube hasta la frente
 *  · orejas grandes con interior rosado y fleco de pelo crema
 *  · ojos con iris ámbar, pupila amplia y doble brillo (el ámbar además amarra
 *    con el dorado del logo de DAZ)
 *  · textura de pelo a trazos en pecho y mejillas, no superficies lisas
 *  · cola delgada de anillos, enroscada hacia arriba
 *
 * El volumen se consigue con degradados radiales, oclusión difuminada en los
 * pliegues, luz de borde arriba y sombra de contacto en el piso. Al ser SVG
 * anima con código, pesa pocos KB y no se pixela a ningún tamaño.
 *
 * Dibujo original: no reproduce ningún personaje ni modelo de terceros.
 */
export type PoseMapache = "reposo" | "caminando" | "celebrando";

export function MapachePlush({
  className = "",
  pose = "reposo",
  style,
}: {
  className?: string;
  pose?: PoseMapache;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  const celebra = pose === "celebrando";

  const cuerpo = reduce
    ? {}
    : celebra
      ? {
          y: [0, -14, 0],
          transition: { duration: 0.75, repeat: Infinity, ease: "easeOut" as const },
        }
      : {
          scale: [1, 1.018, 1],
          transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const },
        };

  const cola = reduce
    ? {}
    : {
        rotate: celebra ? [0, 13, 0, -13, 0] : [0, 5, 0, -5, 0],
        transition: {
          duration: celebra ? 1.1 : 4.2,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      };

  const brazos = reduce
    ? {}
    : celebra
      ? { rotate: [-34, -48, -34], transition: { duration: 0.75, repeat: Infinity } }
      : pose === "caminando"
        ? {
            rotate: [5, -5, 5],
            transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut" as const },
          }
        : {};

  return (
    <motion.svg
      viewBox="0 0 280 300"
      role="img"
      aria-label="Mapache, la mascota guía de la misión"
      className={className}
      animate={cuerpo}
      style={{ originX: "140px", originY: "284px", ...style }}
    >
      <defs>
        <radialGradient id="mp-cabeza" cx="0.36" cy="0.24" r="0.86">
          <stop offset="0%" stopColor="#a79c90" />
          <stop offset="55%" stopColor="#867b70" />
          <stop offset="100%" stopColor="#5a5148" />
        </radialGradient>
        <radialGradient id="mp-cuerpo" cx="0.36" cy="0.2" r="0.88">
          <stop offset="0%" stopColor="#9b9084" />
          <stop offset="58%" stopColor="#786e63" />
          <stop offset="100%" stopColor="#4c443c" />
        </radialGradient>
        <radialGradient id="mp-crema" cx="0.42" cy="0.22" r="0.82">
          <stop offset="0%" stopColor="#faf3e9" />
          <stop offset="100%" stopColor="#ddd1c2" />
        </radialGradient>
        <linearGradient id="mp-antifaz" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6a5f55" />
          <stop offset="100%" stopColor="#39322c" />
        </linearGradient>
        <radialGradient id="mp-oreja" cx="0.5" cy="0.4" r="0.72">
          <stop offset="0%" stopColor="#f6a7ad" />
          <stop offset="100%" stopColor="#cf737d" />
        </radialGradient>
        <radialGradient id="mp-iris" cx="0.36" cy="0.28" r="0.8">
          <stop offset="0%" stopColor="#f7c463" />
          <stop offset="45%" stopColor="#e0982c" />
          <stop offset="100%" stopColor="#96590f" />
        </radialGradient>
        <linearGradient id="mp-colaClara" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b3a89b" />
          <stop offset="100%" stopColor="#877c71" />
        </linearGradient>

        <filter id="mp-suave" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="mp-suavito" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>

      {/* Sombra de contacto */}
      <ellipse
        cx="140"
        cy="286"
        rx="74"
        ry="12"
        fill="#2e2823"
        opacity="0.35"
        filter="url(#mp-suave)"
      />

      {/* ── Cola delgada, enroscada hacia arriba por el costado ── */}
      <motion.g style={{ originX: "96px", originY: "230px" }} animate={cola}>
        <path
          d="M96 230c-32 2-52 16-56 38-3 17 8 29 24 27 13-2 20-13 17-24"
          fill="none"
          stroke="url(#mp-colaClara)"
          strokeWidth="34"
          strokeLinecap="round"
        />
        <path d="M64 240c-11 5-19 13-23 24" stroke="#3f3830" strokeWidth="33" strokeLinecap="round" fill="none" />
        <path d="M40 278c-1 11 6 19 16 20" stroke="#3f3830" strokeWidth="30" strokeLinecap="round" fill="none" />
        <path d="M81 268c3 9-2 17-11 19" stroke="#3f3830" strokeWidth="26" strokeLinecap="round" fill="none" />
      </motion.g>

      {/* ── Pies ── */}
      <ellipse cx="108" cy="272" rx="25" ry="16" fill="#4f473f" />
      <ellipse cx="172" cy="272" rx="25" ry="16" fill="#4f473f" />
      <g stroke="#39322c" strokeWidth="2.5" strokeLinecap="round" opacity="0.7">
        <path d="M100 268v8M108 266v10M116 268v8" />
        <path d="M164 268v8M172 266v10M180 268v8" />
      </g>

      {/* ── Cuerpo ── */}
      <ellipse cx="140" cy="216" rx="70" ry="60" fill="url(#mp-cuerpo)" />
      <ellipse
        cx="140"
        cy="166"
        rx="52"
        ry="18"
        fill="#2f2925"
        opacity="0.45"
        filter="url(#mp-suave)"
      />

      {/* Pecho crema con textura de pelo a trazos */}
      <ellipse cx="140" cy="222" rx="44" ry="48" fill="url(#mp-crema)" />
      <g stroke="#c9bcab" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" fill="none">
        <path d="M112 192q6 12 2 24M126 186q5 14 1 27M140 184q4 15 0 28M154 186q-5 14-1 27M168 192q-6 12-2 24" />
        <path d="M108 224q7 11 3 22M140 222q3 13-1 24M172 224q-7 11-3 22" />
      </g>

      {/* Bracitos al frente, sin nada en las manos: el diagnóstico enseña
          justamente a no darles comida ni a manipularlos */}
      <motion.g style={{ originX: "90px", originY: "196px" }} animate={brazos}>
        <ellipse cx="88" cy="216" rx="17" ry="25" fill="#6d6359" transform="rotate(-16 88 216)" />
        <ellipse cx="84" cy="234" rx="12" ry="10" fill="#463f38" />
      </motion.g>
      <motion.g style={{ originX: "190px", originY: "196px" }} animate={brazos}>
        <ellipse cx="192" cy="216" rx="17" ry="25" fill="#6d6359" transform="rotate(16 192 216)" />
        <ellipse cx="196" cy="234" rx="12" ry="10" fill="#463f38" />
      </motion.g>

      {/* ── Orejas grandes, altas y separadas ── */}
      <Oreja cx={74} cy={56} rot={-15} />
      <Oreja cx={206} cy={56} rot={15} />

      {/* ── Cabeza ── */}
      <ellipse cx="140" cy="112" rx="82" ry="74" fill="url(#mp-cabeza)" />

      {/* Cara crema: cubre mejillas, hocico y la cuña que sube a la frente */}
      <path
        d="M140 44c30 0 54 14 66 36 10 19 10 42 0 60-12 22-36 36-66 36s-54-14-66-36c-10-18-10-41 0-60 12-22 36-36 66-36z"
        fill="url(#mp-crema)"
      />

      {/* Antifaz: banda ancha sobre los ojos, partida por la cuña clara */}
      <path
        d="M60 106c1-30 24-48 52-42 13 3 21 13 24 27l4 22 4-22c3-14 11-24 24-27 28-6 51 12 52 42 1 28-20 48-48 46-16-1-27-9-32-21-5 12-16 20-32 21-28 2-49-18-48-46z"
        fill="url(#mp-antifaz)"
      />

      {/* Luz de borde en la coronilla */}
      <path
        d="M84 66c15-18 34-26 56-26s41 8 56 26"
        fill="none"
        stroke="#ffffff"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.26"
        filter="url(#mp-suavito)"
      />

      {/* Mechones de pelo en las mejillas */}
      <Mechones />
      <Mechones espejo />

      {/* ── Ojos ── */}
      <Ojo cx={104} cy={112} reduce={!!reduce} feliz={celebra} />
      <Ojo cx={176} cy={112} reduce={!!reduce} feliz={celebra} />

      {/* ── Hocico ── */}
      <ellipse
        cx="140"
        cy="152"
        rx="30"
        ry="22"
        fill="#ffffff"
        opacity="0.45"
        filter="url(#mp-suavito)"
      />
      <ellipse cx="140" cy="148" rx="14" ry="11" fill="#1d1815" />
      <ellipse cx="135" cy="144" rx="5" ry="3.5" fill="#ffffff" opacity="0.5" />

      {/* Sonrisa pequeña y cerrada, con el labio rosado apenas asomando */}
      {celebra ? (
        <>
          <path d="M124 166q16 24 32 0z" fill="#3a2c28" />
          <path d="M133 178q7 8 14 0z" fill="#e08a92" />
        </>
      ) : (
        <>
          <path d="M140 158v6" stroke="#1d1815" strokeWidth="3.5" strokeLinecap="round" />
          <path
            d="M124 166q8 10 16 2 8 8 16-2"
            fill="none"
            stroke="#1d1815"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path d="M133 172q7 7 14 0z" fill="#e08a92" />
        </>
      )}
    </motion.svg>
  );
}

function Oreja({ cx, cy, rot }: { cx: number; cy: number; rot: number }) {
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      {/* Forma alta y redondeada, no un círculo */}
      <path
        d={`M${cx} ${cy - 44}c20 0 34 20 34 42s-14 34-34 34-34-12-34-34 14-42 34-42z`}
        fill="#635a51"
      />
      <path
        d={`M${cx} ${cy - 30}c13 0 22 14 22 29s-9 23-22 23-22-8-22-23 9-29 22-29z`}
        fill="url(#mp-oreja)"
      />
      {/* Fleco crema alrededor del interior */}
      <g stroke="#f2e8db" strokeWidth="4" strokeLinecap="round" opacity="0.9" fill="none">
        <path d={`M${cx - 22} ${cy - 4}l-8-6M${cx - 24} ${cy + 10}l-9-2M${cx - 20} ${cy + 22}l-8 4`} />
        <path d={`M${cx + 22} ${cy - 4}l8-6M${cx + 24} ${cy + 10}l9-2M${cx + 20} ${cy + 22}l8 4`} />
      </g>
    </g>
  );
}

/** Pelo saliendo en punta a los lados de la cara. */
function Mechones({ espejo = false }: { espejo?: boolean }) {
  return (
    <g transform={espejo ? "translate(280,0) scale(-1,1)" : undefined}>
      <path d="M66 128l-26-8 22 16-24 6 26 4-18 14 24-8z" fill="#e8ddcd" />
      <path d="M66 128l-22-6 19 14-20 5 22 3z" fill="#cfc2b0" opacity="0.65" />
    </g>
  );
}

function Ojo({
  cx,
  cy,
  reduce,
  feliz,
}: {
  cx: number;
  cy: number;
  reduce: boolean;
  feliz: boolean;
}) {
  if (feliz) {
    return (
      <path
        d={`M${cx - 18} ${cy + 6}q18 -22 36 0`}
        fill="none"
        stroke="#1a1410"
        strokeWidth="6"
        strokeLinecap="round"
      />
    );
  }

  return (
    <motion.g
      style={{ originX: `${cx}px`, originY: `${cy}px` }}
      animate={reduce ? {} : { scaleY: [1, 1, 0.06, 1] }}
      transition={
        reduce
          ? undefined
          : { duration: 5.5, times: [0, 0.93, 0.965, 1], repeat: Infinity, ease: "linear" }
      }
    >
      {/* Contorno oscuro: la referencia los tiene delineados, no flotando */}
      <ellipse cx={cx} cy={cy} rx="25" ry="27" fill="#241c16" />
      <ellipse cx={cx} cy={cy} rx="22" ry="24" fill="#fdf8ee" />
      {/* Iris ámbar */}
      <circle cx={cx} cy={cy + 1} r="19" fill="url(#mp-iris)" />
      <circle cx={cx} cy={cy + 1} r="19" fill="none" stroke="#6d3f0b" strokeWidth="2.5" opacity="0.8" />
      <circle cx={cx} cy={cy + 2} r="10" fill="#140f0a" />
      {/* Doble brillo: el grande da el vidrio, el chico el rebote del piso */}
      <ellipse cx={cx - 6} cy={cy - 9} rx="6.5" ry="7" fill="#ffffff" opacity="0.95" />
      <circle cx={cx + 8} cy={cy + 9} r="3" fill="#ffffff" opacity="0.65" />
      {/* Párpado inferior levantado: hace que el ojo sonría sin cerrarse */}
      <path
        d={`M${cx - 20} ${cy + 17}q20 9 40 0`}
        fill="none"
        stroke="#7a6f64"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </motion.g>
  );
}
