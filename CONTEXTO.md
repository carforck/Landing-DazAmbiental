# Misión Mapache — contexto vigente

> Reemplaza la spec v1.0 del 12-ago-2026 (`Misión Mapache.rtf`) y cualquier brief
> que hable de 6 dimensiones, máximo 12 puntos o paleta verde/lima/coral.
> Última actualización: 19-ago-2026.

## Qué es

Diagnóstico web gamificado sobre convivencia con fauna silvestre (mapaches) para
el personal de un hotel/resort. Cliente: **DAZ Ambiental**. Mobile-first, ~5
minutos por participante. Temática: "Convivir con la naturaleza".

Tono: **"Aquí no venimos a juzgar: venimos a descubrir"**. No es un examen y no
tiene consecuencias disciplinarias.
Lema del footer: *"Protegemos su naturaleza, respetamos su espacio"*.

## Reglas de producto que no se negocian

1. **No se revela la respuesta correcta durante el recorrido.** El feedback al
   elegir es puramente visual y neutro. La celebración ocurre una sola vez, al
   final. Cualquier diseño que haga celebrar o decepcionarse a la mascota por
   respuesta rompe este requisito.
2. **Las preguntas viven en `src/config/preguntas.json`**, separadas del código:
   el cliente todavía revisa la redacción y debe poder cambiarla sin
   re-desarrollo.
3. **La letra correcta va repartida entre A, B, C y D** (hoy: A·4 B·3 C·4 D·4).
   Petición explícita del cliente para que el juego no sea predecible. No barajar
   opciones al azar sin preservar esta distribución.
4. **Sin autorización de habeas data no se inicia** el recorrido.
5. **No debe parecerse al prototipo rechazado**
   (`mision-mapache-diagnostico.ing-infanteburgos.chatgpt.site`). El cliente lo
   descartó por "verse hecho con ChatGPT".

## Cuestionario (doc `preguntas mapache.docx`, 19-ago-2026)

**15 situaciones · 4 opciones (A–D) · 1 punto por acierto · máximo 15.**

Cinco categorías:

| Categoría | Situaciones |
|---|---|
| Avistamientos y Modo Paparazzi | 1–3 |
| Buffet no autorizado (alimentación) | 4–6 |
| Reacciones y encuentros cercanos | 7–9 |
| Manejo de residuos | 10–11 |
| Emergencias y mitos | 12–15 |

Cuatro niveles de resultado:

| Aciertos | Nivel | Interpretación técnica |
|---|---|---|
| 13–15 | Guardián de la Fauna | Apta como multiplicadora del mensaje ambiental |
| 9–12 | Aliado en Proceso | Refuerzos puntuales en temas específicos |
| 5–8 | Observador Imprudente | Riesgo de habituación animal por humanización |
| 0–4 | Agente de Riesgo | Requiere intervención directa y talleres |

## Identidad visual

Paleta extraída del logo real de DAZ Ambiental, no inventada:

- Verde oliva `#313D1A` — primario (letras y hoja del logo)
- Dorado `#BF9C41` / `#C7A848` — acento (engranaje)
- Verdes de apoyo `#48522C`, `#505A33`
- Crema `#FAF7EE` para superficies claras

Tipografía: **Outfit** (display) + **Work Sans** (texto).
Logo: `public/logo/daz-vertical.png`.

Referencia de interacción: mapa de niveles tipo Duolingo. La mascota es un SVG
propio ([`src/components/MapachePlush.tsx`](src/components/MapachePlush.tsx)) con
poses `reposo | caminando | celebrando`.

## Stack y decisiones

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind v4
- Framer Motion para animación, Lucide para iconos
- **Sin WebGL ni runtimes de animación externos.** El público responde desde su
  propio celular, muchos de gama media-baja: el peso total hoy es ~257 KB de JS
  gzip y esa es la restricción a respetar.
- Estado en `sessionStorage` vía `useSyncExternalStore`
  ([`src/lib/sesion.ts`](src/lib/sesion.ts)): se borra al cerrar la pestaña (equipos
  compartidos) pero sobrevive a que se bloquee el celular a mitad del recorrido.
- Envío a Google Sheets por webhook de Apps Script desde el servidor
  (`GOOGLE_SHEETS_WEBHOOK_URL`), nunca desde el navegador.

Reglas de UI adoptadas: iconos SVG en vez de emojis, transiciones 150–300 ms,
contraste mínimo 4.5:1, foco visible, `prefers-reduced-motion` respetado y
verificación en 375/768/1024/1440 px.

## Rutas

| Ruta | Qué es |
|---|---|
| `/` | Landing |
| `/registro` | Datos del participante + habeas data |
| `/mision` | Sendero de 15 estaciones + situaciones |
| `/resultados` | Puntaje, nivel, desglose por categoría |
| `/mascota` | Interna: validación del diseño de la mascota |
| `/validar` | Interna, **solo en desarrollo**: atajos a cualquier pantalla y estado |
| `/api/enviar` | Puente al webhook del Sheet del cliente |

## Entorno local

```bash
npm install
npm run dev            # http://localhost:3000
cp .env.example .env.local   # y pega la URL del webhook cuando exista
```

Las skills de diseño (`impeccable`, `ui-ux-pro-max`) no se versionan por peso.
Para reinstalarlas en `.claude/`:

```bash
npx impeccable@latest install
npx ui-ux-pro-max-cli@latest init --ai claude
```

## Pendientes del cliente

- [ ] Confirmación final de las 15 preguntas (siguen en revisión)
- [ ] Cuenta de Google donde recibirá el Sheet de resultados
- [ ] Colores corporativos, si difieren de los del logo
- [ ] Datos de contacto reales para la sección de contacto de la landing
- [ ] Aprobación del diseño del sendero antes de darlo por cerrado
