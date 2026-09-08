# Guiones de micro-vídeo — 3 diagramas difíciles (WS-8 / hallazgo G-10)

La auditoría pide micro-vídeos producidos de los diagramas que más cuesta seguir
solo con texto. La producción (grabación de pantalla + animación) es trabajo
externo; aquí están los guiones listos para grabar. Cada uno: 90–120 s, una
pizarra o slides animadas + voz.

**Cómo publicarlo cuando esté grabado:** subir el vídeo (o su enlace
`youtube-nocookie`) y añadirlo a la lección correspondiente en
`master-*-lecciones.js` dentro de `recursos.videos` como
`{ titulo, canal: 'Máster IEP', url, minutos, concepto }`. El componente
`VideoPlayer` ya lo incrusta. Alternativa: campo `microVideoUrl` en la lección
si se quiere destacarlo sobre el resto de recursos.

---

## 1 · Retropropagación (backpropagation)
**Dónde:** Asignatura III, L6 "Redes neuronales Artificiales" · Asignatura VI (repaso).
**Objetivo del vídeo:** que quede claro que la retropropagación *reparte la culpa*
del error entre los pesos, y que es distinta del paso de actualización.
**Duración:** ~110 s.

| t | En pantalla | Narración |
|---|---|---|
| 0–12 s | Red de 3 capas (2-3-1) dibujada. Una entrada entra, sale un número. | "Una red neuronal es una cadena de multiplicaciones y sumas. Metes una entrada, sale una predicción. Aquí sale 0,8." |
| 12–25 s | Aparece la etiqueta real "1" y el error "0,2" resaltado en rojo a la derecha. | "Pero la respuesta correcta era 1. El error es 0,2. La pregunta es: ¿qué peso, de todos estos, tengo que cambiar, y cuánto, para reducir ese error?" |
| 25–55 s | El error 0,2 empieza a "fluir" hacia atrás. Flechas rojas desde la salida hacia la última capa; en cada peso aparece un número pequeño (su gradiente). | "La retropropagación responde eso. Empieza en la salida y va hacia atrás, capa por capa. En cada peso calcula: si muevo este peso un poquito, ¿cuánto cambia el error? Ese número es el gradiente del peso." |
| 55–80 s | La onda roja llega a la primera capa. Todos los pesos tienen ahora su gradiente anotado. Texto: "regla de la cadena". | "Lo hace con la regla de la cadena del cálculo: el efecto de un peso de la primera capa sobre el error final es el producto de los efectos a lo largo de todo el camino hasta la salida. Al terminar, cada peso de la red sabe cuánto contribuyó al error." |
| 80–100 s | Split screen. Izquierda: "Retropropagación = calcular los gradientes". Derecha: "Descenso de gradiente = restar un pasito de cada peso". Los pesos se actualizan. | "Ojo con la confusión típica: la retropropagación *calcula* los gradientes. Quien *mueve* los pesos es el optimizador, con el descenso de gradiente: peso = peso − (paso · gradiente). Son dos pasos distintos." |
| 100–110 s | La entrada vuelve a pasar; ahora la salida es 0,86, error 0,14. | "Repites: adelante para predecir, atrás para repartir la culpa, un pasito para corregir. Miles de veces. Eso es entrenar." |

**Frase para cerrar (texto en pantalla):** *La retropropagación reparte la culpa; el optimizador aplica la corrección.*

---

## 2 · Modelos de difusión
**Dónde:** Asignatura IX "IA generativa aplicada", lección de arquitecturas generativas.
**Objetivo del vídeo:** entender difusión como "aprender a quitar ruido, paso a paso".
**Duración:** ~105 s.

| t | En pantalla | Narración |
|---|---|---|
| 0–15 s | Una foto nítida de un objeto industrial. A su lado, una barra de tiempo con pasos 0 → T. | "Un modelo de difusión aprende a generar imágenes de una forma que suena rara: aprendiendo a destruirlas primero." |
| 15–35 s | La foto se degrada en pasos: un poco de ruido, más, más… hasta ser puro ruido (T). Flecha "proceso hacia adelante: añadir ruido". | "El proceso hacia adelante toma una imagen real y le añade un poco de ruido gaussiano en cada paso, hasta que a los, digamos, mil pasos, no queda nada: solo estática. Esto no se entrena, es una receta fija." |
| 35–60 s | Ahora al revés: de la estática, un paso quita un poco de ruido, luego otro… La flecha dice "proceso inverso: el modelo aprende a quitar ruido". | "Lo que se entrena es lo contrario: una red que, dada una imagen ruidosa y el número de paso, predice el ruido que hay que quitar para acercarse un paso a una imagen limpia." |
| 60–85 s | Empieza de ruido puro totalmente nuevo (no la foto original). Se aplican los pasos inversos uno a uno; emerge una imagen nueva, plausible, distinta de la original. | "Para generar algo nuevo, arrancas de ruido puro al azar y aplicas esa red de quitar-ruido paso a paso. Como en cada paso solo tiene que resolver un problema pequeño —quitar un poco de ruido—, el resultado final es una imagen coherente que nunca existió." |
| 85–105 s | Comparativa rápida: "GAN: un salto, difícil de estabilizar" vs "Difusión: muchos pasos pequeños, más estable, más lento". | "Frente a una GAN, que intenta el salto de ruido a imagen de una vez y es difícil de entrenar, la difusión cambia velocidad por estabilidad: muchos pasos pequeños, entrenamiento más dócil, generación más lenta." |

**Frase para cerrar:** *Difusión = aprender a quitar ruido un poco cada vez; generar es quitar ruido desde cero.*

---

## 3 · Arquitectura Lambda (batch + streaming)
**Dónde:** Asignatura III, L1 "Arquitecturas y Soluciones de Big Data".
**Objetivo del vídeo:** ver por qué se mantienen dos caminos y cuándo NO hace falta.
**Duración:** ~100 s.

| t | En pantalla | Narración |
|---|---|---|
| 0–12 s | Una fuente de datos (eventos) a la izquierda. Una pregunta a la derecha: "¿cuántas ventas llevamos hoy, exacto?". | "Tienes un flujo de eventos entrando sin parar y dos necesidades a la vez: una respuesta *exacta* e histórica, y una respuesta *inmediata* aunque sea aproximada." |
| 12–40 s | Se dibuja el camino de abajo: eventos → almacenamiento crudo → proceso batch (cada hora / cada noche) → "vista batch: exacta, con retraso". | "El camino batch guarda todos los eventos en crudo y, periódicamente, recalcula la verdad completa desde el principio. Es exacto y tolera errores —si algo falla, relanzas— pero llega con horas de retraso." |
| 40–65 s | Se dibuja el camino de arriba, en paralelo: eventos → proceso streaming → "vista tiempo real: rápida, aproximada, solo lo reciente". | "El camino streaming procesa cada evento al vuelo y mantiene un resultado aproximado de lo más reciente. Es rápido —segundos— pero más frágil y solo cubre la ventana reciente." |
| 65–85 s | Una capa de consulta a la derecha combina las dos vistas: "histórico exacto (batch) + últimos minutos (streaming)". | "La capa de servicio combina las dos: te da el histórico exacto del batch más los últimos minutos del streaming. El usuario ve un único número correcto y actualizado." |
| 85–100 s | Aparece tachado el camino streaming y un cartel: "¿De verdad necesitas la respuesta en segundos? Si no: solo batch. Kappa: solo streaming bien hecho." | "El coste de Lambda es mantener dos bases de código que calculan lo mismo. Antes de montarla, pregúntate si el negocio necesita de verdad la latencia de segundos. Si no, solo batch. Y si sí, mira Kappa: un solo camino streaming bien hecho que también reprocesa el histórico." |

**Frase para cerrar:** *Dos caminos solo si el reloj lo exige; si no, uno.*
