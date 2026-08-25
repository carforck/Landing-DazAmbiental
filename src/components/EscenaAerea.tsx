"use client";

import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Fondo del sendero: vista aérea ilustrada de manglar.
 *
 * Es SVG dibujado, no metraje. Tres razones:
 *
 * · El video de mapaches competía con el mapa, que es lo que hay que leer y
 *   tocar; una ilustración se queda de fondo sin pelear por la atención.
 * · Pesa unos pocos KB frente a los megas del video, y este público responde
 *   desde el celular con datos.
 * · Al ser código, los colores salen del tema y la escena se puede alargar sin
 *   volver a exportar nada.
 *
 * Las copas y los reflejos se colocan con una secuencia determinista (no
 * `Math.random`) para que el servidor y el cliente pinten lo mismo y no haya
 * salto de hidratación.
 */

/** Generador estable: mismo índice, mismo valor, en servidor y en navegador. */
function pseudo(i: number, sal: number) {
  const x = Math.sin(i * 12.9898 + sal * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

interface Copa {
  cx: number;
  cy: number;
  r: number;
  tono: number;
  fase: number;
}

export function EscenaAerea({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();

  const copas = useMemo<Copa[]>(() => {
    const lista: Copa[] = [];
    for (let i = 0; i < 150; i += 1) {
      const cx = pseudo(i, 1) * 400;
      const cy = pseudo(i, 2) * 900;
      // El río baja en diagonal: se deja libre la franja que ocupa.
      const rio = 120 + cy * 0.28;
      if (Math.abs(cx - rio) < 78) continue;
      lista.push({
        cx,
        cy,
        r: 13 + pseudo(i, 3) * 20,
        tono: Math.floor(pseudo(i, 4) * 4),
        fase: pseudo(i, 5) * 6,
      });
    }
    return lista;
  }, []);

  /* Verdes de copa: del más nuevo al más maduro, todos de la familia del tema */
  const VERDES = ["#a7cf5a", "#7fb63f", "#5d9a3a", "#48793a"];

  return (
    <div aria-hidden className={`overflow-hidden bg-[#dff0d2] ${className}`}>
      <svg
        viewBox="0 0 400 900"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="ea-agua" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4fb8c9" />
            <stop offset="50%" stopColor="#7ad4dd" />
            <stop offset="100%" stopColor="#3f9fb4" />
          </linearGradient>
          <linearGradient id="ea-arena" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e9dcb0" />
            <stop offset="100%" stopColor="#d9c690" />
          </linearGradient>
        </defs>

        {/* Suelo y claros de pasto */}
        <rect width="400" height="900" fill="#cfe6bd" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ellipse
            key={`claro-${i}`}
            cx={pseudo(i, 7) * 400}
            cy={pseudo(i, 8) * 900}
            rx={60 + pseudo(i, 9) * 80}
            ry={40 + pseudo(i, 10) * 60}
            fill="#dcedc6"
          />
        ))}

        {/* Río en diagonal, con orilla arenosa */}
        <path
          d="M78 -40 C 150 180, 210 420, 300 700 L 420 940 L 300 940 C 220 700, 150 420, 20 60 Z"
          fill="url(#ea-arena)"
          opacity="0.9"
        />
        <path
          d="M96 -40 C 166 180, 224 420, 312 700 L 372 940 L 300 940 C 226 700, 160 420, 40 40 Z"
          fill="url(#ea-agua)"
        />

        {/* Brillos del agua: se desplazan río abajo */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const y = pseudo(i, 11) * 900;
          const x = 118 + y * 0.28 + pseudo(i, 12) * 34;
          return (
            <ellipse
              key={`brillo-${i}`}
              cx={x}
              cy={y}
              rx={11 + pseudo(i, 13) * 16}
              ry={2.6}
              fill="#ffffff"
              opacity="0.5"
            >
              {!reduce && (
                <animate
                  attributeName="opacity"
                  values="0.12;0.6;0.12"
                  dur={`${3 + pseudo(i, 14) * 3}s`}
                  begin={`${pseudo(i, 15) * 3}s`}
                  repeatCount="indefinite"
                />
              )}
            </ellipse>
          );
        })}

        {/* Raíces de mangle asomando en la orilla */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const y = pseudo(i, 16) * 900;
          const x = 96 + y * 0.28 + (i % 2 ? 26 : -26);
          return (
            <path
              key={`raiz-${i}`}
              d={`M${x} ${y} l${i % 2 ? 12 : -12} 9 m${i % 2 ? -12 : 12} -9 l${i % 2 ? 4 : -4} 13`}
              stroke="#6b5433"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
              opacity="0.55"
            />
          );
        })}

        {/* Copas de árbol vistas desde arriba, cada una con su sombra */}
        {copas.map((c, i) => (
          <g key={`copa-${i}`}>
            <ellipse
              cx={c.cx + 4}
              cy={c.cy + 5}
              rx={c.r}
              ry={c.r * 0.86}
              fill="#3f5f2c"
              opacity="0.22"
            />
            <circle cx={c.cx} cy={c.cy} r={c.r} fill={VERDES[c.tono]}>
              {!reduce && (
                <animate
                  attributeName="r"
                  values={`${c.r};${c.r * 1.06};${c.r}`}
                  dur={`${5 + c.fase}s`}
                  begin={`${c.fase}s`}
                  repeatCount="indefinite"
                />
              )}
            </circle>
            {/* Luz en el lomo de la copa: es lo que da la sensación de volumen */}
            <circle
              cx={c.cx - c.r * 0.28}
              cy={c.cy - c.r * 0.3}
              r={c.r * 0.42}
              fill="#ffffff"
              opacity="0.16"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
