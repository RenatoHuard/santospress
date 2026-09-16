'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getBlogDrafts, publicarPost } from '../../actions/blog'

type Draft = {
  id: string
  titulo: string
  slug: string | null
  resumo: string | null
  categoria: string | null
  capa_url: string | null
  created_at: string
  updated_at: string | null
}

function formatDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function RascunhosPage() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setDrafts((await getBlogDrafts()) as unknown as Draft[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function handlePublicar(id: string) {
    setPublishing(id)
    startTransition(async () => {
      try {
        await publicarPost(id)
        setDrafts((prev) => prev.filter((d) => d.id !== id))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao publicar')
      } finally {
        setPublishing(null)
      }
    })
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-gray-900 dark:text-white text-2xl font-bold">Rascunhos</h1>
            {!loading && (
              <p className="text-gray-400 dark:text-gray-600 text-sm mt-0.5">
                {drafts.length} rascunho{drafts.length !== 1 ? 's' : ''} pendente{drafts.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
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

        {/* Erro */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/30 rounded-xl p-4 mb-6 text-red-600 dark:text-red-400 text-sm">
            {error === 'SERVICE_KEY_NOT_SET'
              ? 'Configure SUPABASE_SERVICE_ROLE_KEY no .env.local para acessar os rascunhos.'
              : error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Vazio */}
        {!loading && !error && drafts.length === 0 && (
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-20 text-center">
            <svg className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-600 font-medium">Nenhum rascunho pendente.</p>
            <p className="text-gray-400 dark:text-gray-700 text-sm mt-1">Todas as notícias estão publicadas.</p>
            <Link href="/sistema/blog/novo" className="mt-5 inline-block text-gold hover:text-gold/80 text-sm transition-colors">
              Criar nova notícia →
            </Link>
          </div>
        )}

        {/* Lista de rascunhos */}
        {!loading && drafts.length > 0 && (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden flex gap-0"
              >
                {/* Thumbnail */}
                <div className="w-32 shrink-0 bg-gray-100 dark:bg-[#1a1a1a] relative">
                  {draft.capa_url ? (
                    <Image src={draft.capa_url} alt={draft.titulo || ''} fill className="object-contain" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-7 h-7 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-gray-900 dark:text-white font-semibold text-sm leading-snug line-clamp-2">
                          {draft.titulo || <span className="italic text-gray-400">Sem título</span>}
                        </p>
                        {draft.resumo && (
                          <p className="text-gray-500 dark:text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                            {draft.resumo}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
                        Rascunho
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2.5 text-[11px] text-gray-400">
                      {draft.categoria && (
                        <span className="bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                          {draft.categoria}
                        </span>
                      )}
                      <span>Editado em {formatDate(draft.updated_at ?? draft.created_at)}</span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => handlePublicar(draft.id)}
                      disabled={publishing === draft.id || isPending}
                      className="flex items-center gap-2 bg-gold text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#9e2126] disabled:opacity-50 transition-colors"
                    >
                      {publishing === draft.id ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Publicando...
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          Publicar agora
                        </>
                      )}
                    </button>

                    <Link
                      href={`/sistema/blog/${draft.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gold hover:text-gold transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                      Editar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

    </div>
  )
}
