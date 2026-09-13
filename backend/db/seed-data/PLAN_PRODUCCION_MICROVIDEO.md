# Plan de producción — micro-vídeos G-10

Organiza la parte que `GUIONES_MICROVIDEO.md` deja fuera: los 3 guiones están
completos y cronometrados escena a escena, pero grabarlos, editarlos y
publicarlos es trabajo externo (grabación/animación + voz + edición). Este
documento es la hoja de ruta para llevarlos de guion a vídeo integrado en la
lección.

Versión interactiva (checklist de estado + brief copiable):
`https://claude.ai/code/artifact/40ad0735-72f4-45d0-9b65-fc36f42d0d5d`

## Los 3 vídeos y dónde van

| # | Vídeo | Dónde se integra | Duración |
|---|---|---|---|
| 1 | Retropropagación | Asignatura III, L6 "Redes Neuronales Artificiales: del perceptrón a la red profunda" (`master-iii-lecciones.js:158`); repaso en Asignatura VI, L1 (`master-vi-lecciones.js:17`) | ~110 s |
| 2 | Modelos de difusión | Asignatura IX, L4 "VAE y modelos de difusión: dos alternativas a las GAN" (`master-ix-lecciones.js:105`) | ~105 s |
| 3 | Arquitectura Lambda | Asignatura III, L1 "Arquitecturas de Big Data: cómo se organiza el procesamiento distribuido" (`master-iii-lecciones.js:14`) | ~100 s |

Guiones completos (narración + qué mostrar en pantalla, segundo a segundo):
`GUIONES_MICROVIDEO.md` en esta misma carpeta.

## Opción A — Producción propia, coste $0

Encaja bien con estos guiones porque ya están troceados por escena con
tiempos exactos: es traducir cada fila de la tabla del guion a un fotograma.

- **Vídeos 1 y 2 (retropropagación, difusión):** contenido matemático/animado
  → **Manim** (Community Edition, Python). Curva de entrada media, pero cada
  escena del guion ya es literalmente un plano de Manim (`Create`,
  `Transform`, `FadeIn` sobre las flechas de gradiente / los pasos de ruido).
- **Vídeo 3 (arquitectura Lambda):** cajas y flechas, sin animación
  matemática → **Excalidraw o Google Slides** + captura de pantalla con
  **OBS Studio** (gratis) mientras se van revelando las capas.
- **Voz:** grabar la columna "Narración" tal cual —ya está escrita al ritmo
  del vídeo, no hace falta reescribirla— o generar voz en español con
  ElevenLabs (free tier, ~10 min/mes) o Google Cloud TTS.
- **Edición y exportado:** CapCut o DaVinci Resolve (ambos gratis).
- **Tiempo estimado:** 4–6 h por vídeo con familiaridad previa de la
  herramienta; 8–10 h la primera vez con Manim.

## Opción B — Contratar producción externa

- **Dónde:** Workana (freelancers LatAm, pago en pesos/USD) o Fiverr,
  buscando "whiteboard explainer video" o "motion graphics educational".
- **Presupuesto estimado:** 80–200 USD por vídeo de 90–120 s con animación
  2D simple (240–600 USD los 3), según se use voz humana o TTS.
- **Brief listo para pegar en la oferta:** ver la versión interactiva
  (botón "Copiar brief") o el bloque de abajo.

### Brief para el freelancer

```
Necesito 3 micro-vídeos educativos (90–120 s cada uno) para un máster
online de IA aplicada a la industria. El guion de cada uno ya está escrito
y cronometrado segundo a segundo (te lo paso en una tabla: tiempo /
qué se ve en pantalla / narración) — el trabajo es animar+grabar+narrar
siguiendo ese guion, no crear el contenido desde cero.

Temas: 1) retropropagación en redes neuronales (animación de flechas de
gradiente sobre una red de 3 capas), 2) modelos de difusión (una imagen
degradándose en ruido y el proceso inverso), 3) arquitectura Lambda de
datos (diagrama de cajas: capa batch + capa streaming + capa de servicio).

Estilo: pizarra/whiteboard animado o slides con animación simple 2D (no
hace falta 3D ni motion graphics complejo). Voz en español neutro (LatAm),
puede ser sintética de buena calidad.

Entrega: MP4 H.264, 1920×1080, 16:9, subtítulos en español incrustados.
```

## Especificación técnica de entrega

El reproductor del campus (`VideoPlayer.tsx`) usa un contenedor de 16:9 con
`<iframe>` embebido (YouTube-nocookie o Vimeo) o `<video>` directo para
`.mp4/.webm/.ogg` — cualquiera de las dos rutas sirve.

| Campo | Valor |
|---|---|
| Formato de archivo | MP4, códec H.264 |
| Resolución / aspecto | 1920×1080, 16:9 (coincide con el reproductor) |
| Duración | 90–120 s por vídeo (ver guion para el minutado exacto) |
| Audio | Voz en español, narración según guion |
| Subtítulos | Incrustados, recomendado (accesibilidad) |
| Nombre de archivo | `microvideo-01-retropropagacion.mp4` / `-02-difusion.mp4` / `-03-lambda.mp4` |

## Publicación

- **YouTube, modo "Oculto" (unlisted):** no aparece en búsquedas ni en el
  canal, pero cualquiera con el enlace lo ve — justo lo que necesita el
  `<iframe>` del campus. Es la opción más simple, coherente con los otros
  33 vídeos ya enlazados en el seed.
- **Alternativa sin YouTube:** Vimeo (también soportado por
  `VideoPlayer.tsx`), o un `.mp4` servido desde storage propio
  (S3/Cloudflare R2) — el reproductor también acepta enlaces directos de
  archivo.

## Integrarlo en la plataforma una vez grabado

1. Añadir el recurso a `recursos.videos` en el fichero de lecciones
   correspondiente (ver tabla de arriba para el fichero/línea exactos),
   con el mismo formato que ya usan los 33 vídeos existentes:
   `{ titulo, canal: 'Máster IEP', url, minutos, concepto }`.
2. Regenerar el snapshot de auditoría: `node scripts/dump-lesson-resources.mjs`
   (actualiza `RECURSOS_POR_LECCION.md`).
3. Commit + merge a `main` + deploy (Railway auto-despliega el backend).
4. `node db/seed.js` corre solo (o `AUTO_SEED=sync` ya lo hace al arrancar)
   — es upsert no destructivo, no hace falta backup para esto.
5. Verificar en vivo: entrar a la lección como `test@example.com` y
   confirmar que el vídeo se reproduce embebido.

## Seguimiento

| # | Vídeo | Estado |
|---|---|---|
| 1 | Retropropagación | 🔲 Guion listo, sin grabar |
| 2 | Modelos de difusión | 🔲 Guion listo, sin grabar |
| 3 | Arquitectura Lambda | 🔲 Guion listo, sin grabar |

Actualiza esta tabla (o la versión interactiva) a medida que avance cada
vídeo: guion listo → en producción → en edición → publicado e integrado.
