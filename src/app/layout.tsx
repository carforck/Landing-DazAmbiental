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

const SITIO = "https://dazambiental.com";
const TITULO = "Misión Mapache · Convivir con la naturaleza";
const DESCRIPCION =
  "Juego de 15 situaciones reales para descubrir cómo convivimos con los mapaches del resort. Cinco minutos, sin respuestas malas. Por DAZ Ambiental.";

export const metadata: Metadata = {
  /*
    Sin metadataBase, Next emite la ruta relativa de la imagen y WhatsApp,
    LinkedIn y Slack no resuelven la vista previa. Es el error más común al
    compartir un enlace.
  */
  metadataBase: new URL(SITIO),
  title: {
    default: TITULO,
    template: "%s · Misión Mapache",
  },
  description: DESCRIPCION,
  applicationName: "Misión Mapache",
  authors: [{ name: "DAZ Ambiental" }],
  creator: "Vanttage",
  publisher: "DAZ Ambiental",
  category: "education",
  keywords: [
    "convivencia con fauna silvestre",
    "mapaches",
    "capacitación ambiental",
    "hoteles y resorts",
    "manejo de fauna",
    "DAZ Ambiental",
    "Barú",
    "Cartagena",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: SITIO,
    siteName: "Misión Mapache",
    title: TITULO,
    description: DESCRIPCION,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Misión Mapache · un juego de 15 situaciones sobre convivencia con fauna silvestre",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRIPCION,
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#151b0d",
  colorScheme: "dark",
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
