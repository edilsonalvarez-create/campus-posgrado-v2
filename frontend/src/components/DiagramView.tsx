import { useEffect, useState } from 'react'

function currentTheme(): 'dark' | 'neutral' {
  if (typeof document === 'undefined') return 'neutral'
  const root = document.documentElement
  if (root.getAttribute('data-theme') === 'dark' || root.classList.contains('dark')) return 'dark'
  if (root.getAttribute('data-theme') === 'light') return 'neutral'
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'neutral'
}

export function DiagramView({ title, chart }: { title?: string; chart: string }) {
  const [error, setError] = useState<string | null>(null)
  const [svg, setSvg] = useState<string | null>(null)
  const [zoom, setZoom] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function render() {
      setError(null)
      try {
        const mermaid = (await import('mermaid')).default
        // Reinicializa si cambió el tema (mermaid no permite cambiar theme por render).
        mermaid.initialize({ startOnLoad: false, theme: currentTheme(), securityLevel: 'strict' })
        const id = 'diagram-' + Math.random().toString(36).slice(2)
        const { svg: rendered } = await mermaid.render(id, chart)
        if (!cancelled) setSvg(rendered)
      } catch (err) {
        console.error('DiagramView: fallo al renderizar diagrama mermaid', title, err)
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error desconocido')
      }
    }
    render()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart])

  if (error) {
    return (
      <div className="my-5 border border-amber-300 dark:border-amber-700 rounded-lg p-4 bg-amber-50 dark:bg-amber-900/20">
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          ⚠️ No se pudo renderizar el diagrama{title ? ` «${title}»` : ''}.
        </p>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-amber-800 dark:text-amber-300">Ver definición y error</summary>
          <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">{error}</p>
          <pre className="mt-2 p-2 rounded bg-white dark:bg-gray-800 text-xs overflow-x-auto text-gray-700 dark:text-gray-300">
            {chart}
          </pre>
        </details>
      </div>
    )
  }

  return (
    <>
      <div className="my-5 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 overflow-x-auto">
        <div className="flex items-center justify-between mb-3">
          {title && <p className="font-semibold text-gray-900 dark:text-white">{title}</p>}
          {svg && (
            <button
              onClick={() => setZoom(true)}
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline ml-auto"
            >
              🔍 Ampliar
            </button>
          )}
        </div>
        {svg ? (
          <div dangerouslySetInnerHTML={{ __html: svg }} className="[&_svg]:max-w-full [&_svg]:h-auto" />
        ) : (
          <p className="text-sm text-gray-400">Cargando diagrama…</p>
        )}
      </div>

      {zoom && svg && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setZoom(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-[95vw] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {title && <p className="font-semibold text-gray-900 dark:text-white mb-3">{title}</p>}
            <div dangerouslySetInnerHTML={{ __html: svg }} className="[&_svg]:min-w-[600px]" />
            <button
              onClick={() => setZoom(false)}
              className="mt-4 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
