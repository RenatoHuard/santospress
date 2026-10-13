import type { ReactNode } from 'react'
import { SocialLinkCard, type SocialPreview } from '@/components/SocialLinkCard'

const PROSE = 'prose prose-lg max-w-none prose-headings:text-navy prose-a:text-gold prose-strong:text-navy'

// Decodifica entidades HTML que o serializer do ProseMirror escreve nos atributos
function htmlAttrDecode(s: string): string {
  return s
    .replace(/&amp;/g,  '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g,  "'")
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
}

// Decode compatível com formato antigo (encodeURIComponent) e novo (raw)
function decodeAttr(raw: string, isUrl: boolean): string {
  // Primeiro decodifica entidades HTML (formato novo do ProseMirror)
  const s = htmlAttrDecode(raw)

  if (isUrl) {
    // Formato antigo: o protocolo estava encodeURIComponent → "https%3A..."
    if (s.startsWith('https%3A') || s.startsWith('http%3A')) {
      try { return decodeURIComponent(s) } catch { return s }
    }
    return s
  } else {
    // Texto (title, description, site_name): backward-compat com encodeURIComponent
    if (/%[0-9A-Fa-f]{2}/.test(s)) {
      try { return decodeURIComponent(s) } catch {}
    }
    return s
  }
}

function attr(tag: string, name: string): string {
  const m = new RegExp(`${name}="([^"]*?)"`).exec(tag)
  return m ? m[1] : ''
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
    const url = decodeAttr(attr(tag, 'data-url'), true)
    if (url) {
      const preview: SocialPreview = {
        url,
        image:       decodeAttr(attr(tag, 'data-image'),       true),
        title:       decodeAttr(attr(tag, 'data-title'),       false),
        description: decodeAttr(attr(tag, 'data-description'), false),
        site_name:   decodeAttr(attr(tag, 'data-site-name'),   false),
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
