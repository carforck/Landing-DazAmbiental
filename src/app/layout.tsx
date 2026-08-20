import type { Metadata, Viewport } from "next";
import { Outfit, Work_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
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
      className={`${outfit.variable} ${workSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-selva-950">{children}</body>
    </html>
  );
}
