'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { getDashboardImprensa, type ClienteMetaMes } from '../actions/imprensa'

interface DashData {
  mes: string
  totalClippings: number
  totalDisparos: number
  totalPublicados: number
  taxaPublicacao: number
  metas: ClienteMetaMes[]
}

function fmt(d: string) {
  const [y, m] = d.split('-')
  const nomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${nomes[parseInt(m) - 1]} ${y}`
}

function Card({ title, value, sub, href, color = 'gold' }: {
  title: string; value: string | number; sub?: string; href?: string; color?: string
}) {
  const colorMap: Record<string, string> = {
    gold: 'text-gold',
    emerald: 'text-emerald-500',
    blue: 'text-blue-500',
    amber: 'text-amber-500',
  }
  const content = (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5 hover:border-gold/30 transition-colors">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</p>
      <p className={`text-3xl font-bold ${colorMap[color] ?? 'text-gold'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : content
}

export default function ImprensaDashboard() {
  const [data, setData] = useState<DashData | null>(null)
  const [loading, setLoading] = useState(true)
  const [mes, setMes] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await getDashboardImprensa(mes + '-01')
      setData(d)
    } catch {
      /* silencioso */
    } finally {
      setLoading(false)
    }
  }, [mes])

  useEffect(() => { load() }, [load])

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Painel de Imprensa</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Visão geral do mês</p>
        </div>
        <input
          type="month"
          value={mes}
          onChange={e => setMes(e.target.value)}
          className="text-sm bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 outline-none focus:border-gold/50"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card title="Clippings" value={data.totalClippings} sub={fmt(data.mes)} href="/sistema/imprensa/clipping" />
            <Card title="Disparos" value={data.totalDisparos} sub="no período" href="/sistema/imprensa/releases" color="blue" />
            <Card title="Publicados" value={data.totalPublicados} sub="via disparo" color="emerald" />
            <Card
              title="Taxa de publicação"
              value={`${(data.taxaPublicacao * 100).toFixed(0)}%`}
              sub="disparos → publicação"
              color={data.taxaPublicacao >= 0.1 ? 'emerald' : 'amber'}
            />
          </div>

          {data.metas.length > 0 && (
            <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5 mb-6">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Metas por cliente — {fmt(data.mes)}</h2>
              <div className="space-y-3">
                {data.metas.map(m => (
                  <div key={m.cliente_id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{m.cliente_nome}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {m.realizado} / {m.meta} clippings
                        <span className={`ml-2 font-semibold ${m.percentual >= 1 ? 'text-emerald-500' : m.percentual >= 0.5 ? 'text-amber-500' : 'text-red-400'}`}>
                          {(m.percentual * 100).toFixed(0)}%
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${m.percentual >= 1 ? 'bg-emerald-500' : m.percentual >= 0.5 ? 'bg-amber-500' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(m.percentual * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Jornalistas', href: '/sistema/imprensa/jornalistas', icon: '👤' },
              { label: 'Veículos', href: '/sistema/imprensa/veiculos', icon: '📰' },
              { label: 'Mailing', href: '/sistema/imprensa/mailing', icon: '📧' },
              { label: 'Alertas', href: '/sistema/imprensa/alertas', icon: '🔔' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 hover:border-gold/30 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400 py-8 text-center">Erro ao carregar dados.</p>
      )}
    </div>
  )
}
