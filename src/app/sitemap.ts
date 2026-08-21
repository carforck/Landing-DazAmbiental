import type { MetadataRoute } from "next";

/** Una sola URL: es un producto de un propósito, no un sitio de contenidos. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://dazambiental.com",
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
