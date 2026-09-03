// Cursos Nativos de Excelente Calidad - Equivalentes a MIT, Google, Andrew Ng
// Diseñados para garantizar asimilación profunda de conceptos

const nativeCurriculum = {
  // CURSO 1: Fundamentos de Inteligencia Artificial (Equivalente MIT 6.034)
  'native-ai-101': {
    id: 'native-ai-101',
    title: 'Fundamentos de Inteligencia Artificial',
    equivalentTo: 'MIT 6.034 Artificial Intelligence',
    credits: 12,
    duration: '12 semanas',
    level: 'Principiante a Intermedio',
    learningOutcomes: [
      'Comprender los principios fundamentales de la IA',
      'Implementar algoritmos de búsqueda y resolución de problemas',
      'Desarrollar sistemas de representación del conocimiento',
      'Aplicar razonamiento lógico y probabilístico'
    ],
    modules: [
      {
        id: 'mod-ai-1',
        week: 1,
        title: 'Introducción a la Inteligencia Artificial',
        subtopics: [
          {
            name: 'Historia y Definiciones de IA',
            duration: '180 min',
            concepts: [
              'Test de Turing',
              'Hipótesis del juego de imitación',
              'Definiciones de IA fuerte vs débil',
              'Ramas de la IA: Machine Learning, Robotics, NLP, Computer Vision'
            ],
            content: `
              # Historia de la Inteligencia Artificial

              ## El Test de Turing (1950)
              Alan Turing propuso un test simple pero profundo: ¿Puede una máquina demostrar inteligencia
              de forma indistinguible de un humano? Este test revolucionó cómo pensamos sobre IA.

              ## Veranos de IA (1956-1974)
              - Conferencia de Dartmouth: nace la IA como disciplina
              - Optimismo inicial: "Esperamos que en 20 años las máquinas superen a los humanos"
              - Primeros sistemas expertos

              ## Inviernos de IA (1974-1980, 1987-1993)
              - Limitaciones computacionales
              - Expectativas no cumplidas
              - Crisis de financiamiento

              ## Renacimiento de la IA (1993-presente)
              - Aumento de poder computacional
              - Big Data
              - Deep Learning Revolution (2012)
              - Era de la IA moderna
            `,
            exercises: [
              {
                type: 'conceptual',
                question: '¿Cómo definirías inteligencia? ¿Es el Test de Turing una buena métrica?',
                rubric: 'Claridad de definición, profundidad del análisis'
              },
              {
                type: 'research',
                question: 'Investiga 3 aplicaciones modernas de IA y clasifícalas por rama',
                rubric: 'Precisión, variedad, análisis crítico'
              }
            ],
            assessments: [
              {
                type: 'quiz',
                questions: [
                  {
                    q: '¿Cuál fue el impacto del Test de Turing en la IA?',
                    options: ['Definir un estándar objetivo', 'Crear máquinas inteligentes', 'Financiar investigación'],
                    correct: 0
                  },
                  {
                    q: '¿En qué año se propuso la Conferencia de Dartmouth?',
                    options: ['1950', '1956', '1960'],
                    correct: 1
                  }
                ]
              }
            ]
          },
          {
            name: 'Ramas de la Inteligencia Artificial',
            duration: '180 min',
            concepts: [
              'Machine Learning y sus subdivisiones',
              'Procesamiento de Lenguaje Natural (NLP)',
              'Visión por Computadora',
              'Robótica',
              'Sistemas Expertos',
              'Razonamiento Automático'
            ],
            content: `
              # Ramas de la Inteligencia Artificial

              ## 1. Machine Learning (Aprendizaje Automático)
              La rama de la IA que permite a las máquinas aprender de datos sin ser programadas explícitamente.

              ### Subdivisiones:
              - **Aprendizaje Supervisado**: Regresión, Clasificación
              - **Aprendizaje No Supervisado**: Clustering, Dimensionality Reduction
              - **Aprendizaje por Refuerzo**: Control, Robots, Juegos
              - **Deep Learning**: Redes Neuronales Profundas

              ### Aplicaciones:
              - Recomendaciones (Netflix, Spotify)
              - Detección de fraude
              - Diagnósticos médicos
              - Conducción autónoma

              ## 2. Procesamiento de Lenguaje Natural (NLP)
              Permite a las máquinas comprender, interpretar y generar lenguaje humano.

              ### Tareas principales:
              - Análisis de sentimientos
              - Traducción automática
              - Respuesta a preguntas
              - Generación de texto

              ### Modelos modernos:
              - Transformers (BERT, GPT)
              - Word Embeddings (Word2Vec, GloVe)
              - Modelos de lenguaje grandes

              ## 3. Visión por Computadora
              Capacidad de las máquinas para interpretar imágenes y videos.

              ### Tareas:
              - Clasificación de imágenes
              - Detección de objetos
              - Segmentación semántica
              - Reconocimiento facial

              ## 4. Robótica
              Sistemas físicos autónomos que perciben y actúan en el mundo.

              ### Desafíos:
              - Percepción
              - Planificación de movimiento
              - Control motor
              - Aprendizaje de tareas
            `,
            practicalProject: {
              title: 'Proyecto: Mapear aplicaciones de IA por rama',
              description: 'Crea una matriz 3x3 de aplicaciones reales clasificadas por rama y nivel de complejidad',
              requirements: [
                'Identificar al menos 15 aplicaciones diferentes',
                'Clasificar por rama principal de IA',
                'Evaluar complejidad técnica (baja/media/alta)',
                'Incluir referencias y descripciones'
              ],
              deliverable: 'Documento con matriz y análisis'
            }
          }
        ]
      },
      {
        id: 'mod-ai-2',
        week: '2-3',
        title: 'Resolución de Problemas y Búsqueda',
        subtopics: [
          {
            name: 'Formulación de Problemas y Espacios de Estados',
            concepts: [
              'Estado inicial y meta',
              'Acciones y transiciones',
              'Función de sucesor',
              'Costo de camino'
            ],
            content: `
              # Resolución de Problemas mediante Búsqueda

              ## Definición Formal de un Problema
              Un problema en IA se define formalmente como:
              - **Estado inicial**: Configuración de partida
              - **Estados meta**: Configuraciones deseadas
              - **Acciones**: Transiciones posibles
              - **Función de sucesor**: S(s) → [a₁, a₂, ..., aₙ]
              - **Costo de camino**: g(a) para cada acción

              ## Ejemplo: Puzzle 8 (8-Puzzle)
              ~~~
              Estado inicial:        Meta:
              1 2 3                  1 2 3
              4 5 6        →         4 5 6
              7 8 _                  7 8 _
              ~~~

              Acciones: Mover blanco arriba/abajo/izquierda/derecha
              Costo: 1 por movimiento

              ## Formalmente:
              - I = [[1,2,3], [4,5,6], [7,8,0]] (0 = espacio vacío)
              - G = [[1,2,3], [4,5,6], [7,8,0]]
              - A(s) = {Up, Down, Left, Right} dependiendo del espacio
            `
          },
          {
            name: 'Algoritmos de Búsqueda No Informada',
            concepts: [
              'Búsqueda en anchura (BFS)',
              'Búsqueda en profundidad (DFS)',
              'Búsqueda de costo uniforme (UCS)',
              'Análisis de complejidad: tiempo, espacio, completitud, optimalidad'
            ],
            practicalProject: {
              title: 'Implementar BFS, DFS, y UCS para 8-Puzzle',
              language: 'Python',
              framework: 'NumPy',
              requirements: [
                'Representar estado como matriz',
                'Implementar función de sucesor',
                'Implementar 3 algoritmos',
                'Analizar complejidad empíricamente',
                'Visualizar árbol de búsqueda'
              ]
            }
          },
          {
            name: 'Algoritmos Informados (Heurísticas)',
            concepts: [
              'Búsqueda best-first',
              'A* Search',
              'Heurísticas admisibles y consistentes',
              'Manhattan distance, Euclidean distance',
              'Pattern databases'
            ]
          }
        ]
      },
      {
        id: 'mod-ai-3',
        week: '4-5',
        title: 'Representación del Conocimiento y Razonamiento',
        subtopics: [
          {
            name: 'Lógica Proposicional',
            concepts: [
              'Proposiciones y conectivos',
              'Tablas de verdad',
              'Formas normales',
              'Resolución y prueba'
            ]
          },
          {
            name: 'Lógica de Primer Orden',
            concepts: [
              'Predicados y cuantificadores',
              'Unificación',
              'Forward chaining',
              'Backward chaining'
            ]
          }
        ]
      }
    ],
    assessments: [
      {
        id: 'quiz-ai-101',
        type: 'quiz',
        weight: 15,
        frequency: 'bi-weekly',
        questions: 50
      },
      {
        id: 'project-ai-101',
        type: 'hands-on',
        weight: 35,
        projects: [
          'Implementar BFS/DFS/A*',
          'Resolver 8-Puzzle',
          'Crear Knowledge Base en Prolog'
        ]
      },
      {
        id: 'exam-ai-101',
        type: 'comprehensive',
        weight: 50,
        duration: 180
      }
    ]
  },

  // CURSO 2: Machine Learning desde Cero (Equivalente Google ML Crash Course)
  'native-ml-101': {
    id: 'native-ml-101',
    title: 'Machine Learning desde Cero',
    equivalentTo: 'Google ML Crash Course',
    credits: 12,
    duration: '8 semanas',
    level: 'Principiante',
    learningOutcomes: [
      'Entender el ciclo completo de ML',
      'Implementar y entrenar modelos',
      'Evaluar y optimizar modelos',
      'Evitar trampas comunes en ML'
    ],
    modules: [
      {
        id: 'mod-ml-1',
        week: 1,
        title: 'Conceptos Fundamentales de ML',
        content: `
          # Machine Learning Fundamentals

          ## ¿Qué es Machine Learning?
          Machine Learning es un método para que las máquinas **aprendan de datos**
          sin ser programadas explícitamente para cada tarea.

          ### Ejemplo: Clasificación de Emails
          - Programación tradicional: Escribir reglas "If subject contains 'Viagra' → Spam"
          - Machine Learning: Entrenar modelo con 10,000 emails etiquetados → El modelo aprende patrones

          ## Ciclo de vida de un proyecto ML

          1. **Definir el problema**
             - ¿Qué queremos predecir?
             - ¿Tenemos datos disponibles?
             - ¿Cuál es la métrica de éxito?

          2. **Recopilar datos**
             - Cantidad: ¿Cuántos ejemplos necesitamos?
             - Calidad: ¿Son representativos?
             - Privacidad: ¿Cumplimos regulaciones?

          3. **Análisis exploratorio (EDA)**
             - Visualizar distribuciones
             - Identificar outliers
             - Detectar correlaciones

          4. **Feature Engineering**
             - Seleccionar features relevantes
             - Crear nuevas features
             - Normalizar/Escalar datos

          5. **Entrenar modelo**
             - Elegir algoritmo
             - Dividir datos (train/val/test)
             - Ajustar hyperparámetros

          6. **Evaluar**
             - Métricas: Accuracy, Precision, Recall, F1, AUC-ROC
             - Análisis de errores
             - Validación cruzada

          7. **Desplegar y monitorear**
             - Poner en producción
             - Monitorear drift
             - Re-entrenar periódicamente

          ## Los 3 Tipos de Aprendizaje

          ### Aprendizaje Supervisado
          Tenemos pares entrada-salida (X, y)
          - Regresión: y ∈ ℝ (continuo)
          - Clasificación: y ∈ {c₁, c₂, ..., cₙ} (categorías)

          ### Aprendizaje No Supervisado
          Solo tenemos entrada X
          - Clustering: Agrupar ejemplos similares
          - Dimensionality Reduction: Reducir features

          ### Aprendizaje por Refuerzo
          Agente aprende mediante rewards/penalties
          - Estados y acciones
          - Función de recompensa
        `
      },
      {
        id: 'mod-ml-2',
        week: 2,
        title: 'Regresión Lineal',
        subtopics: [
          {
            name: 'Regresión Lineal Simple',
            math: `
              y = mx + b

              Objetivo: Minimizar error cuadrático medio (MSE)
              MSE = (1/n) Σ(ŷᵢ - yᵢ)²

              Solución: Descenso de gradiente
              θ := θ - α∇J(θ)
            `,
            practicalProject: {
              title: 'Implementar regresión lineal con descenso de gradiente',
              language: 'Python (NumPy)',
              dataset: 'House prices (tamaño vs precio)',
              steps: [
                'Cargar y visualizar datos',
                'Implementar función MSE',
                'Implementar descenso de gradiente',
                'Entrenar modelo',
                'Visualizar resultados',
                'Analizar residuos'
              ]
            }
          }
        ]
      }
    ]
  },

  // CURSO 3: Deep Learning Fundamentals (Equivalente Andrew Ng Specialization)
  'native-dl-101': {
    id: 'native-dl-101',
    title: 'Fundamentos de Deep Learning',
    equivalentTo: 'Andrew Ng Deep Learning Specialization',
    credits: 18,
    duration: '16 semanas',
    level: 'Intermedio a Avanzado',
    learningOutcomes: [
      'Construir y entrenar redes neuronales',
      'Optimizar redes profundas',
      'Trabajar con CNN para visión',
      'Trabajar con RNN para secuencias',
      'Implementar mejores prácticas de DL'
    ],
    modules: [
      {
        id: 'mod-dl-1',
        week: '1-2',
        title: 'Fundamentos de Redes Neuronales',
        content: `
          # Neural Networks and Deep Learning

          ## Inspiración Biológica
          Las redes neuronales artificiales se inspiran en cómo el cerebro procesa información.

          ### Neurona Biológica vs Artificial

          Neurona Biológica:
          - Soma (cuerpo celular)
          - Dendritas (entradas)
          - Axón (salida)
          - Sinapsis (conexiones)

          Neurona Artificial:
          - Función de activación
          - Pesos sinápticos
          - Sesgo (bias)
          - Salida

          ## Perceptrón Simple

          Fórmula:
          ŷ = σ(w·x + b)

          Donde:
          - w = pesos
          - b = sesgo
          - σ = función de activación

          ## Funciones de Activación

          ### Linear (Ninguna)
          σ(z) = z
          Problema: Composición de funciones lineales es lineal → No puede aprender patrones complejos

          ### Sigmoid
          σ(z) = 1/(1+e^(-z))
          - Rango: [0,1]
          - Interpretable como probabilidad
          - Problema: Vanishing gradients en redes profundas

          ### Tanh
          σ(z) = (e^z - e^(-z))/(e^z + e^(-z))
          - Rango: [-1, 1]
          - Media cero
          - Mejor que sigmoid pero aún tiene vanishing gradients

          ### ReLU (Rectified Linear Unit)
          σ(z) = max(0, z)
          - Simple y eficiente
          - Evita vanishing gradients
          - Estado del arte en redes profundas
        `
      }
    ]
  }
};

module.exports = nativeCurriculum;
