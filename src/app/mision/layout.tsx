import type { Metadata } from "next";

/* Pantalla interna del producto: fuera de los buscadores. */
export const metadata: Metadata = {
  title: "El sendero",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: LayoutProps<"/mision">) {
  return children;
}
