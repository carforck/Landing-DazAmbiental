"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Mascota de Misión Mapache — cartoon 3D gris.
 *
 * Rasgos que definen el personaje, tomados de la referencia aprobada:
 *  · banda clara bajando por el centro de la cara, entre dos parches oscuros
 *  · mechones crema saliendo de las mejillas
 *  · ojos grandes con iris azul-grisáceo, pupila amplia y doble brillo
 *  · cola gruesa de anillos claro/oscuro bien contrastados
 *
 * El volumen 3D se consigue con degradados radiales, oclusión difuminada en los
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
        rotate: celebra ? [0, 12, 0, -12, 0] : [0, 4, 0, -4, 0],
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
      style={{ originX: "140px", originY: "282px", ...style }}
    >
      <defs>
        <radialGradient id="mp-cabeza" cx="0.36" cy="0.26" r="0.84">
          <stop offset="0%" stopColor="#c4cad2" />
          <stop offset="55%" stopColor="#949ba4" />
          <stop offset="100%" stopColor="#5e646c" />
        </radialGradient>
        <radialGradient id="mp-cuerpo" cx="0.36" cy="0.22" r="0.86">
          <stop offset="0%" stopColor="#8d949d" />
          <stop offset="58%" stopColor="#666d76" />
          <stop offset="100%" stopColor="#3f454c" />
        </radialGradient>
        <radialGradient id="mp-vientre" cx="0.42" cy="0.24" r="0.8">
          <stop offset="0%" stopColor="#f6ece2" />
          <stop offset="100%" stopColor="#d9c7ba" />
        </radialGradient>
        <radialGradient id="mp-banda" cx="0.45" cy="0.2" r="0.85">
          <stop offset="0%" stopColor="#f3e9de" />
          <stop offset="100%" stopColor="#d4c6b8" />
        </radialGradient>
        <linearGradient id="mp-parche" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b636c" />
          <stop offset="100%" stopColor="#333940" />
        </linearGradient>
        <radialGradient id="mp-oreja" cx="0.5" cy="0.38" r="0.72">
          <stop offset="0%" stopColor="#efd4c6" />
          <stop offset="100%" stopColor="#c39c8c" />
        </radialGradient>
        <radialGradient id="mp-iris" cx="0.38" cy="0.3" r="0.78">
          <stop offset="0%" stopColor="#b9cde2" />
          <stop offset="60%" stopColor="#7d97b5" />
          <stop offset="100%" stopColor="#42597a" />
        </radialGradient>
        <linearGradient id="mp-colaClara" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c3c9d1" />
          <stop offset="100%" stopColor="#8f959e" />
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
        cy="284"
        rx="76"
        ry="13"
        fill="#2a2f35"
        opacity="0.35"
        filter="url(#mp-suave)"
      />

      {/* ── Cola gruesa, saliendo por detrás hacia la izquierda ── */}
      <motion.g style={{ originX: "104px", originY: "216px" }} animate={cola}>
        <path
          d="M104 216c-38 4-62 22-62 48 0 20 16 32 34 28"
          fill="none"
          stroke="url(#mp-colaClara)"
          strokeWidth="52"
          strokeLinecap="round"
        />
        <path
          d="M74 224c-14 6-24 16-28 28"
          fill="none"
          stroke="#3d434a"
          strokeWidth="50"
          strokeLinecap="round"
        />
        <path
          d="M44 268c0 12 8 20 19 21"
          fill="none"
          stroke="#3d434a"
          strokeWidth="46"
          strokeLinecap="round"
        />
        {/* Luz de borde superior de la cola */}
        <path
          d="M100 194c-32 6-52 24-56 46"
          fill="none"
          stroke="#f2f4f7"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.25"
        />
      </motion.g>

      {/* ── Piernas y pies ── */}
      <ellipse cx="106" cy="268" rx="26" ry="17" fill="#575e66" />
      <ellipse cx="106" cy="265" rx="18" ry="10" fill="#8d949d" opacity="0.5" />
      <ellipse cx="174" cy="268" rx="26" ry="17" fill="#575e66" />
      <ellipse cx="174" cy="265" rx="18" ry="10" fill="#8d949d" opacity="0.5" />

      {/* ── Cuerpo ── */}
      <ellipse cx="140" cy="212" rx="72" ry="62" fill="url(#mp-cuerpo)" />
      <ellipse
        cx="140"
        cy="160"
        rx="54"
        ry="19"
        fill="#2f353b"
        opacity="0.45"
        filter="url(#mp-suave)"
      />

      {/* Vientre claro */}
      <ellipse cx="140" cy="216" rx="45" ry="50" fill="url(#mp-vientre)" />

      {/* Bracitos al frente, sin nada en las manos: el diagnóstico enseña
          justamente a no darles comida */}
      <motion.g style={{ originX: "88px", originY: "192px" }} animate={brazos}>
        <ellipse cx="86" cy="214" rx="18" ry="26" fill="#5d646c" transform="rotate(-16 86 214)" />
        <ellipse cx="82" cy="232" rx="13" ry="10" fill="#3f454c" />
      </motion.g>
      <motion.g style={{ originX: "192px", originY: "192px" }} animate={brazos}>
        <ellipse cx="194" cy="214" rx="18" ry="26" fill="#5d646c" transform="rotate(16 194 214)" />
        <ellipse cx="198" cy="232" rx="13" ry="10" fill="#3f454c" />
      </motion.g>

      {/* ── Orejas grandes, altas y separadas ── */}
      <Oreja cx={78} cy={62} rot={-14} />
      <Oreja cx={202} cy={62} rot={14} />

      {/* ── Cabeza ── */}
      <ellipse cx="140" cy="108" rx="80" ry="74" fill="url(#mp-cabeza)" />

      {/* Mechones crema saliendo de las mejillas: el rasgo que más carácter da */}
      <Mechones lado="izq" />
      <Mechones lado="der" />

      {/* Banda clara por el centro de la cara, de la frente al hocico */}
      <path
        d="M120 38c-7 26-9 52-6 76h52c3-24 1-50-6-76-12-5-28-5-40 0z"
        fill="url(#mp-banda)"
      />

      {/* Parches oscuros a cada lado de la banda */}
      <path
        d="M112 60c-24-4-42 8-48 32-4 18 4 34 20 42 18 9 38 4 44-10 5-13 2-38-4-56-3-6-7-8-12-8z"
        fill="url(#mp-parche)"
      />
      <path
        d="M168 60c24-4 42 8 48 32 4 18-4 34-20 42-18 9-38 4-44-10-5-13-2-38 4-56 3-6 7-8 12-8z"
        fill="url(#mp-parche)"
      />

      {/* Luz de borde en la coronilla */}
      <path
        d="M84 62c14-18 34-26 56-26s42 8 56 26"
        fill="none"
        stroke="#ffffff"
        strokeWidth="9"
        strokeLinecap="round"
        opacity="0.3"
        filter="url(#mp-suavito)"
      />

      {/* ── Ojos ── */}
      <Ojo cx={106} cy={106} reduce={!!reduce} feliz={celebra} />
      <Ojo cx={174} cy={106} reduce={!!reduce} feliz={celebra} />

      {/* ── Hocico ── */}
      <ellipse cx="140" cy="150" rx="38" ry="28" fill="#f7efe6" />
      <ellipse
        cx="140"
        cy="142"
        rx="30"
        ry="15"
        fill="#ffffff"
        opacity="0.5"
        filter="url(#mp-suavito)"
      />
      {/* Nariz redonda y ancha */}
      <ellipse cx="140" cy="140" rx="15" ry="12" fill="#16181b" />
      <ellipse cx="135" cy="136" rx="5" ry="3.5" fill="#ffffff" opacity="0.5" />

      {/* Sonrisa abierta con lengua */}
      {celebra ? (
        <>
          <path d="M118 160q22 32 44 0z" fill="#2c1f1c" />
          <path d="M130 174q10 11 20 0z" fill="#d38a8e" />
        </>
      ) : (
        <>
          <path d="M140 152v5" stroke="#16181b" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M122 160q18 21 36 0z" fill="#2c1f1c" />
          <path d="M132 171q8 8 16 0z" fill="#d38a8e" />
        </>
      )}
    </motion.svg>
  );
}

function Oreja({ cx, cy, rot }: { cx: number; cy: number; rot: number }) {
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      <ellipse cx={cx} cy={cy} rx="33" ry="36" fill="#7d848d" />
      <ellipse cx={cx} cy={cy + 4} rx="20" ry="23" fill="url(#mp-oreja)" />
      <ellipse cx={cx - 7} cy={cy - 12} rx="10" ry="8" fill="#ffffff" opacity="0.22" />
    </g>
  );
}

/** Mechones de pelo crema que sobresalen a los lados de la cara. */
function Mechones({ lado }: { lado: "izq" | "der" }) {
  const espejo = lado === "der";
  return (
    <g transform={espejo ? "translate(280,0) scale(-1,1)" : undefined}>
      <path d="M74 108l-34-14 30 22-32 4 34 8-24 18 30-10z" fill="#efe4d8" />
      <path d="M74 108l-30-12 27 20-28 4 30 7z" fill="#d8cabc" opacity="0.7" />
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
        stroke="#14181d"
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
      {/* Globo del ojo con iris azul-grisáceo y pupila amplia */}
      <ellipse cx={cx} cy={cy} rx="22" ry="24" fill="#eef2f6" />
      <circle cx={cx} cy={cy + 1} r="19" fill="url(#mp-iris)" />
      <circle cx={cx} cy={cy + 1} r="19" fill="none" stroke="#33465f" strokeWidth="2" opacity="0.7" />
      <circle cx={cx} cy={cy + 2} r="11" fill="#101418" />
      {/* Doble brillo: el grande da el vidrio, el chico el rebote del piso */}
      <ellipse cx={cx - 6} cy={cy - 8} rx="6.5" ry="7" fill="#ffffff" opacity="0.95" />
      <circle cx={cx + 7} cy={cy + 9} r="3" fill="#ffffff" opacity="0.6" />
      {/* Párpado inferior levantado: hace que el ojo sonría sin cerrarse */}
      <path
        d={`M${cx - 19} ${cy + 15}q19 9 38 0`}
        fill="none"
        stroke="#6b727b"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.55"
      />
    </motion.g>
  );
}
