// Reproductor embebido para recursos de vídeo. YouTube/Vimeo en iframe
// (privacy-mode), o <video> para MP4 directo. Reemplaza los enlaces sueltos.
function toEmbed(url: string): { kind: 'youtube' | 'vimeo' | 'file' | 'link'; src: string } {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') || u.hostname === 'youtu.be') {
      const id = u.hostname === 'youtu.be' ? u.pathname.slice(1) : u.searchParams.get('v') || u.pathname.split('/').pop() || ''
      return { kind: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}` }
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop() || ''
      return { kind: 'vimeo', src: `https://player.vimeo.com/video/${id}` }
    }
    if (/\.(mp4|webm|ogg)$/i.test(u.pathname)) return { kind: 'file', src: url }
  } catch {
    /* url inválida */
  }
  return { kind: 'link', src: url }
}

export function VideoPlayer({ url, title }: { url: string; title?: string }) {
  const { kind, src } = toEmbed(url)
  if (kind === 'link') {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline text-sm">
        ▶ {title || 'Ver vídeo'} ↗
      </a>
    )
  }
  return (
    <div className="my-3">
      {title && <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{title}</p>}
      <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ paddingTop: '56.25%' }}>
        {kind === 'file' ? (
          <video src={src} controls className="absolute inset-0 w-full h-full" />
        ) : (
          <iframe
            src={src}
            title={title || 'vídeo'}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        )}
      </div>
    </div>
  )
}
