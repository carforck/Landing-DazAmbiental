import config from "@/config/preguntas.json";

export type Letra = "A" | "B" | "C" | "D";

/**
 * Perfiles con los que se puede jugar. El orden es el que ve el participante.
 *
 * Cada perfil tiene su propio cuestionario: un empleado responde sobre
 * protocolos de su turno y un huésped sobre su estadía, así que las preguntas
 * no se comparten. Las claves de `cuestionarios` en preguntas.json son
 * exactamente estos nombres.
 */
export const ROLES = ["Colaborador/a", "Huésped", "Comunidad"] as const;

export type Rol = (typeof ROLES)[number];

export interface Pregunta {
  numero: number;
  /** Titular del tema, que es lo que se muestra como desglose al final. */
  tema: string;
  escenario: string;
  opciones: Record<Letra, string>;
  correcta: Letra;
}

export interface Cuestionario {
  /** Nombre del conjunto tal como lo llama el cliente. */
  nombre: string;
  preguntas: Pregunta[];
}

export interface Nivel {
  min: number;
  max: number;
  nombre: string;
  porcentaje: string;
  interpretacion: string;
  mensaje: string;
}

export interface Participante {
  nombre: string;
  /** Número completo, con indicativo: "+57 3001234567". */
  telefono: string;
  rol: Rol;
  autoriza: true;
}

/** Respuestas indexadas por número de pregunta dentro del cuestionario. */
export type Respuestas = Record<number, Letra>;

const CUESTIONARIOS = config.cuestionarios as Record<string, Cuestionario>;

export const NIVELES = config.niveles as Nivel[];
export const MAXIMO = config.puntuacion.maximo;
export const PUNTOS_POR_ACIERTO = config.puntuacion.puntosPorAcierto;
export const LETRAS: Letra[] = ["A", "B", "C", "D"];

/** Cuestionario que le toca a un perfil. */
export function cuestionarioDe(rol: Rol): Cuestionario {
  return CUESTIONARIOS[rol] ?? CUESTIONARIOS[ROLES[0]];
}

export function preguntasDe(rol: Rol): Pregunta[] {
  return cuestionarioDe(rol).preguntas;
}

export function puntajeDe(rol: Rol, respuestas: Respuestas): number {
  return preguntasDe(rol).reduce(
    (total, p) =>
      total + (respuestas[p.numero] === p.correcta ? PUNTOS_POR_ACIERTO : 0),
    0,
  );
}

export function nivelPara(puntaje: number): Nivel {
  // El último nivel del JSON es el más bajo, así que sirve de respaldo.
  return (
    NIVELES.find((n) => puntaje >= n.min && puntaje <= n.max) ??
    NIVELES[NIVELES.length - 1]
  );
}

export interface DesgloseTema {
  pregunta: Pregunta;
  elegida?: Letra;
  acerto: boolean;
}

/** Resultado tema por tema, que es el desglose que ve el participante. */
export function desglosePorTema(rol: Rol, respuestas: Respuestas): DesgloseTema[] {
  return preguntasDe(rol).map((pregunta) => ({
    pregunta,
    elegida: respuestas[pregunta.numero],
    acerto: respuestas[pregunta.numero] === pregunta.correcta,
  }));
}

/** Cuántas preguntas tiene un recorrido. Igual en los tres perfiles, hoy. */
export const TOTAL_PREGUNTAS = preguntasDe(ROLES[0]).length;
