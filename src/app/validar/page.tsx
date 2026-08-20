import { notFound } from "next/navigation";
import { PanelValidacion } from "./PanelValidacion";

/*
  Panel de validación: atajos para saltar a cualquier pantalla y estado sin
  tener que recorrer las 15 situaciones cada vez.

  Vive solo en desarrollo. Fabrica participantes y respuestas de prueba, así que
  no puede existir en producción: sería una puerta trasera para meter filas
  falsas en el Sheet del cliente.
*/
export default function ValidarPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <PanelValidacion />;
}
