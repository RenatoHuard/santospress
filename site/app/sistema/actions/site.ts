'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key === 'sua_service_role_key_aqui') throw new Error('SERVICE_KEY_NOT_SET')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
}

export type ConteudoSite = Record<string, Record<string, string>>

export async function getConteudoSite(): Promise<ConteudoSite> {
  const { data } = await serviceClient()
    .from('spress_conteudo_site')
    .select('secao, chave, valor')

  const result: ConteudoSite = {}
  for (const row of data ?? []) {
    if (!result[row.secao]) result[row.secao] = {}
    result[row.secao][row.chave] = row.valor ?? ''
  }
  return result
}

export async function salvarSecaoSite(secao: string, dados: Record<string, string>) {
  const sb = serviceClient()

  const rows = Object.entries(dados).map(([chave, valor]) => ({
    secao,
    chave,
    valor: valor || null,
  }))

  const { error } = await sb
    .from('spress_conteudo_site')
    .upsert(rows, { onConflict: 'secao,chave' })

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/missao-visao-valores')
  revalidatePath('/sistema/site')
}

// Replace-all strategy para MVV (suporta add/remove de valores)
export async function salvarMvvCompleto(dados: Record<string, string>) {
  const sb = serviceClient()

  const { error: delError } = await sb
    .from('spress_conteudo_site')
    .delete()
    .eq('secao', 'mvv')

  if (delError) throw new Error(delError.message)

  const rows = Object.entries(dados).map(([chave, valor]) => ({
    secao: 'mvv',
    chave,
    valor: valor || null,
  }))

  if (rows.length > 0) {
    const { error } = await sb.from('spress_conteudo_site').insert(rows)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/')
  revalidatePath('/missao-visao-valores')
  revalidatePath('/sistema/site')
}

// ── Rastreamento de visitas ao site público ────────────────────────

export async function registrarVisitaSite(
  pagePath: string,
  sessionId: string,
  referrer: string,
  userAgent: string,
) {
  try {
    await serviceClient().from('spress_site_visitas').insert({
      page_path:  pagePath,
      session_id: sessionId || null,
      referrer:   referrer  || null,
      user_agent: userAgent || null,
    })
  } catch {
    // silently ignore
  }
}

export async function getSitePageAnalytics(days: number) {
  const sb    = serviceClient()
  const since = days > 0
    ? new Date(Date.now() - days * 86400000).toISOString()
    : new Date(0).toISOString()

  const { data: visitas } = await sb
    .from('spress_site_visitas')
    .select('page_path, session_id, referrer, created_at')
    .gte('created_at', since)

  const v = visitas ?? []

  const byDay: Record<string, number> = {}
  for (const row of v) {
    const day = row.created_at.slice(0, 10)
    byDay[day] = (byDay[day] ?? 0) + 1
  }

  const uniqueSessions = new Set(v.map((r) => r.session_id).filter(Boolean)).size

  const pageViews:  Record<string, number>      = {}
  const pageUnique: Record<string, Set<string>> = {}
  for (const row of v) {
    pageViews[row.page_path]  = (pageViews[row.page_path] ?? 0) + 1
    if (!pageUnique[row.page_path]) pageUnique[row.page_path] = new Set()
    if (row.session_id) pageUnique[row.page_path].add(row.session_id)
  }

  const PAGE_LABELS: Record<string, string> = {
    '/':                     'Home',
    '/noticias':             'Notícias',
    '/cases':                'Cases',
    '/equipe':               'Equipe',
    '/missao-visao-valores': 'Missão, Visão e Valores',
  }

  const topPages = Object.entries(pageViews)
    .map(([path, views]) => ({
      path,
      label:  PAGE_LABELS[path] ?? path,
      views,
      unique: pageUnique[path]?.size ?? 0,
    }))
    .sort((a, b) => b.views - a.views)

  const sources: Record<string, number> = {}
  for (const row of v) {
    let src = 'Direto'
    if (row.referrer) {
      try {
        const host = new URL(row.referrer).hostname.replace('www.', '')
        src = host || 'Direto'
      } catch { src = 'Outro' }
    }
    sources[src] = (sources[src] ?? 0) + 1
  }

  const trafficSources = Object.entries(sources)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([source, count]) => ({ source, count }))

  return {
    totalViews: v.length,
    uniqueSessions,
    byDay,
    topPages,
    trafficSources,
  }
}
