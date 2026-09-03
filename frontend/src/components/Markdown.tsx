// Renderizador markdown minimalista (encabezados, listas, negrita, código, párrafos).
// Suficiente para el contenido docente del seed; sin dependencias externas.

function renderInline(text: string, keyPrefix: string) {
  const nodes: (string | JSX.Element)[] = []
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = regex.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    const tok = m[0]
    if (tok.startsWith('**')) {
      nodes.push(<strong key={`${keyPrefix}-b${i}`}>{tok.slice(2, -2)}</strong>)
    } else {
      nodes.push(
        <code key={`${keyPrefix}-c${i}`} className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-sm">
          {tok.slice(1, -1)}
        </code>,
      )
    }
    last = m.index + tok.length
    i++
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export function Markdown({ text }: { text: string }) {
  if (!text) return null
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const blocks: JSX.Element[] = []
  let list: string[] = []
  let para: string[] = []
  let code: string[] | null = null

  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={`ul${blocks.length}`} className="list-disc pl-6 space-y-1 my-3 text-gray-700 dark:text-gray-300">
          {list.map((li, i) => (
            <li key={i}>{renderInline(li, `li${blocks.length}-${i}`)}</li>
          ))}
        </ul>,
      )
      list = []
    }
  }
  const flushPara = () => {
    if (para.length) {
      const t = para.join(' ')
      blocks.push(
        <p key={`p${blocks.length}`} className="my-3 leading-relaxed text-gray-700 dark:text-gray-300">
          {renderInline(t, `p${blocks.length}`)}
        </p>,
      )
      para = []
    }
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (line.startsWith('```') || line.startsWith('~~~')) {
      if (code === null) {
        flushList()
        flushPara()
        code = []
      } else {
        blocks.push(
          <pre
            key={`pre${blocks.length}`}
            className="my-3 p-3 rounded bg-gray-900 text-gray-100 text-sm overflow-x-auto whitespace-pre"
          >
            {code.join('\n')}
          </pre>,
        )
        code = null
      }
      continue
    }
    if (code !== null) {
      code.push(raw)
      continue
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/)
    if (h) {
      flushList()
      flushPara()
      const level = h[1].length
      const cls =
        level === 1
          ? 'text-2xl font-bold mt-6 mb-2'
          : level === 2
            ? 'text-xl font-semibold mt-5 mb-2'
            : 'text-lg font-semibold mt-4 mb-1'
      blocks.push(
        <div key={`h${blocks.length}`} className={`${cls} text-gray-900 dark:text-white`}>
          {renderInline(h[2], `h${blocks.length}`)}
        </div>,
      )
      continue
    }
    const li = line.match(/^\s*[-*]\s+(.*)$/)
    if (li) {
      flushPara()
      list.push(li[1])
      continue
    }
    if (!line) {
      flushList()
      flushPara()
      continue
    }
    flushList()
    para.push(line)
  }
  flushList()
  flushPara()
  if (code !== null && code.length) {
    blocks.push(
      <pre key={`pre${blocks.length}`} className="my-3 p-3 rounded bg-gray-900 text-gray-100 text-sm overflow-x-auto whitespace-pre">
        {code.join('\n')}
      </pre>,
    )
  }
  return <div>{blocks}</div>
}
