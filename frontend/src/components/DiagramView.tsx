import { useEffect, useRef, useState } from 'react'

let mermaidInitialized = false

export function DiagramView({ title, chart }: { title?: string; chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [svg, setSvg] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function render() {
      try {
        const mermaid = (await import('mermaid')).default
        if (!mermaidInitialized) {
          mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict' })
          mermaidInitialized = true
        }
        const id = 'diagram-' + Math.random().toString(36).slice(2)
        const { svg: rendered } = await mermaid.render(id, chart)
        if (!cancelled) setSvg(rendered)
      } catch (err) {
        // El diagrama se oculta sin más para el estudiante (ver "if (error) return null"
        // abajo) para no mostrar una caja de error rota, pero el fallo se deja rastreable
        // en consola — un mermaid.mermaid malformado no debería desaparecer en silencio
        // total, como ocurrió con un diagrama real de esta plataforma antes de este log.
        console.error('DiagramView: fallo al renderizar diagrama mermaid', title, err)
        if (!cancelled) setError('No se pudo renderizar el diagrama.')
      }
    }
    render()
    return () => {
      cancelled = true
    }
  }, [chart])

  if (error) return null

  return (
    <div className="my-5 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 overflow-x-auto">
      {title && <p className="font-semibold text-gray-900 dark:text-white mb-3">{title}</p>}
      {svg ? (
        <div ref={containerRef} dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <p className="text-sm text-gray-400">Cargando diagrama…</p>
      )}
    </div>
  )
}
