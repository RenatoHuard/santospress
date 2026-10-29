'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getBlogPosts, despublicarPost, excluirPost } from '../actions/blog'

type Post = {
  id: string
  titulo: string
  slug: string | null
  status: string | null
  categoria: string | null
  capa_url: string | null
  publicado_em: string | null
  created_at: string
}

const STATUS_STYLE: Record<string, string> = {
  publicado: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rascunho:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function BlogListPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [actingId, setActingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    try {
      setPosts((await getBlogPosts()) as unknown as Post[])
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function handleDespublicar(post: Post) {
    setActingId(post.id)
    setActionError(null)
    startTransition(async () => {
      try {
        await despublicarPost(post.id, post.slug, 'noticia')
        setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, status: 'rascunho', publicado_em: null } : p))
      } catch (e) {
        setActionError(e instanceof Error ? e.message : 'Erro ao despublicar')
      } finally {
        setActingId(null)
      }
    })
  }

  function handleExcluir(id: string) {
    setActingId(id)
    setConfirmDeleteId(null)
    setActionError(null)
    startTransition(async () => {
      try {
        await excluirPost(id)
        setPosts((prev) => prev.filter((p) => p.id !== id))
      } catch (e) {
        setActionError(e instanceof Error ? e.message : 'Erro ao excluir')
      } finally {
        setActingId(null)
      }
    })
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 dark:text-white text-2xl font-bold">Notícias</h1>
          {!loading && !loadError && (
            <p className="text-gray-400 dark:text-gray-600 text-sm mt-0.5">
              {posts.length} publicaç{posts.length === 1 ? 'ão' : 'ões'}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Link
            href="/sistema/blog/relatorios"
            className="flex items-center gap-2 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-xl text-sm font-medium hover:border-gold hover:text-gold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Relatórios
          </Link>
          <Link
            href="/sistema/blog/novo"
            className="bg-gold text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9e2126] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nova Notícia
          </Link>
        </div>
      </div>

      {actionError && (
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/30 rounded-xl p-4 mb-6 text-red-600 dark:text-red-400 text-sm">
          {actionError}
        </div>
      )}

      {loadError && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 text-amber-700 dark:text-amber-400 text-sm mb-6">
          Configure <code className="font-mono bg-amber-100 dark:bg-black/30 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> no .env.local para visualizar as publicações.
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-24">
          <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && !loadError && posts.length === 0 && (
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-20 text-center">
          <svg className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-600">Nenhuma publicação ainda.</p>
          <Link href="/sistema/blog/novo" className="mt-4 inline-block text-gold hover:text-gold/80 text-sm transition-colors">
            Criar a primeira notícia →
          </Link>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden hover:border-gold/40 hover:shadow-lg hover:shadow-gold/5 transition-all duration-200"
            >
              <Link href={`/sistema/blog/${post.id}`} className="block">
                {/* Thumbnail */}
                <div className="relative h-36 bg-gray-100 dark:bg-[#1a1a1a]">
                  {post.capa_url ? (
                    <Image src={post.capa_url} alt={post.titulo} fill className="object-contain p-1" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                  )}
                  <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[post.status ?? 'rascunho'] ?? STATUS_STYLE.rascunho}`}>
                    {post.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-gray-900 dark:text-white text-sm font-semibold leading-snug line-clamp-2 group-hover:text-gold transition-colors">
                    {post.titulo || 'Sem título'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    {post.categoria && (
                      <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                        {post.categoria}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400 ml-auto">
                      {formatDate(post.publicado_em ?? post.created_at)}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Action strip */}
              <div className="border-t border-gray-100 dark:border-white/5 px-4 py-2.5 flex items-center justify-end gap-3">
                {actingId === post.id ? (
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="w-3 h-3 border-2 border-gold border-t-transparent rounded-full animate-spin inline-block" />
                    Aguarde...
                  </span>
                ) : post.status === 'publicado' ? (
                  <button
                    onClick={() => handleDespublicar(post)}
                    disabled={!!actingId || isPending}
                    className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 disabled:opacity-40 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Despublicar
                  </button>
                ) : confirmDeleteId === post.id ? (
                  <span className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Confirmar exclusão?</span>
                    <button
                      onClick={() => handleExcluir(post.id)}
                      className="text-red-500 hover:text-red-600 dark:hover:text-red-400 font-semibold transition-colors"
                    >
                      Sim
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      Não
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(post.id)}
                    disabled={!!actingId || isPending}
                    className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-40 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Excluir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
