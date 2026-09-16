'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key === 'sua_service_role_key_aqui') throw new Error('SERVICE_KEY_NOT_SET')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
}

export interface PostPayload {
  id?: string
  titulo: string
  slug: string
  resumo: string
  conteudo: string
  capa_url: string
  status: 'rascunho' | 'publicado'
  autor_id: string
  seo_titulo: string
  seo_descricao: string
  tags: string[]
  categoria: string
  publicado_em?: string | null // preservado nas edições; só sobrescrito na 1ª publicação
}

export async function salvarPost(payload: PostPayload): Promise<string> {
  const sb = serviceClient()

  // Preserva publicado_em original ao editar post já publicado.
  // Só define now() na primeira publicação (quando payload.publicado_em é nulo/vazio).
  const publicado_em =
    payload.status === 'publicado'
      ? (payload.publicado_em ?? new Date().toISOString())
      : null

  const row = {
    titulo: payload.titulo,
    slug: payload.slug,
    resumo: payload.resumo || null,
    conteudo: payload.conteudo || null,
    capa_url: payload.capa_url || null,
    status: payload.status,
    autor_id: payload.autor_id || null,
    seo_titulo: payload.seo_titulo || null,
    seo_descricao: payload.seo_descricao || null,
    tags: payload.tags.length > 0 ? payload.tags : null,
    categoria: payload.categoria || null,
    publicado_em,
  }

  if (payload.id) {
    const { error } = await sb
      .from('spress_blog_posts')
      .update(row)
      .eq('id', payload.id)
    if (error) throw new Error(error.message)
    revalidatePath(`/noticias/${payload.slug}`)
    revalidatePath('/noticias')
    revalidatePath('/')
    return payload.id
  }

  const { data, error } = await sb
    .from('spress_blog_posts')
    .insert(row)
    .select('id')
    .single()
  if (error) throw new Error(error.message)

  revalidatePath('/noticias')
  revalidatePath('/')
  return data.id
}

export async function uploadBlogImagem(formData: FormData): Promise<string> {
  const sb = serviceClient()
  const file = formData.get('file') as File

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await sb.storage
    .from('blog-imagens')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw new Error(error.message)

  const {
    data: { publicUrl },
  } = sb.storage.from('blog-imagens').getPublicUrl(path)
  return publicUrl
}

export async function getFuncionariosBasico() {
  const { data } = await serviceClient()
    .from('spress_usuarios')
    .select('id, nome, email, is_coringa')
    .eq('ativo', true)
    .order('is_coringa', { ascending: false }) // coringa (Redação) aparece primeiro
    .order('nome')
  return (data ?? []) as { id: string; nome: string; email: string; is_coringa: boolean }[]
}

export async function getBlogPost(id: string) {
  const { data } = await serviceClient()
    .from('spress_blog_posts')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

export async function getBlogPosts() {
  const { data } = await serviceClient()
    .from('spress_blog_posts')
    .select('id, titulo, slug, status, categoria, capa_url, publicado_em, created_at')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getBlogDrafts() {
  const { data } = await serviceClient()
    .from('spress_blog_posts')
    .select('id, titulo, slug, resumo, categoria, capa_url, created_at, updated_at')
    .eq('status', 'rascunho')
    .order('updated_at', { ascending: false })
  return data ?? []
}

export async function publicarPost(id: string) {
  const { error } = await serviceClient()
    .from('spress_blog_posts')
    .update({ status: 'publicado', publicado_em: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/noticias')
  revalidatePath('/')
}

// ── Analytics ──────────────────────────────────────────────────────

export async function getBlogAnalytics(days: number) {
  const sb    = serviceClient()
  const since = days > 0
    ? new Date(Date.now() - days * 86400000).toISOString()
    : new Date(0).toISOString()

  const [{ data: visitas }, { data: posts }] = await Promise.all([
    sb.from('spress_blog_visitas')
      .select('post_id, session_id, referrer, created_at')
      .gte('created_at', since),
    sb.from('spress_blog_posts')
      .select('id, titulo, slug, capa_url, status, publicado_em')
      .order('publicado_em', { ascending: false }),
  ])

  const v  = visitas ?? []
  const p  = posts   ?? []

  // Pageviews por dia
  const byDay: Record<string, number> = {}
  for (const row of v) {
    const day = row.created_at.slice(0, 10)
    byDay[day] = (byDay[day] ?? 0) + 1
  }

  // Visitantes únicos (sessões únicas)
  const uniqueSessions = new Set(v.map((r) => r.session_id).filter(Boolean)).size

  // Views por post
  const postViews: Record<string, number> = {}
  const postUnique: Record<string, Set<string>> = {}
  for (const row of v) {
    postViews[row.post_id]  = (postViews[row.post_id]  ?? 0) + 1
    if (!postUnique[row.post_id]) postUnique[row.post_id] = new Set()
    if (row.session_id) postUnique[row.post_id].add(row.session_id)
  }

  // Top posts com dados
  const topPosts = p
    .map((post) => ({
      id:           post.id,
      titulo:       post.titulo,
      slug:         post.slug,
      capa_url:     post.capa_url,
      status:       post.status,
      publicado_em: post.publicado_em,
      views:        postViews[post.id] ?? 0,
      unique:       postUnique[post.id]?.size ?? 0,
    }))
    .sort((a, b) => b.views - a.views)

  // Fontes de tráfego
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
    totalViews:    v.length,
    uniqueSessions,
    totalPosts:    p.length,
    publishedPosts: p.filter((p) => p.status === 'publicado').length,
    byDay,
    topPosts,
    trafficSources,
  }
}

export async function registrarVisita(
  postId: string,
  sessionId: string,
  referrer: string,
  userAgent: string,
) {
  try {
    await serviceClient().from('spress_blog_visitas').insert({
      post_id:    postId,
      session_id: sessionId || null,
      referrer:   referrer  || null,
      user_agent: userAgent || null,
    })
  } catch {
    // silently ignore (service key not set, etc.)
  }
}
