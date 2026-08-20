import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
    Orígenes autorizados para el servidor de desarrollo. Sin esto, Next bloquea
    las peticiones internas (HMR, /_next/*) cuando se entra desde otro
    dispositivo de la red o por un túnel público, y la recarga en vivo se cae.

    Solo aplica a `next dev`; en producción no tiene efecto.
  */
  allowedDevOrigins: [
    "192.168.1.*",
    "*.trycloudflare.com",
  ],
};

export default nextConfig;
