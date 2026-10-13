export interface SocialPreview {
  title: string
  description: string
  image: string
  site_name: string
  url: string
}

interface Props {
  preview: SocialPreview
  url: string
}

export function SocialLinkCard({ preview, url }: Props) {
  let hostname = url
  try { hostname = new URL(url).hostname.replace('www.', '') } catch {}

  return (
    <div className="my-8">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block no-underline"
      >
        <div className="flex border border-gray-200 rounded-xl overflow-hidden hover:border-gold/60 hover:shadow-md transition-all bg-white">
          {/* Barra lateral colorida estilo WhatsApp */}
          <div className="w-1 shrink-0 bg-gold" />

          {/* Imagem (quando disponível) */}
          {preview.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.image}
              alt={preview.title}
              className="w-28 sm:w-36 shrink-0 object-cover self-stretch"
            />
          )}

          {/* Texto */}
          <div className="flex-1 px-4 py-3 min-w-0">
            <p className="text-[11px] font-semibold text-gold uppercase tracking-wider mb-1">
              {preview.site_name || hostname}
            </p>
            <p className="font-bold text-navy text-sm leading-snug line-clamp-2 group-hover:text-gold transition-colors">
              {preview.title}
            </p>
            {preview.description && (
              <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                {preview.description}
              </p>
            )}
            <p className="text-[11px] text-gray-400 mt-2 truncate">{hostname}</p>
          </div>
        </div>
      </a>
    </div>
  )
}
