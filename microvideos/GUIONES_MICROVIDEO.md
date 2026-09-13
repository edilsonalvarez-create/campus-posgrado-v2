# Guiones — micro-vídeos G-10 (Plan A)

Tiempos alineados con las escenas Manim. Narración completa en `narracion/`.

## 1. Retropropagación — ~110 s · III L6 (+ repaso VI L1)

| t | Pantalla | Narración |
|---|---|---|
| 0–8 | Título: *Retropropagación*. Sub: *Cómo una red aprende de sus errores* | Una red neuronal aprende de una forma sorprendentemente simple: se equivoca, y luego corrige. |
| 8–30 | Perceptrón: x₁ x₂ x₃ → w → Σ → f → ŷ. Cierre en rojo: *solo separa con una línea recta* | Empieza por la pieza más pequeña: un perceptrón… Un solo perceptrón solo puede separar datos con una línea recta. |
| 30–48 | Red 3–4–2, capas entrada / oculta / salida | La solución es apilarlos. Tres capas… Sin una función no lineal entre capas, apilar no serviría de nada. |
| 48–70 | Destello dorado/coral hacia la derecha. ŷ frente a y*. *error = ŷ − y** | En el paso hacia adelante, los datos cruzan la red… La diferencia es el error. |
| 70–96 | El error viaja hacia atrás. Los pesos se marcan más gruesos | Ahora, el truco: ese error no se queda al final… Eso es retropropagación. |
| 96–110 | Un ciclo rápido ida y vuelta. *Millones de veces. Ese es el aprendizaje profundo.* | Repetido millones de veces… desde clasificar una pieza defectuosa hasta los modelos de lenguaje. |

## 2. Modelos de difusión — ~105 s · IX L4

| t | Pantalla | Narración |
|---|---|---|
| 0–8 | Título: *Modelos de difusión* | Hay más de una forma de generar una imagen. Las GAN lo hacen de un solo golpe… |
| 8–24 | Rejilla 8×8: pieza gris con rayón rojo | Parte de una imagen real. |
| 24–48 | Seis pasos de ruido hasta gris aleatorio | En cada paso se añade un poco de ruido. Después de decenas de pasos, ya no queda la imagen: solo ruido. |
| 48–80 | Seis pasos inversos. Vuelve el rayón. *si hay un prompt, la limpieza va guiada* | El modelo aprende exactamente ese proceso. Y luego lo invierte… |
| 80–96 | GAN (un paso) frente a Difusión (muchos refinamientos) | A diferencia de una GAN… la difusión construye la imagen en decenas o cientos de refinamientos. |
| 96–105 | ¿Tiempo real? GAN. ¿Generar una vez? Difusión. | Por eso suele verse más estable… Si puedes generar una vez y reutilizar, la difusión suele ganar. |

## 3. Arquitectura Lambda — ~100 s · III L1

| t | Pantalla | Narración |
|---|---|---|
| 0–8 | Título: *Arquitectura Lambda* | Cuando una organización necesita a la vez el histórico completo y reaccionar a lo que acaba de pasar… |
| 8–24 | Caja *Datos* a la izquierda | Los datos entran por un solo sitio. A partir de ahí, se dividen en dos caminos. |
| 24–46 | Flecha dorada → *Capa batch* (histórico · periódico · exacto) | El primero es la capa batch… llega con el siguiente ciclo —esta noche, este fin de semana. |
| 46–66 | Flecha coral → *Capa streaming* (cada evento · ahora · aproximado) | El segundo es la capa de streaming… Sirve para decidir ahora, no para el informe mensual. |
| 66–84 | Ambas flechas → *Capa de servicio* | Las dos respuestas se combinan… lo exacto del batch más lo reciente del flujo. |
| 84–100 | *¿La decisión de verdad no puede esperar al siguiente lote?* | Es potente. También es cara de mantener… |
