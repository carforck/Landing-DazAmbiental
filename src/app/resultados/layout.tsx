import type { Metadata } from "next";

/* Pantalla interna del producto: fuera de los buscadores. */
export const metadata: Metadata = {
  title: "Resultados",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: LayoutProps<"/resultados">) {
  return children;
}
