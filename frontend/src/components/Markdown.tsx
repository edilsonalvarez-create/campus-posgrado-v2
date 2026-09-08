// Renderizador Markdown completo: encabezados, listas (con y sin orden), tablas,
// enlaces, imágenes, citas, código en bloque e inline, énfasis. GFM + sanitizado.
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

export function Markdown({ text }: { text: string }) {
  return (
    <div className="mdx text-gray-700 dark:text-gray-300 leading-relaxed [&>*:first-child]:mt-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: (p) => <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-3" {...p} />,
          h2: (p) => <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-5 mb-2" {...p} />,
          h3: (p) => <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2" {...p} />,
          h4: (p) => <h4 className="font-semibold text-gray-900 dark:text-white mt-3 mb-1" {...p} />,
          p: (p) => <p className="my-3" {...p} />,
          a: (p) => (
            <a
              {...p}
              target="_blank"
              rel="noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            />
          ),
          ul: (p) => <ul className="list-disc pl-6 my-3 space-y-1" {...p} />,
          ol: (p) => <ol className="list-decimal pl-6 my-3 space-y-1" {...p} />,
          li: (p) => <li className="marker:text-gray-400" {...p} />,
          blockquote: (p) => (
            <blockquote className="border-l-4 border-primary-300 dark:border-primary-700 pl-4 my-4 italic text-gray-600 dark:text-gray-400" {...p} />
          ),
          code: ({ className, children, ...rest }) => {
            const inline = !className
            return inline ? (
              <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-sm font-mono" {...rest}>
                {children}
              </code>
            ) : (
              <code className={className} {...rest}>
                {children}
              </code>
            )
          },
          pre: (p) => (
            <pre className="my-4 p-4 rounded-lg bg-gray-900 text-gray-100 text-sm overflow-x-auto" {...p} />
          ),
          table: (p) => (
            <div className="my-4 overflow-x-auto">
              <table className="min-w-full text-sm border-collapse" {...p} />
            </div>
          ),
          thead: (p) => <thead className="bg-gray-50 dark:bg-gray-800" {...p} />,
          th: (p) => <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-semibold" {...p} />,
          td: (p) => <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 align-top" {...p} />,
          img: (p) => <img {...p} className="my-4 rounded-lg max-w-full" loading="lazy" />,
          hr: () => <hr className="my-6 border-gray-200 dark:border-gray-700" />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}
