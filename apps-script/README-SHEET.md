# Conectar el Google Sheet

Qué hay que hacer, una sola vez, para que los resultados lleguen solos a la hoja.

El Sheet no recibe nada por sí mismo: hace falta un Apps Script vinculado a él
que escuche los envíos de la landing.

---

## 1. Abrir el editor de scripts

En el Sheet: **Extensiones → Apps Script**.

Se abre un editor con un archivo `Código.gs` que trae una función vacía.

## 2. Pegar el código

Borra todo lo que haya en `Código.gs` y pega el contenido de
[`Codigo.gs`](./Codigo.gs). Guarda con `Cmd+S`.

## 3. Poner las propiedades del script

En el editor: **⚙ Configuración del proyecto → Propiedades del script →
Agregar propiedad**. Son dos:

| Propiedad | Valor |
|---|---|
| `TOKEN` | una cadena larga y aleatoria |
| `SHEET_ID` | el id del documento |

Para generar el token: `openssl rand -hex 24`. Guarda ese valor: va también en
Vercel, en el paso 6.

**El `SHEET_ID` no es el ID del script.** Es lo que va entre `/d/` y `/edit` en
la URL del Sheet:

```
https://docs.google.com/spreadsheets/d/ESTO_ES_EL_SHEET_ID/edit
```

El ID del script, que aparece en esa misma pantalla de configuración,
identifica el proyecto de Apps Script y aquí no sirve.

**Por qué el `SHEET_ID`.** Si el script se creó desde el propio Sheet
(Extensiones → Apps Script) queda vinculado a él y funcionaría sin esto. Pero si
se creó suelto desde script.google.com, `getActiveSpreadsheet()` devuelve nada y
todo falla con el primer participante real. Con `SHEET_ID` funciona en los dos
casos.

**Por qué el `TOKEN`.** La aplicación web tiene que quedar abierta a cualquiera
para que el servidor de la landing pueda escribir. Sin la clave, cualquier
persona que descubra la URL podría insertar filas falsas en la hoja del cliente.

## 4. Publicar como aplicación web

**Implementar → Nueva implementación → ⚙ → Aplicación web.**

| Campo | Valor |
|---|---|
| Descripción | Misión Mapache |
| Ejecutar como | **Yo** (tu cuenta) |
| Quién tiene acceso | **Cualquier usuario** |

Da **Implementar**. Google pide autorizar el script: acepta, y en la pantalla de
"Google no ha verificado esta aplicación" entra por **Configuración avanzada →
Ir a (nombre) (no seguro)**. Es tu propio script; la advertencia sale con
cualquier script no publicado en Marketplace.

## 5. Copiar la URL

Al terminar aparece una **URL de la aplicación web** que termina en `/exec`.
Esa es la que necesito.

Para comprobar que quedó bien, ábrela en el navegador: debe responder con el
nombre real de tu documento.

```json
{"ok":true,"servicio":"Misión Mapache","estado":"escuchando","documento":"REGISTROS"}
```

Si en vez de eso responde `{"ok":false,...}`, el mensaje dice qué falta: casi
siempre es el `SHEET_ID`.

## 6. Configurar Vercel

En el proyecto de Vercel: **Settings → Environment Variables**, y agrega las dos
para Production, Preview y Development:

| Variable | Valor |
|---|---|
| `GOOGLE_SHEETS_WEBHOOK_URL` | la URL que termina en `/exec` |
| `GOOGLE_SHEETS_TOKEN` | la misma cadena del paso 3 |

Después hay que **volver a desplegar**: las variables solo entran en un
despliegue nuevo.

---

## Cómo queda la hoja

El script crea una pestaña llamada **Resultados** con la fila de encabezados
congelada. Una fila por participante:

Fecha y hora · Nombre completo · Documento de identidad · Perfil · Puntaje ·
Máximo · Nivel · Autorización habeas data · una columna por cada categoría con
los aciertos · y una columna por pregunta (P1 a P15) con la letra elegida.

Las columnas se crean solas a partir del primer envío. Si el cliente cambia el
número de preguntas, las nuevas se agregan al final sin descuadrar las filas ya
guardadas.

## Si algo no llega

- **Abre la URL `/exec` en el navegador.** Si no responde el JSON de arriba, la
  publicación quedó mal: repite el paso 4 creando una implementación nueva.
- **Revisa que el token coincida** entre la propiedad del script y Vercel.
- **Confirma que `SHEET_ID` es el del documento**, no el del proyecto de script.
- **Confirma que se volvió a desplegar** después de agregar las variables.
- En el editor de Apps Script, **Ejecuciones** muestra cada llamada recibida y
  el error si lo hubo.

Recuerda que cada vez que edites el script hay que **crear una implementación
nueva** (o actualizar la existente) para que los cambios tomen efecto.
