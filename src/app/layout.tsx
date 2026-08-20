import type { Metadata, Viewport } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";

/*
  Sistema de sainet.co, verificado contra su hero: los titulares son Roboto en
  peso 900 con tracking negativo, no Comfortaa (Comfortaa está en su hoja de
  estilos pero no maneja los títulos). Roboto Mono queda para las etiquetas.

  De paso salimos del par Outfit/Work Sans, que es la firma tipográfica de medio
  generador de landings.
*/
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Misión Mapache · Convivir con la naturaleza",
  description:
    "Diagnóstico interactivo de 5 minutos sobre convivencia con la fauna silvestre. Aquí no venimos a juzgar: venimos a descubrir.",
  applicationName: "Misión Mapache",
  openGraph: {
    title: "Misión Mapache · Convivir con la naturaleza",
    description:
      "Un recorrido de 15 situaciones reales para descubrir cómo convivimos con los mapaches del resort. Toma 5 minutos.",
    type: "website",
    locale: "es_CO",
    siteName: "Misión Mapache",
  },
  twitter: {
    card: "summary_large_image",
    title: "Misión Mapache · Convivir con la naturaleza",
    description:
      "Un recorrido de 15 situaciones reales para descubrir cómo convivimos con los mapaches del resort.",
  },
};

export const viewport: Viewport = {
  themeColor: "#131a08",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-CO"
      className={`${roboto.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-selva-950">{children}</body>
    </html>
  );
}
