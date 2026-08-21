import type { MetadataRoute } from "next";

/*
  Solo la landing se indexa. Las pantallas del recorrido piden nombre y
  documento: no tienen nada que hacer en un buscador, y aparecer ahí solo
  invitaría a entrar saltándose el registro y la autorización de datos.
*/
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/registro", "/mision", "/resultados", "/mascota", "/lottie", "/api/"],
    },
    sitemap: "https://dazambiental.com/sitemap.xml",
  };
}
