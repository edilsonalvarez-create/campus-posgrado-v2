// Panel desplegable "Lectura guiada — refuerzo de términos" que acompaña a las
// lecciones conceptuales del curso "Ruta de Mando en Seguridad y QA".
// Cada término trae su definición textual con la fuente citada, la idea
// principal, un ejemplo cotidiano, un ejemplo aplicado a Horus Health, el error
// más frecuente y una frase para memorizar; cierra con un caso completo que une
// todos los términos, preguntas de comprensión y la lista de fuentes.

import { useState } from 'react'

type Termino = {
  n: number
  termino: string
  definicionTextual: string
  fuente: string
  idea: string[]
  ejemplo?: string | null
  ejemploHorus?: string | null
  errorComun?: string | null
  fraseClave: string
}

type Paso = { titulo: string; texto: string }

type PreguntaLG = { q: string; opts: string[]; a: number; why: string }

type Fuente = { titulo: string; url?: string | null }

export type LecturaGuiadaData = {
  objetivo: string
  intro?: string[]
  terminos: Termino[]
  conexion?: string[]
  casoCompleto?: { escenario: string; pasos: Paso[] } | null
  preguntas?: PreguntaLG[]
  cierre?: string | null
  fuentes: Fuente[]
}

export function LecturaGuiada({ data }: { data: LecturaGuiadaData }) {
  return (
    <details className="my-6 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-900/15 overflow-hidden">
      <summary className="cursor-pointer select-none px-4 py-3 font-semibold text-gray-900 dark:text-white list-none flex items-center gap-2 hover:bg-amber-100/60 dark:hover:bg-amber-900/25">
        <span aria-hidden>📖</span>
        Lectura guiada — refuerzo de términos
        <span className="ml-auto text-xs font-normal text-gray-500 dark:text-gray-400">
          {data.terminos.length} términos · desplegar
        </span>
      </summary>

      <div className="px-4 pb-5 pt-1 border-t border-amber-200 dark:border-amber-800">
        <p className="my-3 text-sm italic text-gray-700 dark:text-gray-300">{data.objetivo}</p>

        {data.intro?.map((p, i) => (
          <p key={i} className="my-2 leading-relaxed text-gray-700 dark:text-gray-300">
            {p}
          </p>
        ))}

        <div className="mt-5 space-y-5">
          {data.terminos.map((t) => (
            <div key={t.n} className="rounded border border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-800 p-4">
              <p className="font-semibold text-gray-900 dark:text-white">
                {t.n}. {t.termino}
              </p>
              <blockquote className="my-2 border-l-4 border-amber-400 pl-3 text-gray-700 dark:text-gray-300">
                «{t.definicionTextual}»
                <span className="block mt-1 text-xs text-gray-500 dark:text-gray-400">Fuente: {t.fuente}</span>
              </blockquote>
              {t.idea.map((p, i) => (
                <p key={i} className="my-2 leading-relaxed text-gray-700 dark:text-gray-300">
                  {p}
                </p>
              ))}
              {t.ejemplo && (
                <p className="my-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-gray-900 dark:text-white">Ejemplo cotidiano. </span>
                  {t.ejemplo}
                </p>
              )}
              {t.ejemploHorus && (
                <p className="my-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-gray-900 dark:text-white">En Horus Health. </span>
                  {t.ejemploHorus}
                </p>
              )}
              {t.errorComun && (
                <p className="my-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-gray-900 dark:text-white">Error frecuente. </span>
                  {t.errorComun}
                </p>
              )}
              <p className="mt-2 text-sm font-medium text-amber-800 dark:text-amber-300">💡 {t.fraseClave}</p>
            </div>
          ))}
        </div>

        {data.conexion && data.conexion.length > 0 && (
          <div className="mt-6">
            <p className="font-semibold text-gray-900 dark:text-white mb-1">Cómo se conectan los términos</p>
            {data.conexion.map((p, i) => (
              <p key={i} className="my-2 leading-relaxed text-gray-700 dark:text-gray-300">
                {p}
              </p>
            ))}
          </div>
        )}

        {data.casoCompleto && (
          <div className="mt-6 rounded border border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-800 p-4">
            <p className="font-semibold text-gray-900 dark:text-white mb-1">Caso completo</p>
            <p className="my-2 text-gray-700 dark:text-gray-300">{data.casoCompleto.escenario}</p>
            <ol className="mt-2 space-y-2">
              {data.casoCompleto.pasos.map((p, i) => (
                <li key={i} className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-gray-900 dark:text-white">{p.titulo}. </span>
                  {p.texto}
                </li>
              ))}
            </ol>
          </div>
        )}

        {data.preguntas && data.preguntas.length > 0 && (
          <div className="mt-6">
            <p className="font-semibold text-gray-900 dark:text-white mb-2">Preguntas de comprensión</p>
            <div className="space-y-3">
              {data.preguntas.map((p, i) => (
                <PreguntaComprension key={i} n={i + 1} pregunta={p} />
              ))}
            </div>
          </div>
        )}

        {data.cierre && (
          <p className="mt-6 leading-relaxed text-gray-700 dark:text-gray-300">{data.cierre}</p>
        )}

        <div className="mt-6">
          <p className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Fuentes</p>
          <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {data.fuentes.map((f, i) => (
              <li key={i}>
                {f.url ? (
                  <a href={f.url} target="_blank" rel="noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                    {f.titulo}
                  </a>
                ) : (
                  f.titulo
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  )
}

// Pregunta de comprensión individual: opciones seleccionables + botón
// "Comprobar respuesta". Verificación puramente local (no persiste ni cuenta
// para completar la lección, a diferencia del quiz formativo de LessonFormative).
function PreguntaComprension({ n, pregunta }: { n: number; pregunta: PreguntaLG }) {
  const [chosen, setChosen] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)

  return (
    <div className="rounded border border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-800 p-3">
      <p className="text-gray-800 dark:text-gray-200 mb-2">
        {n}. {pregunta.q}
      </p>
      <div className="space-y-1.5">
        {pregunta.opts.map((o, j) => {
          const isChosen = chosen === j
          const isCorrect = checked && pregunta.a === j
          const isWrongChoice = checked && isChosen && pregunta.a !== j
          return (
            <button
              key={j}
              type="button"
              onClick={() => !checked && setChosen(j)}
              disabled={checked}
              className={`w-full text-left px-2.5 py-1.5 rounded border text-sm flex items-start gap-2 ${
                isCorrect
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : isWrongChoice
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                    : isChosen
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-amber-300'
              }`}
            >
              {checked && <span>{isCorrect ? '✓' : isWrongChoice ? '✗' : ''}</span>}
              <span>
                {String.fromCharCode(97 + j)}) {o}
              </span>
            </button>
          )
        })}
      </div>

      {!checked ? (
        <button
          type="button"
          onClick={() => setChecked(true)}
          disabled={chosen === null}
          className="mt-3 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium disabled:bg-gray-400"
        >
          Comprobar respuesta
        </button>
      ) : (
        <div className="mt-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className={`font-semibold ${chosen === pregunta.a ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
              {chosen === pregunta.a ? 'Correcto. ' : 'Revisar. '}
            </span>
            {pregunta.why}
          </p>
          <button
            type="button"
            onClick={() => {
              setChecked(false)
              setChosen(null)
            }}
            className="mt-1 text-xs text-amber-700 dark:text-amber-400 hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}
