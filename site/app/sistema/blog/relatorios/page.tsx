'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getBlogAnalytics } from '../../actions/blog'

type Analytics = Awaited<ReturnType<typeof getBlogAnalytics>>
type TopPost   = Analytics['topPosts'][number]
type Source    = Analytics['trafficSources'][number]

const PERIODS = [
  { label: 'Hoje',    days: 1  },
  { label: '7 dias',  days: 7  },
  { label: '30 dias', days: 30 },
  { label: '3 meses', days: 90 },
  { label: 'Tudo',    days: 0  },
]

const SORT_OPTIONS = [
  { value: 'views',  label: 'Pageviews'         },
  { value: 'unique', label: 'Visitantes únicos'  },
]

function formatNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

function DeltaBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden w-full">
      <div
        className="h-full bg-gold rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function buildDayEntries(byDay: Record<string, number>, days: number): [string, number][] {
  if (days === 0) {
    // "Tudo": mostra só os dias que têm dados
    return Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b))
  }
  // Período definido: preenche todos os dias do range com 0 onde não há visitas
  const result: [string, number][] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const key = d.toISOString().slice(0, 10)
    result.push([key, byDay[key] ?? 0])
  }
  return result
}

function SparkBar({ byDay, days }: { byDay: Record<string, number>; days: number }) {
  const entries = buildDayEntries(byDay, days)
  const hasData = entries.some(([, v]) => v > 0)

  if (!hasData) {
    return <p className="text-gray-400 text-xs">Sem dados no período.</p>
  }

  const max = Math.max(...entries.map(([, v]) => v), 1)
  // Limita a exibição a no máximo 90 barras para não poluir visualmente
  const visible = entries.length > 90 ? entries.slice(-90) : entries

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-px h-16">
        {visible.map(([day, val]) => (
          <div
            key={day}
            title={`${day}: ${val} views`}
            className="flex-1 min-w-0 bg-gold/50 hover:bg-gold rounded-t transition-colors"
            style={{ height: `${Math.max(val > 0 ? 6 : 1, (val / max) * 64)}px` }}
          />
        ))}
      </div>
      {/* Labels de datas: início e fim */}
      <div className="flex justify-between text-[10px] text-gray-400 select-none">
        <span>{visible[0]?.[0]}</span>
        <span>{visible[visible.length - 1]?.[0]}</span>
      </div>
    </div>
  )
}

// ── Post card detalhado ────────────────────────────────────────────

function PostCard({ post, max, sortBy }: { post: TopPost; max: number; sortBy: string }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-gold/30 transition-all"
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Thumbnail */}
        <div className="w-16 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1a1a1a] shrink-0">
          {post.capa_url ? (
            <Image src={post.capa_url} alt={post.titulo} width={64} height={48} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
              </svg>
            </div>
          )}
        </div>

        {/* Title + bar */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{post.titulo}</p>
          <div className="mt-1.5">
            <DeltaBar value={sortBy === 'views' ? post.views : post.unique} max={max} />
          </div>
        </div>

        {/* Metric */}
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatNum(sortBy === 'views' ? post.views : post.unique)}
          </p>
          <p className="text-[10px] text-gray-400">{sortBy === 'views' ? 'views' : 'únicos'}</p>
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded — stats individuais */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-white/5 px-4 py-4 bg-gray-50 dark:bg-white/[0.02]">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNum(post.views)}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Pageviews</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNum(post.unique)}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Visitantes únicos</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                {post.status === 'publicado' ? '✓' : '—'}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {post.status === 'publicado' ? 'Publicado' : 'Rascunho'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/sistema/blog/${post.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 text-center text-xs py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gold hover:text-gold transition-colors"
            >
              Editar post
            </Link>
            {post.slug && post.status === 'publicado' && (
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 text-center text-xs py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gold hover:text-gold transition-colors"
              >
                Ver publicação ↗
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────

export default function RelatoriosPage() {
  const [period, setPeriod] = useState(30)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'views' | 'unique'>('views')
  const [page, setPage] = useState(1)

  const PAGE_SIZE = 10

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setAnalytics(await getBlogAnalytics(period))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { load() }, [load])

  const topPosts   = analytics?.topPosts ?? []
  const sortedTop  = [...topPosts].sort((a, b) => (sortBy === 'views' ? b.views - a.views : b.unique - a.unique))
  const maxMetric  = sortedTop[0] ? (sortBy === 'views' ? sortedTop[0].views : sortedTop[0].unique) : 1
  const totalPages = Math.max(1, Math.ceil(sortedTop.length / PAGE_SIZE))
  const pagePosts  = sortedTop.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const sources    = analytics?.trafficSources ?? []
  const maxSource  = sources[0]?.count ?? 1

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-gray-900 dark:text-white text-2xl font-bold">Relatórios</h1>
            <p className="text-gray-500 dark:text-gray-600 text-sm mt-0.5">Análise de audiência e desempenho das publicações</p>
          </div>

          {/* Seletor de período */}
          <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
            {PERIODS.map((p) => (
              <button
                key={p.days}
                onClick={() => { setPeriod(p.days); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  period === p.days
                    ? 'bg-white dark:bg-[#1c1c1c] text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 text-amber-700 dark:text-amber-400 text-sm mb-6">
            {error === 'SERVICE_KEY_NOT_SET'
              ? 'Configure SUPABASE_SERVICE_ROLE_KEY no .env.local para ver os relatórios.'
              : error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : analytics && (
          <div className="space-y-8">

            {/* ── Métricas macro ─────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Pageviews',           value: formatNum(analytics.totalViews),    icon: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-blue-500' },
                { label: 'Visitantes Únicos',   value: formatNum(analytics.uniqueSessions), icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z', color: 'text-emerald-500' },
                { label: 'Posts Publicados',    value: analytics.publishedPosts.toString(), icon: 'M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z', color: 'text-gold' },
                { label: 'Total de Posts',      value: analytics.totalPosts.toString(),     icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z', color: 'text-purple-500' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                    <svg className={`w-4 h-4 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* ── Gráfico de acessos por dia ─────────────────── */}
            <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pageviews por dia</h3>
                <span className="text-xs text-gray-400">{PERIODS.find((p) => p.days === period)?.label}</span>
              </div>
              {analytics.totalViews === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-400 text-sm">Ainda sem dados de acesso.</p>
                  <p className="text-gray-500 dark:text-gray-600 text-xs mt-1">As visitas às publicações serão registradas automaticamente.</p>
                </div>
              ) : (
                <SparkBar byDay={analytics.byDay} days={period} />
              )}
            </div>

            {/* ── Top Posts + Fontes lado a lado ─────────────── */}
            <div className="grid lg:grid-cols-3 gap-6">

              {/* Top posts */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top Publicações</h3>
                  <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-lg p-0.5">
                    {SORT_OPTIONS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => { setSortBy(s.value as 'views' | 'unique'); setPage(1) }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                          sortBy === s.value
                            ? 'bg-white dark:bg-[#1c1c1c] text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {sortedTop.length === 0 ? (
                  <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-10 text-center">
                    <p className="text-gray-400 text-sm">Nenhuma publicação ainda.</p>
                    <Link href="/sistema/blog/novo" className="text-gold text-xs hover:underline mt-2 inline-block">
                      Criar primeira notícia →
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {pagePosts.map((post) => (
                        <PostCard key={post.id} post={post} max={maxMetric} sortBy={sortBy} />
                      ))}
                    </div>

                    {/* Paginação */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="px-3 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gold hover:text-gold disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-colors"
                        >
                          ← Anterior
                        </button>
                        <span className="text-xs text-gray-400">
                          Página {page} de {totalPages} · {sortedTop.length} posts
                        </span>
                        <button
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="px-3 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gold hover:text-gold disabled:opacity-30 disabled:hover:border-gold disabled:hover:text-gold transition-colors"
                        >
                          Próxima →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Fontes de tráfego */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fontes de Tráfego</h3>
                <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5 space-y-4">
                  {sources.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">Sem dados ainda.</p>
                  ) : sources.map((src) => (
                    <div key={src.source}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[140px]">{src.source}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatNum(src.count)}</span>
                      </div>
                      <DeltaBar value={src.count} max={maxSource} />
                    </div>
                  ))}
                </div>

                {/* Aviso de métricas avançadas */}
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1.5">Métricas avançadas</p>
                  <p className="text-[11px] text-blue-600 dark:text-blue-500 leading-relaxed">
                    Tempo médio na página, taxa de rolagem e cliques em elementos requerem integração com Google Analytics 4 ou similar.
                  </p>
                  <a
                    href="https://analytics.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-700 dark:text-blue-400 font-medium hover:underline mt-2 inline-block"
                  >
                    Configurar GA4 →
                  </a>
                </div>
              </div>
            </div>

          </div>
        )}
    </div>
  )
}
