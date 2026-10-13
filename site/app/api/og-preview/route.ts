import { NextRequest, NextResponse } from 'next/server'

function extractMeta(html: string, ...selectors: string[]): string {
  for (const sel of selectors) {
    // property="sel" content="..." or content="..." property="sel"
    const re1 = new RegExp(`<meta[^>]+property=["']${sel}["'][^>]+content=["']([^"']*?)["']`, 'i')
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']*?)["'][^>]+property=["']${sel}["']`, 'i')
    const re3 = new RegExp(`<meta[^>]+name=["']${sel}["'][^>]+content=["']([^"']*?)["']`, 'i')
    const re4 = new RegExp(`<meta[^>]+content=["']([^"']*?)["'][^>]+name=["']${sel}["']`, 'i')
    const match = re1.exec(html) ?? re2.exec(html) ?? re3.exec(html) ?? re4.exec(html)
    if (match?.[1]) return match[1]
  }
  return ''
}

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
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
    const image = decodeEntities(extractMeta(html, 'og:image', 'twitter:image'))
    const site_name = decodeEntities(extractMeta(html, 'og:site_name'))
    const ogUrl = decodeEntities(extractMeta(html, 'og:url')) || target.toString()

    return NextResponse.json({ title, description, image, site_name, url: ogUrl })
  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 502 })
  }
}
