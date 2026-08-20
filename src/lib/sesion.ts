"use client";

import { useSyncExternalStore } from "react";
import type { Participante, Respuestas } from "./mision";

/*
  La sesión vive en sessionStorage: se borra al cerrar la pestaña, que es lo que
  queremos en un equipo compartido del hotel — el siguiente participante no
  hereda los datos del anterior.

  Se expone como store externo (useSyncExternalStore) en vez de leerlo dentro de
  un efecto: así React hidrata con el estado vacío del servidor y pasa al estado
  real del navegador sin renders en cascada.
*/

export interface EstadoSesion {
  participante: Participante | null;
  respuestas: Respuestas;
  enviado: boolean;
}

const CLAVE_PARTICIPANTE = "mm:participante";
const CLAVE_RESPUESTAS = "mm:respuestas";
const CLAVE_ENVIO = "mm:enviado";

/** Instancia estable: si cambiara en cada llamada, el store entraría en bucle. */
const VACIO: EstadoSesion = { participante: null, respuestas: {}, enviado: false };

let cache: EstadoSesion | null = null;
const oyentes = new Set<() => void>();

function leer<T>(clave: string): T | null {
  try {
    const crudo = window.sessionStorage.getItem(clave);
    return crudo ? (JSON.parse(crudo) as T) : null;
  } catch {
    return null;
  }
}

function escribir(clave: string, valor: unknown) {
  try {
    window.sessionStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* Modo privado o cuota llena: la experiencia sigue viva en memoria. */
  }
}

function estadoDelNavegador(): EstadoSesion {
  return {
    participante: leer<Participante>(CLAVE_PARTICIPANTE),
    respuestas: leer<Respuestas>(CLAVE_RESPUESTAS) ?? {},
    enviado: leer<boolean>(CLAVE_ENVIO) === true,
  };
}

function instantanea(): EstadoSesion {
  if (typeof window === "undefined") return VACIO;
  cache ??= estadoDelNavegador();
  return cache;
}

function instantaneaServidor(): EstadoSesion {
  return VACIO;
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

function actualizar(cambio: Partial<EstadoSesion>) {
  cache = { ...instantanea(), ...cambio };
  oyentes.forEach((oyente) => oyente());
}

/** Estado de la sesión, reactivo. `null` en el primer render (servidor). */
export function useSesion(): EstadoSesion {
  return useSyncExternalStore(suscribir, instantanea, instantaneaServidor);
}

export const sesion = {
  /** Lectura imperativa desde el navegador. Úsala en efectos de guardia:
   *  durante la hidratación el render todavía trae el estado del servidor. */
  leer: instantanea,

  guardarParticipante(p: Participante) {
    escribir(CLAVE_PARTICIPANTE, p);
    actualizar({ participante: p });
  },

  guardarRespuestas(r: Respuestas) {
    escribir(CLAVE_RESPUESTAS, r);
    actualizar({ respuestas: r });
  },

  marcarEnviado() {
    escribir(CLAVE_ENVIO, true);
    actualizar({ enviado: true });
  },

  limpiar() {
    [CLAVE_PARTICIPANTE, CLAVE_RESPUESTAS, CLAVE_ENVIO].forEach((c) => {
      try {
        window.sessionStorage.removeItem(c);
      } catch {
        /* Nada que limpiar si el storage no está disponible. */
      }
    });
    actualizar(VACIO);
  },
};
