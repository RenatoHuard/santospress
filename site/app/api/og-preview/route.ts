import { NextRequest, NextResponse } from 'next/server'

// Entidades HTML mais comuns, incluindo caracteres do português
const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  nbsp: ' ', copy: '©', reg: '®', trade: '™',
  // Pontuação tipográfica
  mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’',
  ldquo: '“', rdquo: '”', hellip: '…', bull: '•',
  middot: '·', prime: '′', Prime: '″', tilde: '~', sim: '~',
  // Português / espanhol
  ccedil: 'ç', Ccedil: 'Ç',
  atilde: 'ã', Atilde: 'Ã', otilde: 'õ', Otilde: 'Õ',
  agrave: 'à', Agrave: 'À', aacute: 'á', Aacute: 'Á',
  acirc:  'â', Acirc:  'Â', auml:   'ä', Auml:   'Ä',
  eacute: 'é', Eacute: 'É', egrave: 'è', Egrave: 'È',
  ecirc:  'ê', Ecirc:  'Ê', euml:   'ë', Euml:   'Ë',
  iacute: 'í', Iacute: 'Í', icirc:  'î', Icirc:  'Î',
  oacute: 'ó', Oacute: 'Ó', ocirc:  'ô', Ocirc:  'Ô',
  ouml:   'ö', Ouml:   'Ö', ugrave: 'ù', Ugrave: 'Ù',
  uacute: 'ú', Uacute: 'Ú', ucirc:  'û', Ucirc:  'Û',
  uuml:   'ü', Uuml:   'Ü', ntilde: 'ñ', Ntilde: 'Ñ',
  szlig:  'ß',
}

function decodeEntities(s: string): string {
  return s
    .replace(/&([a-zA-Z]+);/g, (m, name) => ENTITIES[name] ?? m)
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
}

function extractMeta(html: string, ...selectors: string[]): string {
  for (const sel of selectors) {
    const patterns = [
      new RegExp(`<meta[^>]+property=["']${sel}["'][^>]+content=["']([^"']*?)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']*?)["'][^>]+property=["']${sel}["']`, 'i'),
      new RegExp(`<meta[^>]+name=["']${sel}["'][^>]+content=["']([^"']*?)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']*?)["'][^>]+name=["']${sel}["']`, 'i'),
    ]
    for (const re of patterns) {
      const m = re.exec(html)
      if (m?.[1]) return m[1]
    }
  }
  return ''
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get('url')
  if (!rawUrl) return NextResponse.json({ error: 'url required' }, { status: 400 })

  let target: URL
  try {
    target = new URL(rawUrl)
    if (!['http:', 'https:'].includes(target.protocol)) throw new Error()
  } catch {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 })
  }

  try {
    const res = await fetch(target.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) return NextResponse.json({ error: 'remote fetch failed' }, { status: 502 })

    const html = await res.text()

    const title = decodeEntities(
      extractMeta(html, 'og:title', 'twitter:title') ||
      (/<title[^>]*>([^<]+)<\/title>/i.exec(html)?.[1] ?? ''),
    )
    const description = decodeEntities(
      extractMeta(html, 'og:description', 'twitter:description', 'description'),
    )
    const image     = decodeEntities(extractMeta(html, 'og:image', 'twitter:image'))
    const site_name = decodeEntities(extractMeta(html, 'og:site_name'))
    const ogUrl     = decodeEntities(extractMeta(html, 'og:url')) || target.toString()

    return NextResponse.json({ title, description, image, site_name, url: ogUrl })
  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 502 })
  }
}
