import type { Metadata } from "next";

/* Pantalla interna del producto: fuera de los buscadores. */
export const metadata: Metadata = {
  title: "Mascota",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: LayoutProps<"/mascota">) {
  return children;
}
