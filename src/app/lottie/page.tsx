import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import { VisorLottie, type ArchivoLottie } from "./VisorLottie";

/*
  Banco de pruebas de animaciones Lottie. Lee lo que haya en public/lottie/ y lo
  monta con controles, así validar una animación nueva es solo copiar el archivo
  ahí y recargar. Solo en desarrollo: es una pantalla interna.
*/
export const dynamic = "force-dynamic";

async function listarArchivos(): Promise<ArchivoLottie[]> {
  const carpeta = path.join(process.cwd(), "public", "lottie");
  try {
    const nombres = await readdir(carpeta);
    const archivos = await Promise.all(
      nombres
        .filter((n) => n.endsWith(".json") || n.endsWith(".lottie"))
        .map(async (nombre) => {
          const { size } = await stat(path.join(carpeta, nombre));
          return { nombre, ruta: `/lottie/${nombre}`, bytes: size };
        }),
    );
    return archivos.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch {
    return [];
  }
}

export default async function LottiePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <VisorLottie archivos={await listarArchivos()} />;
}
