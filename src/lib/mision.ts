import config from "@/config/preguntas.json";

export type Letra = "A" | "B" | "C" | "D";
/**
 * Perfiles con los que se puede jugar. El orden es el que ve el participante.
 *
 * Se declara aquí y no en la pantalla de registro para que el día que el
 * cliente pida otro perfil solo haya que tocar un sitio. El tipo sale de la
 * propia lista, así no pueden quedar desalineados.
 */
export const ROLES = ["Colaborador/a", "Huésped", "Comunidad"] as const;

export type Rol = (typeof ROLES)[number];

export interface Pregunta {
  numero: number;
  categoria: string;
  titulo: string;
  escenario: string;
  opciones: Record<Letra, string>;
  correcta: Letra;
}

export interface Categoria {
  id: string;
  nombre: string;
  icono: string;
  preguntas: number[];
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
  documento: string;
  rol: Rol;
  autoriza: true;
}

/** Respuestas indexadas por número de pregunta (1-15). */
export type Respuestas = Record<number, Letra>;

export const PREGUNTAS = config.preguntas as Pregunta[];
export const CATEGORIAS = config.categorias as Categoria[];
export const NIVELES = config.niveles as Nivel[];
export const MAXIMO = config.puntuacion.maximo;

export const LETRAS: Letra[] = ["A", "B", "C", "D"];

export function preguntaPorNumero(numero: number): Pregunta | undefined {
  return PREGUNTAS.find((p) => p.numero === numero);
}

export function categoriaDe(pregunta: Pregunta): Categoria | undefined {
  return CATEGORIAS.find((c) => c.id === pregunta.categoria);
}

export function puntajeDe(respuestas: Respuestas): number {
  return PREGUNTAS.reduce(
    (total, p) => total + (respuestas[p.numero] === p.correcta ? 1 : 0),
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

export interface DesgloseCategoria {
  categoria: Categoria;
  aciertos: number;
  total: number;
}

export function desglosePorCategoria(respuestas: Respuestas): DesgloseCategoria[] {
  return CATEGORIAS.map((categoria) => {
    const preguntas = categoria.preguntas
      .map(preguntaPorNumero)
      .filter((p): p is Pregunta => Boolean(p));

    return {
      categoria,
      aciertos: preguntas.filter((p) => respuestas[p.numero] === p.correcta).length,
      total: preguntas.length,
    };
  });
}
