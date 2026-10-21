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
  { nome: 'Backlog',            color: '#94a3b8' },
  { nome: 'Priorizados',        color: '#3b82f6' },
  { nome: 'Em Desenvolvimento', color: '#f59e0b' },
  { nome: 'Cancelados',         color: '#ef4444' },
  { nome: 'Concluídos',         color: '#22c55e' },
]

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
}

function formatMonth(yyyymm: string): string {
  const [y, m] = yyyymm.split('-')
  return `${MONTH_LABELS[m]} ${y.slice(2)}`
}

function formatMonthFull(yyyymm: string): string {
  const [y, m] = yyyymm.split('-')
  return `${MONTH_LABELS[m]} ${y}`
}

function currentYYYYMM(): string {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
}

function getMonthOptions(): { value: string; label: string }[] {
  const opts = []
  const now = new Date()
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyymm = `${d.getFullYear()}-${mm}`
    opts.push({ value: yyyymm, label: `${MONTH_LABELS[mm]} ${d.getFullYear()}` })
  }
  return opts
}

function getMonthRange(yyyymm: string): { from: Date; to: Date } {
  const [y, m] = yyyymm.split('-').map(Number)
  return {
    from: new Date(y, m - 1, 1, 0, 0, 0, 0),
    to:   new Date(y, m,     0, 23, 59, 59, 999),
  }
}

function getPeriodRange(duration: string): { from: Date; to: Date } {
  const to = new Date(); to.setHours(23, 59, 59, 999)
  const from = new Date(); from.setHours(0, 0, 0, 0)
  if      (duration === '3m')  { from.setMonth(from.getMonth() -  2); from.setDate(1) }
  else if (duration === '6m')  { from.setMonth(from.getMonth() -  5); from.setDate(1) }
  else                         { from.setMonth(from.getMonth() - 11); from.setDate(1) }
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

// ── Gráfico de distribuição por status (modo Mês) ───────────────────

interface StatusBarData { nome: string; color: string; count: number }

function StatusBarChart({
  data,
  onBarClick,
  activeBar,
}: {
  data:        StatusBarData[]
  onBarClick?: (nome: string) => void
  activeBar?:  string | null
}) {
  const max    = Math.max(...data.map((d) => d.count), 1)
  const BAR_W  = 56
  const GAP    = 16
  const H      = 160
  const totalW = data.length * (BAR_W + GAP) - GAP

  return (
    <div className="overflow-x-auto">
      <svg width={totalW} height={H + 48} style={{ overflow: 'visible', minWidth: totalW }}>
        {data.map((d, i) => {
          const barH  = Math.max(d.count > 0 ? 4 : 0, (d.count / max) * H)
          const x     = i * (BAR_W + GAP)
          const y     = H - barH
          const faded = activeBar != null && activeBar !== d.nome
          return (
            <g
              key={d.nome}
              onClick={() => onBarClick?.(d.nome)}
              style={{ cursor: onBarClick ? 'pointer' : 'default' }}
            >
              <rect
                x={x} y={y} width={BAR_W} height={barH}
                fill={d.color} rx={6}
                opacity={faded ? 0.28 : 1}
                style={{ transition: 'opacity 0.2s' }}
              />
              {d.count > 0 && (
                <text x={x + BAR_W / 2} y={y - 7} textAnchor="middle" fontSize={14} fontWeight="700"
                  fill={faded ? '#bbb' : '#444'} className="dark:fill-white"
                >
                  {d.count}
                </text>
              )}
              <text x={x + BAR_W / 2} y={H + 20} textAnchor="middle" fontSize={11} fill="#888">
                {d.nome.split(' ')[0].slice(0, 7)}
              </text>
              <text x={x + BAR_W / 2} y={H + 36} textAnchor="middle" fontSize={10} fill="#aaa">
                {d.nome.includes(' ') ? d.nome.split(' ').slice(1).join(' ').slice(0, 8) : ''}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Gráfico de evolução mensal empilhado (modo Período) ─────────────

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
  const BAR_W    = 44
  const GAP      = 18
  const H        = 180
  const totalW   = months.length * (BAR_W + GAP) - GAP

  return (
    <div className="overflow-x-auto">
      <svg width={totalW} height={H + 44} style={{ overflow: 'visible', minWidth: totalW }}>
        {months.map((m, i) => {
          const x     = i * (BAR_W + GAP)
          const faded = activeMonth != null && activeMonth !== m.month

          let bottom = H
          const bars = m.statuses
            .filter((s) => s.count > 0)
            .map((s) => {
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
                  fill={b.color} opacity={faded ? 0.22 : 1}
                  style={{ transition: 'opacity 0.2s' }}
                />
              ))}
              {m.total > 0 && (
                <text
                  x={x + BAR_W / 2}
                  y={H - (m.total / maxTotal) * H - 7}
                  textAnchor="middle" fontSize={12} fontWeight="700"
                  fill={faded ? '#ccc' : '#444'} className="dark:fill-white"
                >
                  {m.total}
                </text>
              )}
              <text x={x + BAR_W / 2} y={H + 18} textAnchor="middle" fontSize={11} fill="#888">
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
          <span className="inline-block w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
          <span className="text-xs text-gray-500 dark:text-gray-400">{s.nome}</span>
        </div>
      ))}
    </div>
  )
}

// ── Página principal ────────────────────────────────────────────────

type ViewMode = 'mes' | 'periodo'

export default function GestaoPage() {
  const [tab,          setTab]          = useState<'cliente' | 'atendente'>('cliente')
  const [viewMode,     setViewMode]     = useState<ViewMode>('periodo')
  const [selectedMes,  setSelectedMes]  = useState(currentYYYYMM)
  const [periodDur,    setPeriodDur]    = useState('3m')
  const [clientes,     setClientes]     = useState<GestaoCliente[]>([])
  const [atendentes,   setAtendentes]   = useState<GestaoAtendente[]>([])
  const [selectedId,   setSelectedId]   = useState('')
  const [demands,      setDemands]      = useState<DemandaRow[]>([])
  const [loading,      setLoading]      = useState(false)
  const [activeBar,    setActiveBar]    = useState<string | null>(null)
  const [activeMonth,  setActiveMonth]  = useState<string | null>(null)

  const monthOptions = getMonthOptions()

  useEffect(() => {
    Promise.all([getGestaoClientes(), getGestaoAtendentes()]).then(([c, a]) => {
      setClientes(c); setAtendentes(a)
    })
  }, [])

  useEffect(() => {
    setSelectedId(''); setDemands([]); setActiveBar(null); setActiveMonth(null)
  }, [tab])

  const loadData = useCallback(async () => {
    if (!selectedId) return
    const { from, to } = viewMode === 'mes'
      ? getMonthRange(selectedMes)
      : getPeriodRange(periodDur)
    setLoading(true); setActiveBar(null); setActiveMonth(null)
    try {
      const rows = await getDemandaStats(tab, selectedId, from.toISOString(), to.toISOString())
      setDemands(rows)
    } finally {
      setLoading(false)
    }
  }, [tab, selectedId, viewMode, selectedMes, periodDur])

  useEffect(() => { loadData() }, [loadData])

  // ── Dados derivados ────────────────────────────────────────────

  const statusData: StatusBarData[] = STATUS_CONFIG.map((s) => ({
    nome:  s.nome,
    color: s.color,
    count: demands.filter((d) => d.coluna_nome === s.nome).length,
  }))

  const { from: periodFrom, to: periodTo } = viewMode === 'mes'
    ? getMonthRange(selectedMes)
    : getPeriodRange(periodDur)

  const months = getMonthsInRange(periodFrom, periodTo)

  const monthlyData: MonthData[] = months.map((m) => {
    const md = demands.filter((d) => d.created_at.slice(0, 7) === m)
    return {
      month:    m,
      label:    formatMonth(m),
      total:    md.length,
      statuses: STATUS_CONFIG.map((s) => ({
        nome:  s.nome,
        color: s.color,
        count: md.filter((d) => d.coluna_nome === s.nome).length,
      })),
    }
  })

  const total     = demands.length
  const backlog   = demands.filter((d) => d.coluna_nome === 'Backlog').length
  const emDev     = demands.filter((d) => d.coluna_nome === 'Em Desenvolvimento').length
  const concluido = demands.filter((d) => d.coluna_nome === 'Concluídos').length

  // Tabela: filtra por status (modo mês) ou mês (modo período)
  const tableDemands = demands.filter((d) => {
    if (activeBar   && d.coluna_nome !== activeBar)               return false
    if (activeMonth && d.created_at.slice(0, 7) !== activeMonth)  return false
    return true
  })

  const hasTableFilter = !!(activeBar || activeMonth)

  function handleBarClick(nome: string) {
    if (tab !== 'atendente') return
    setActiveBar((p) => (p === nome ? null : nome))
    setActiveMonth(null)
  }

  function handleMonthClick(month: string) {
    if (tab !== 'atendente') return
    setActiveMonth((p) => (p === month ? null : month))
    setActiveBar(null)
  }

  function clearFilter() { setActiveBar(null); setActiveMonth(null) }

  const entityList  = tab === 'cliente' ? clientes : atendentes
  const placeholder = tab === 'cliente' ? 'Selecione um cliente…' : 'Selecione um atendente…'

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Demandas</h1>
        <p className="text-sm text-gray-500 mt-1">Visão gerencial do pipeline por cliente e atendente</p>
      </div>

      {/* Tabs Cliente / Atendente */}
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
        {/* Seletor de entidade */}
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

        {/* Modo de visualização */}
        <div className="flex gap-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg p-1">
          {(['mes', 'periodo'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setViewMode(m); setActiveBar(null); setActiveMonth(null) }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === m
                  ? 'bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {m === 'mes' ? 'Mês' : 'Período'}
            </button>
          ))}
        </div>

        {/* Seletor de mês ou duração de período */}
        {viewMode === 'mes' ? (
          <select
            value={selectedMes}
            onChange={(e) => setSelectedMes(e.target.value)}
            className="border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1c1c1c] text-gray-900 dark:text-white"
          >
            {monthOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ) : (
          <div className="flex gap-1">
            {[{ v: '3m', l: '3 Meses' }, { v: '6m', l: '6 Meses' }, { v: '12m', l: '1 Ano' }].map((opt) => (
              <button
                key={opt.v}
                onClick={() => setPeriodDur(opt.v)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                  periodDur === opt.v
                    ? 'bg-gold text-white border-gold'
                    : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gold hover:text-gold'
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>
        )}
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
              { label: 'Total',      value: total,     color: 'text-gray-700 dark:text-gray-200' },
              { label: 'Backlog',    value: backlog,   color: 'text-slate-500'                   },
              { label: 'Em Dev.',    value: emDev,     color: 'text-amber-500'                   },
              { label: 'Concluídos', value: concluido, color: 'text-green-500'                   },
            ].map((c) => (
              <div key={c.label} className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-100 dark:border-white/8 p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider">{c.label}</p>
                <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* ── Modo Mês: gráfico de distribuição por status ── */}
          {viewMode === 'mes' && (
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-100 dark:border-white/8 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div>
                  <h2 className="font-semibold text-gray-800 dark:text-white">
                    Distribuição por Status
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      — {formatMonthFull(selectedMes)}
                    </span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {total === 0 ? 'Nenhuma demanda criada neste mês' : `${total} demanda${total !== 1 ? 's' : ''} criada${total !== 1 ? 's' : ''} neste mês`}
                    {activeBar && (
                      <span className="ml-2 text-gold">
                        — filtrado: {activeBar}
                        <button onClick={clearFilter} className="ml-1 hover:text-red-400">✕</button>
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
          )}

          {/* ── Modo Período: gráfico empilhado por mês ── */}
          {viewMode === 'periodo' && (
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-100 dark:border-white/8 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div>
                  <h2 className="font-semibold text-gray-800 dark:text-white">Demandas por Mês</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Demandas criadas por mês, empilhadas por status
                    {tab === 'atendente' && (
                      <span className="text-gray-400"> · clique numa coluna para ver os detalhes</span>
                    )}
                    {activeMonth && (
                      <span className="ml-2 text-gold">
                        — filtrado: {formatMonthFull(activeMonth)}
                        <button onClick={clearFilter} className="ml-1 hover:text-red-400">✕</button>
                      </span>
                    )}
                  </p>
                </div>
                <StatusLegend />
              </div>
              {total === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">Nenhuma demanda no período</p>
              ) : (
                <MonthlyStackedChart
                  months={monthlyData}
                  onMonthClick={tab === 'atendente' ? handleMonthClick : undefined}
                  activeMonth={activeMonth}
                />
              )}
            </div>
          )}

          {/* ── Tabela de detalhe (apenas Visão Atendente com filtro ativo) ── */}
          {tab === 'atendente' && hasTableFilter && (
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-100 dark:border-white/8 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-white/8">
                <h2 className="font-semibold text-gray-800 dark:text-white">
                  Demandas
                  {activeMonth && ` — ${formatMonthFull(activeMonth)}`}
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
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-white text-xs font-medium"
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
