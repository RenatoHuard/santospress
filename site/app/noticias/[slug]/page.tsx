import { createClient } from '@supabase/supabase-js'

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ViewTracker } from './ViewTracker'
import { ShareButtons } from './ShareButtons'

export const dynamic = 'force-dynamic'

// Next.js 15: params é uma Promise
interface Props {
  params: Promise<{ slug: string }>
}

type PostCard = {
  id: string
  titulo: string
  slug: string
  resumo: string | null
  capa_url: string | null
  publicado_em: string | null
}

async function getPost(slug: string) {
  const { data } = await sb()
    .from('spress_blog_posts')
    .select('*, autor:spress_usuarios(nome)')
    .eq('slug', slug)
    .eq('status', 'publicado')
    .single()
  return data
}

async function getMostReadPost(excludeId: string): Promise<PostCard | null> {
  const { data: counts } = await sb()
    .from('spress_blog_post_view_counts')
    .select('post_id, views')
    .neq('post_id', excludeId)
    .order('views', { ascending: false })
    .limit(1)

  if (counts && counts.length > 0) {
    const { data } = await sb()
      .from('spress_blog_posts')
      .select('id, titulo, slug, resumo, capa_url, publicado_em')
      .eq('id', counts[0].post_id)
      .eq('status', 'publicado')
      .single()
    if (data) return data as PostCard
  }

  // Fallback: post mais recente
  const { data } = await sb()
    .from('spress_blog_posts')
    .select('id, titulo, slug, resumo, capa_url, publicado_em')
    .eq('status', 'publicado')
    .neq('id', excludeId)
    .order('publicado_em', { ascending: false })
    .limit(1)
    .single()
  return (data as PostCard | null) ?? null
}

async function getAdjacentPost(publishedAt: string, excludeId: string): Promise<PostCard | null> {
  const { data: prev } = await sb()
    .from('spress_blog_posts')
    .select('id, titulo, slug, resumo, capa_url, publicado_em')
    .eq('status', 'publicado')
    .neq('id', excludeId)
    .lt('publicado_em', publishedAt)
    .order('publicado_em', { ascending: false })
    .limit(1)
    .single()
  if (prev) return prev as PostCard

  const { data: next } = await sb()
    .from('spress_blog_posts')
    .select('id, titulo, slug, resumo, capa_url, publicado_em')
    .eq('status', 'publicado')
    .neq('id', excludeId)
    .gt('publicado_em', publishedAt)
    .order('publicado_em', { ascending: true })
    .limit(1)
    .single()
  return (next as PostCard | null) ?? null
}

export async function generateStaticParams() {
  const { data } = await sb()
    .from('spress_blog_posts')
    .select('slug')
    .eq('status', 'publicado')
  return (data ?? []).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: `${post.titulo} | Santos Press Blog`,
    description: post.resumo ?? undefined,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const [mostRead, adjacent] = await Promise.all([
    getMostReadPost(post.id),
    post.publicado_em ? getAdjacentPost(post.publicado_em, post.id) : Promise.resolve(null),
  ])

  // Deduplicate: if both point to the same post, show only mostRead
  const suggestions = [
    mostRead ? { post: mostRead, label: 'Mais lida' } : null,
    adjacent && adjacent.id !== mostRead?.id ? { post: adjacent, label: 'Veja também' } : null,
  ].filter(Boolean) as { post: PostCard; label: string }[]

  const publishedAt = post.publicado_em
    ? new Date(post.publicado_em).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null

  const autorNome = (post.autor as { nome: string } | null)?.nome

  return (
    <main>
      <ViewTracker postId={post.id} />
      {post.capa_url ? (
        <div className="relative h-64 md:h-[420px]">
          <Image src={post.capa_url} alt={post.titulo} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-navy/75" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
              <Link href="/noticias" className="text-gold text-sm font-medium hover:underline inline-block mb-5">
                ← Voltar às Notícias
              </Link>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-snug">{post.titulo}</h1>
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                {publishedAt && <span>{publishedAt}</span>}
                {autorNome && (
                  <>
                    <span className="opacity-40">·</span>
                    <span>{autorNome}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-navy py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/noticias" className="text-gold text-sm font-medium hover:underline inline-block mb-6">
              ← Voltar às Notícias
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-snug">{post.titulo}</h1>
            <div className="flex items-center gap-3 text-gray-300 text-sm">
              {publishedAt && <span>{publishedAt}</span>}
              {autorNome && (
                <>
                  <span className="opacity-40">·</span>
                  <span>{autorNome}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div
            className="prose prose-lg max-w-none prose-headings:text-navy prose-a:text-gold prose-strong:text-navy"
            dangerouslySetInnerHTML={{ __html: post.conteudo ?? '' }}
          />
          <div className="mt-14 pt-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link href="/noticias" className="text-gold font-semibold hover:underline text-sm">
              ← Voltar às Notícias
            </Link>
            <ShareButtons slug={post.slug} titulo={post.titulo} />
          </div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <h2 className="text-lg font-bold text-navy mb-8 uppercase tracking-wide">Outras Notícias</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {suggestions.map(({ post: s, label }) => (
                <Link
                  key={s.id}
                  href={`/noticias/${s.slug}`}
                  className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gold/40 hover:shadow-md transition-all"
                >
                  {s.capa_url && (
                    <div className="relative h-40 w-full">
                      <Image src={s.capa_url} alt={s.titulo} fill className="object-cover" />
                    </div>
                  )}
                  <div className="p-5">
                    <span className="text-xs font-semibold text-gold uppercase tracking-wider">{label}</span>
                    <h3 className="mt-2 text-base font-bold text-navy leading-snug group-hover:text-gold transition-colors line-clamp-3">
                      {s.titulo}
                    </h3>
                    {s.resumo && (
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">{s.resumo}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
