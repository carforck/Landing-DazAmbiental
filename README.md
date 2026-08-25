# Misión Mapache

Diagnóstico web gamificado sobre convivencia con fauna silvestre para el
personal de un resort en Barú. Cliente: **DAZ Ambiental**.

Cada perfil (empleado, huésped o comunidad) recorre su propio sendero de cinco
paradas, en cada una elige qué haría ante una situación real con mapaches, y al
final recibe un puntaje, un nivel y un desglose tema por tema. Los resultados se consolidan solos en un Google Sheets del
cliente.

Mobile-first: el personal responde desde su propio celular.

## Puesta en marcha

```bash
npm install
npm run dev                   # http://localhost:3000
cp .env.example .env.local    # y pega la URL del webhook cuando exista
```

Sin `GOOGLE_SHEETS_WEBHOOK_URL` el flujo funciona igual: la fila queda registrada
en los logs del servidor en vez de viajar al Sheet.

Para conectar el Google Sheet del cliente, sigue
[`apps-script/README-SHEET.md`](./apps-script/README-SHEET.md).

## Rutas

| Ruta | Qué es |
|---|---|
| `/` | Landing |
| `/registro` | Datos del participante y autorización de habeas data |
| `/mision` | Sendero de cinco paradas con las situaciones del perfil |
| `/resultados` | Puntaje, nivel y desglose por categoría |
| `/api/enviar` | Puente al webhook del Sheet del cliente |
| `/mascota` | Interna: validación del diseño de la mascota |
| `/lottie` | Interna: banco de pruebas de animaciones Lottie |
| `/validar` | Interna, **solo en desarrollo**: atajos a cualquier pantalla y estado |

`/validar` devuelve 404 en producción: fabrica participantes y respuestas de
prueba, así que no puede existir donde hay un Sheet real detrás.

## Estructura

```
src/
├── app/
│   ├── page.tsx              landing
│   ├── registro/             formulario + habeas data
│   ├── mision/               sendero y situaciones
│   ├── resultados/           puntaje y desglose
│   └── api/enviar/route.ts   webhook → Google Sheets
├── components/
│   ├── MapachePlush.tsx      la mascota (reposo | caminando | celebrando)
│   ├── MapaSendero.tsx       sendero de estaciones, trazo medido
│   ├── PanelPregunta.tsx     situación con 4 opciones y navegación
│   ├── HeroMedia.tsx         video del hero con póster
│   ├── FondoVideo.tsx        video de fondo reutilizable
│   ├── RastroHuellas.tsx     huellas que deja el cursor
│   └── Confetti.tsx
├── lib/
│   ├── mision.ts             tipos, puntaje, niveles, desglose
│   └── sesion.ts             estado de la sesión del participante
└── config/preguntas.json     contenido editable por el cliente
```

## Decisiones que conviene conocer antes de tocar el código

**Las preguntas viven en `src/config/preguntas.json`.** El cliente todavía
revisa la redacción y debe poder cambiarla sin re-desarrollo. Es requisito
contractual, no una comodidad.

**Cada perfil tiene su propio cuestionario.** Un empleado responde sobre los
protocolos de su turno y un huésped sobre su estadía: las preguntas no se
comparten. Las claves de `cuestionarios` en el JSON son exactamente los nombres
de los roles.

**Nunca se revela la respuesta correcta durante el recorrido.** El feedback al
elegir es puramente visual y neutro; el resultado se resuelve al final. Un
diseño que haga celebrar o decepcionarse a la mascota por respuesta rompe este
requisito.

**La sesión vive en `sessionStorage`, no en `localStorage`.** Se borra al cerrar
la pestaña: en un equipo compartido del hotel el siguiente participante no puede
heredar los datos del anterior. Está montada como store externo con
`useSyncExternalStore`, así sobrevive a que se bloquee el celular a mitad del
recorrido.

**Sin WebGL ni runtimes de animación pesados.** El público responde desde
celulares de gama media-baja. El presupuesto de peso es la restricción a
respetar: todo lo visual se resuelve con SVG, CSS y Framer Motion.

**La URL del webhook se lee solo en el servidor.** Nunca llega al bundle del
navegador.

## Identidad

Paleta extraída del logo real de DAZ Ambiental, no inventada:

- Verde oliva `#313D1A` — primario
- Dorado `#BF9C41` / `#C7A848` — acento
- Crema `#FAF7EE` — superficies claras

Tipografía: **Roboto** (900 con tracking negativo para titulares, mediante la
clase `.titular`) y **Roboto Mono** para etiquetas.

La landing es deliberadamente tipográfica: sin iconos, sin viñetas y sin
tarjetas numeradas. Esos tres recursos son la firma visual de las landings
generadas, y el cliente pidió expresamente alejarse de ahí.

Toda animación respeta `prefers-reduced-motion`.

## Contenido

Tres cuestionarios de cinco situaciones cada uno, en cuatro opciones. Dos puntos
por acierto sobre un máximo de 10. Cuatro niveles: **Convivencia responsable**
(9-10), **Conocimiento en desarrollo** (6-8), **Prácticas de riesgo** (3-5) e
**Intervención prioritaria** (0-2).

El documento del cliente contempla además 1 punto por respuesta *parcialmente
adecuada*, pero solo marca cuál es la correcta. Hasta que indique qué opciones
valen 1 punto, la puntuación es binaria.

## Pendientes del cliente

- [ ] Qué opciones valen 1 punto (respuesta parcialmente adecuada)
- [ ] Datos de contacto reales para la landing
- [ ] Material propio del resort para reemplazar el metraje del hero
- [ ] Aprobación del diseño del sendero

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 ·
Framer Motion · lottie-react

---

Desarrollado por [Vanttage](https://vanttagetech.com) para DAZ Ambiental.
