import type { ReactNode } from 'react'
import { SocialLinkCard, type SocialPreview } from '@/components/SocialLinkCard'

const PROSE = 'prose prose-lg max-w-none prose-headings:text-navy prose-a:text-gold prose-strong:text-navy'

function attr(tag: string, name: string): string {
  const m = new RegExp(`${name}="([^"]*?)"`).exec(tag)
  if (!m) return ''
  try { return decodeURIComponent(m[1]) } catch { return m[1] }
}

export function renderContent(html: string): ReactNode {
  const CARD = /<div[^>]*data-social-card="true"[^>]*><\/div>/g
  const nodes: ReactNode[] = []
  let last = 0
  let key = 0
  let m: RegExpExecArray | null

  while ((m = CARD.exec(html)) !== null) {
    if (m.index > last) {
      nodes.push(
        <div key={key++} className={PROSE}
          dangerouslySetInnerHTML={{ __html: html.slice(last, m.index) }}
        />
      )
    }

    const tag = m[0]
    const url = attr(tag, 'data-url')
    if (url) {
      const preview: SocialPreview = {
        url,
        title:       attr(tag, 'data-title'),
        description: attr(tag, 'data-description'),
        image:       attr(tag, 'data-image'),
        site_name:   attr(tag, 'data-site-name'),
      }
      nodes.push(<SocialLinkCard key={key++} url={url} preview={preview} />)
    }

    last = m.index + m[0].length
  }

  if (last < html.length) {
    nodes.push(
      <div key={key++} className={PROSE}
        dangerouslySetInnerHTML={{ __html: html.slice(last) }}
      />
    )
  }

  if (nodes.length === 0) {
    return <div className={PROSE} dangerouslySetInnerHTML={{ __html: html }} />
  }

  return <>{nodes}</>
}
