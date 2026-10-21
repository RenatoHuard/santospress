'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getGestaoClientes,
  getGestaoAtendentes,
  getDemandaStats,
  type GestaoCliente,
  type GestaoAtendente,
  type DemandaRow,
} from '../../actions/gestao'

// ── Configuração de status ──────────────────────────────────────────

const STATUS_CONFIG = [
  { nome: 'Backlog',             color: '#94a3b8', colorHex: 'bg-slate-400',  short: 'BL'  },
  { nome: 'Priorizados',         color: '#3b82f6', colorHex: 'bg-blue-500',   short: 'PR'  },
  { nome: 'Em Desenvolvimento',  color: '#f59e0b', colorHex: 'bg-amber-500',  short: 'DEV' },
  { nome: 'Cancelados',          color: '#ef4444', colorHex: 'bg-red-500',    short: 'CAN' },
  { nome: 'Concluídos',          color: '#22c55e', colorHex: 'bg-green-500',  short: 'OK'  },
]

const PERIOD_OPTIONS = [
  { value: '1m',  label: 'Este Mês' },
  { value: '3m',  label: '3 Meses'  },
  { value: '6m',  label: '6 Meses'  },
  { value: '12m', label: '1 Ano'    },
]

// ── Helpers de data ─────────────────────────────────────────────────

function getPeriodRange(period: string): { from: Date; to: Date } {
  const to = new Date()
  to.setHours(23, 59, 59, 999)
  const from = new Date()
  from.setHours(0, 0, 0, 0)
  if (period === '1m') {
    from.setDate(1)
  } else if (period === '3m') {
    from.setMonth(from.getMonth() - 2); from.setDate(1)
  } else if (period === '6m') {
    from.setMonth(from.getMonth() - 5); from.setDate(1)
  } else {
    from.setMonth(from.getMonth() - 11); from.setDate(1)
  }
  return { from, to }
}

function getMonthsInRange(from: Date, to: Date): string[] {
  const months: string[] = []
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1)
  while (cursor <= to) {
    months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`)
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return months
}

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
}

function formatMonth(yyyymm: string): string {
  const [y, m] = yyyymm.split('-')
  return `${MONTH_LABELS[m]} ${y.slice(2)}`
}

// ── Componente de barras por status ────────────────────────────────

interface StatusBarData { nome: string; color: string; count: number }

function StatusBarChart({
  data,
  onBarClick,
  activeBar,
}: {
  data: StatusBarData[]
  onBarClick?: (nome: string) => void
  activeBar?: string | null
}) {
  const max = Math.max(...data.map((d) => d.count), 1)
  const BAR_W = 52
  const GAP   = 14
  const H     = 150
  const totalW = data.length * (BAR_W + GAP) - GAP

  return (
    <div className="overflow-x-auto">
      <svg width={totalW} height={H + 44} style={{ overflow: 'visible', minWidth: totalW }}>
        {data.map((d, i) => {
          const barH   = Math.max(d.count > 0 ? 4 : 0, (d.count / max) * H)
          const x      = i * (BAR_W + GAP)
          const y      = H - barH
          const faded  = activeBar != null && activeBar !== d.nome
          return (
            <g
              key={d.nome}
              onClick={() => onBarClick?.(d.nome)}
              style={{ cursor: onBarClick ? 'pointer' : 'default' }}
            >
              <rect
                x={x} y={y} width={BAR_W} height={barH}
                fill={d.color} rx={5}
                opacity={faded ? 0.3 : 1}
                style={{ transition: 'opacity 0.2s' }}
              />
              {d.count > 0 && (
                <text
                  x={x + BAR_W / 2} y={y - 6}
                  textAnchor="middle" fontSize={13} fontWeight="700"
                  fill={faded ? '#bbb' : '#444'}
                  className="dark:fill-white"
                >
                  {d.count}
                </text>
              )}
              <text
                x={x + BAR_W / 2} y={H + 18}
                textAnchor="middle" fontSize={10}
                fill="#888"
              >
                {d.nome.split(' ')[0].slice(0, 7)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Componente de barras mensais empilhadas ─────────────────────────

interface MonthData {
  month:    string
  label:    string
  total:    number
  statuses: { nome: string; color: string; count: number }[]
}

function MonthlyStackedChart({
  months,
  onMonthClick,
  activeMonth,
}: {
  months:        MonthData[]
  onMonthClick?: (month: string) => void
  activeMonth?:  string | null
}) {
  const maxTotal = Math.max(...months.map((m) => m.total), 1)
  const BAR_W    = 42
  const GAP      = 14
  const H        = 150
  const totalW   = months.length * (BAR_W + GAP) - GAP

  return (
    <div className="overflow-x-auto">
      <svg width={totalW} height={H + 44} style={{ overflow: 'visible', minWidth: totalW }}>
        {months.map((m, i) => {
          const x      = i * (BAR_W + GAP)
          const faded  = activeMonth != null && activeMonth !== m.month
          const segs   = m.statuses.filter((s) => s.count > 0)

          let bottom = H
          const bars = segs.map((s) => {
            const segH = Math.max(2, (s.count / maxTotal) * H)
            bottom -= segH
            return { ...s, segH, y: bottom }
          })

          return (
            <g
              key={m.month}
              onClick={() => onMonthClick?.(m.month)}
              style={{ cursor: onMonthClick ? 'pointer' : 'default' }}
            >
              {bars.map((b) => (
                <rect
                  key={b.nome}
                  x={x} y={b.y} width={BAR_W} height={b.segH}
                  fill={b.color} opacity={faded ? 0.28 : 1}
                  style={{ transition: 'opacity 0.2s' }}
                />
              ))}
              {m.total > 0 && (
                <text
                  x={x + BAR_W / 2}
                  y={H - (m.total / maxTotal) * H - 6}
                  textAnchor="middle" fontSize={11} fontWeight="700"
                  fill={faded ? '#bbb' : '#444'}
                  className="dark:fill-white"
                >
                  {m.total}
                </text>
              )}
              <text
                x={x + BAR_W / 2} y={H + 18}
                textAnchor="middle" fontSize={10}
                fill="#888"
              >
                {m.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Legenda de status ───────────────────────────────────────────────

function StatusLegend() {
  return (
    <div className="flex flex-wrap gap-3">
      {STATUS_CONFIG.map((s) => (
        <div key={s.nome} className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
          <span className="text-xs text-gray-500 dark:text-gray-400">{s.nome}</span>
        </div>
      ))}
    </div>
  )
}

// ── Página principal ────────────────────────────────────────────────

export default function GestaoPage() {
  const [tab,              setTab]              = useState<'cliente' | 'atendente'>('cliente')
  const [period,           setPeriod]           = useState('3m')
  const [clientes,         setClientes]         = useState<GestaoCliente[]>([])
  const [atendentes,       setAtendentes]       = useState<GestaoAtendente[]>([])
  const [selectedId,       setSelectedId]       = useState<string>('')
  const [demands,          setDemands]          = useState<DemandaRow[]>([])
  const [loading,          setLoading]          = useState(false)
  const [activeBar,        setActiveBar]        = useState<string | null>(null)
  const [activeMonth,      setActiveMonth]      = useState<string | null>(null)

  // Carrega listas de clientes e atendentes
  useEffect(() => {
    Promise.all([getGestaoClientes(), getGestaoAtendentes()]).then(([c, a]) => {
      setClientes(c)
      setAtendentes(a)
    })
  }, [])

  // Reseta seleção ao trocar tab
  useEffect(() => {
    setSelectedId('')
    setDemands([])
    setActiveBar(null)
    setActiveMonth(null)
  }, [tab])

  // Busca dados quando muda seleção ou período
  const loadData = useCallback(async () => {
    if (!selectedId) return
    const { from, to } = getPeriodRange(period)
    setLoading(true)
    setActiveBar(null)
    setActiveMonth(null)
    try {
      const rows = await getDemandaStats(tab, selectedId, from.toISOString(), to.toISOString())
      setDemands(rows)
    } finally {
      setLoading(false)
    }
  }, [tab, selectedId, period])

  useEffect(() => { loadData() }, [loadData])

  // ── Dados dos gráficos ──────────────────────────────────────────

  const { from, to } = getPeriodRange(period)
  const months       = getMonthsInRange(from, to)
  const isSingleMonth = period === '1m'

  const statusData: StatusBarData[] = STATUS_CONFIG.map((s) => ({
    nome:  s.nome,
    color: s.color,
    count: demands.filter((d) => d.coluna_nome === s.nome).length,
  }))

  const monthlyData: MonthData[] = months.map((m) => {
    const monthDemands = demands.filter((d) => d.created_at.slice(0, 7) === m)
    return {
      month:    m,
      label:    formatMonth(m),
      total:    monthDemands.length,
      statuses: STATUS_CONFIG.map((s) => ({
        nome:  s.nome,
        color: s.color,
        count: monthDemands.filter((d) => d.coluna_nome === s.nome).length,
      })),
    }
  })

  // Totais rápidos
  const total     = demands.length
  const backlog   = demands.filter((d) => d.coluna_nome === 'Backlog').length
  const emDev     = demands.filter((d) => d.coluna_nome === 'Em Desenvolvimento').length
  const concluido = demands.filter((d) => d.coluna_nome === 'Concluídos').length

  // Filtragem da tabela (apenas aba atendente)
  const tableDemands = demands.filter((d) => {
    if (activeMonth && d.created_at.slice(0, 7) !== activeMonth) return false
    if (activeBar   && d.coluna_nome !== activeBar)               return false
    return true
  })

  // ── Handlers ───────────────────────────────────────────────────

  function handleBarClick(nome: string) {
    setActiveBar((prev) => (prev === nome ? null : nome))
    setActiveMonth(null)
  }

  function handleMonthClick(month: string) {
    setActiveMonth((prev) => (prev === month ? null : month))
    setActiveBar(null)
  }

  const entityList   = tab === 'cliente' ? clientes : atendentes
  const placeholder  = tab === 'cliente' ? 'Selecione um cliente…' : 'Selecione um atendente…'

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Demandas</h1>
        <p className="text-sm text-gray-500 mt-1">Visão gerencial do pipeline por cliente e atendente</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl p-1 w-fit">
        {(['cliente', 'atendente'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white shadow'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            {t === 'cliente' ? 'Visão Cliente' : 'Visão Atendente'}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1c1c1c] text-gray-900 dark:text-white min-w-[220px]"
        >
          <option value="">{placeholder}</option>
          {entityList.map((e) => (
            <option key={e.id} value={e.id}>{e.nome}</option>
          ))}
        </select>

        <div className="flex gap-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                period === opt.value
                  ? 'bg-gold text-white border-gold'
                  : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gold hover:text-gold'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      {!selectedId ? (
        <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
          {tab === 'cliente' ? 'Selecione um cliente para visualizar as demandas' : 'Selecione um atendente para visualizar as demandas'}
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Carregando…
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cards de totais */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total',           value: total,     color: 'text-gray-700 dark:text-gray-200' },
              { label: 'Backlog',         value: backlog,   color: 'text-slate-500' },
              { label: 'Em Dev.',         value: emDev,     color: 'text-amber-500' },
              { label: 'Concluídos',      value: concluido, color: 'text-green-500' },
            ].map((card) => (
              <div key={card.label} className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-100 dark:border-white/8 p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider">{card.label}</p>
                <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Distribuição por status */}
          <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-100 dark:border-white/8 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-white">Distribuição por Status</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isSingleMonth ? 'Demandas criadas neste mês' : 'Total no período selecionado'}
                  {activeBar && (
                    <span className="ml-2 text-gold">
                      — filtrado: {activeBar}
                      <button onClick={() => setActiveBar(null)} className="ml-1 hover:text-red-400">✕</button>
                    </span>
                  )}
                </p>
              </div>
              <StatusLegend />
            </div>
            {total === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">Nenhuma demanda no período</p>
            ) : (
              <StatusBarChart
                data={statusData}
                onBarClick={tab === 'atendente' ? handleBarClick : undefined}
                activeBar={activeBar}
              />
            )}
          </div>

          {/* Evolução mensal — apenas para períodos > 1 mês */}
          {!isSingleMonth && total > 0 && (
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-100 dark:border-white/8 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-gray-800 dark:text-white">Evolução Mensal</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Demandas criadas por mês, empilhadas por status
                    {activeMonth && (
                      <span className="ml-2 text-gold">
                        — filtrado: {formatMonth(activeMonth)}
                        <button onClick={() => setActiveMonth(null)} className="ml-1 hover:text-red-400">✕</button>
                      </span>
                    )}
                  </p>
                </div>
                <StatusLegend />
              </div>
              <MonthlyStackedChart
                months={monthlyData}
                onMonthClick={tab === 'atendente' ? handleMonthClick : undefined}
                activeMonth={activeMonth}
              />
            </div>
          )}

          {/* Tabela de demandas — apenas aba atendente, visível quando há filtro ativo */}
          {tab === 'atendente' && (activeBar || activeMonth) && (
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-100 dark:border-white/8 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-white/8">
                <h2 className="font-semibold text-gray-800 dark:text-white">
                  Demandas
                  {activeMonth && ` — ${formatMonth(activeMonth)}`}
                  {activeBar   && ` — ${activeBar}`}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{tableDemands.length} demanda{tableDemands.length !== 1 ? 's' : ''}</p>
              </div>
              {tableDemands.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">Nenhuma demanda para este filtro</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-[#222] text-xs text-gray-500 uppercase tracking-wider">
                        <th className="px-5 py-3 text-left">Cliente</th>
                        <th className="px-5 py-3 text-left">Título</th>
                        <th className="px-5 py-3 text-left">Status</th>
                        <th className="px-5 py-3 text-left">Criação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/8">
                      {tableDemands.map((d) => {
                        const sc = STATUS_CONFIG.find((s) => s.nome === d.coluna_nome)
                        return (
                          <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-white/4 transition-colors">
                            <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{d.cliente_nome}</td>
                            <td className="px-5 py-3 text-gray-900 dark:text-white font-medium">{d.titulo}</td>
                            <td className="px-5 py-3">
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-medium"
                                style={{ backgroundColor: sc?.color ?? '#94a3b8' }}
                              >
                                {d.coluna_nome}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-gray-500 dark:text-gray-400 tabular-nums">
                              {new Date(d.created_at).toLocaleDateString('pt-BR')}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
