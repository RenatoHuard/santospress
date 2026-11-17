'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import {
  getMailings, getMailing, salvarMailing, atualizarMailing, deletarMailing,
  getVeiculos, consultarMailing, registrarExportacao,
  type Mailing, type Veiculo,
} from '../../actions/imprensa'
import { REGIOES_IMPRENSA, EDITORIAS_IMPRENSA } from '../../lib/imprensa-constants'

// ── Tipos ────────────────────────────────────────────────────────────

type JornalistaRow = {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  whatsapp: string | null
  cargo: string | null
  editoria: string | null
  programa: string | null
  regiao: string | null
  situacao: string
  spress_veiculos_imprensa: { id: string; nome: string; tipo: string | null; tier: string | null; cidade: string | null; regiao: string | null } | null
}

const CAMPOS_DISPONIVEIS = [
  { key: 'nome', label: 'Nome' },
  { key: 'email', label: 'E-mail' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'editoria', label: 'Editoria' },
  { key: 'programa', label: 'Programa' },
  { key: 'regiao', label: 'Região' },
  { key: 'situacao', label: 'Situação' },
  { key: 'veiculo', label: 'Veículo' },
]

const SITUACOES = ['ativo', 'desatualizado', 'revisar']

type Filtros = {
  situacao: string[]
  regiao: string[]
  editoria: string[]
  veiculo_ids: string[]
  busca: string
}

type Aba = 'mailings' | 'construtor'

// ── Componente ───────────────────────────────────────────────────────

export default function MailingPage() {
  const [aba, setAba] = useState<Aba>('mailings')

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mailing</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Construa e exporte listas de jornalistas</p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
          <button onClick={() => setAba('mailings')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${aba === 'mailings' ? 'bg-white dark:bg-[#111] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            Mailings salvos
          </button>
          <button onClick={() => setAba('construtor')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${aba === 'construtor' ? 'bg-white dark:bg-[#111] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            Construtor
          </button>
        </div>
      </div>

      {aba === 'mailings' ? <ListaMailings onNovo={() => setAba('construtor')} /> : <ConstrutorMailing onSalvo={() => setAba('mailings')} />}
    </div>
  )
}

// ── Lista de mailings salvos ──────────────────────────────────────────

function ListaMailings({ onNovo }: { onNovo: () => void }) {
  const [rows, setRows] = useState<Mailing[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const load = useCallback(async () => {
    setLoading(true)
    try { setRows(await getMailings()) } catch { /* silencioso */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function handleDeletar(id: string) {
    startTransition(async () => {
      try { await deletarMailing(id); setConfirmDelete(null); load() }
      catch { setConfirmDelete(null) }
    })
  }

  function fmt(d: string) {
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={onNovo}
          className="flex items-center gap-2 bg-gold text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Mailing
        </button>
      </div>

      <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-gray-400 mb-3">Nenhum mailing salvo ainda.</p>
            <button onClick={onNovo} className="text-sm text-gold hover:underline">Criar o primeiro →</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-white/3">
            {rows.map(m => (
              <div key={m.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white">{m.nome}</p>
                  {m.descricao && <p className="text-xs text-gray-400 mt-0.5">{m.descricao}</p>}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{m.campos.length} campo{m.campos.length !== 1 ? 's' : ''}</span>
                    {m.incluidos.length > 0 && <span className="text-xs text-emerald-500">+{m.incluidos.length} incluído{m.incluidos.length !== 1 ? 's' : ''}</span>}
                    {m.excluidos.length > 0 && <span className="text-xs text-red-400">−{m.excluidos.length} excluído{m.excluidos.length !== 1 ? 's' : ''}</span>}
                    <span className="text-xs text-gray-400">Atualizado {fmt(m.updated_at)}</span>
                  </div>
                </div>
                <button onClick={() => setConfirmDelete(m.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Excluir mailing?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-600">Cancelar</button>
              <button onClick={() => handleDeletar(confirmDelete!)} disabled={isPending}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Construtor de Mailing ─────────────────────────────────────────────

function ConstrutorMailing({ onSalvo }: { onSalvo: () => void }) {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [filtros, setFiltros] = useState<Filtros>({
    situacao: ['ativo'], regiao: [], editoria: [], veiculo_ids: [], busca: '',
  })
  const [campos, setCampos] = useState<string[]>(['nome', 'email', 'telefone', 'cargo', 'editoria', 'veiculo'])
  const [resultado, setResultado] = useState<JornalistaRow[]>([])
  const [consultado, setConsultado] = useState(false)
  const [loadingConsulta, setLoadingConsulta] = useState(false)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [excluidos, setExcluidos] = useState<Set<string>>(new Set())
  const [nomeMailing, setNomeMailing] = useState('')
  const [descricao, setDescricao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  useEffect(() => {
    getVeiculos({ ativo: true }).then(setVeiculos).catch(() => {})
  }, [])

  async function handleConsultar() {
    setLoadingConsulta(true)
    setErro(null)
    try {
      const res = await consultarMailing({
        situacao: filtros.situacao.length ? filtros.situacao : undefined,
        regiao: filtros.regiao.length ? filtros.regiao : undefined,
        editoria: filtros.editoria.length ? filtros.editoria : undefined,
        veiculo_id: filtros.veiculo_ids.length ? filtros.veiculo_ids : undefined,
        busca: filtros.busca || undefined,
        incluidos: Array.from(selecionados),
        excluidos: Array.from(excluidos),
      })
      setResultado(res as unknown as JornalistaRow[])
      setConsultado(true)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro na consulta.')
    } finally {
      setLoadingConsulta(false)
    }
  }

  function toggleCampo(key: string) {
    setCampos(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key])
  }

  function toggleSelecionado(id: string) {
    setSelecionados(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function toggleExcluido(id: string) {
    setExcluidos(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
    // se estava selecionado, remove
    setSelecionados(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  const listaFinal = resultado.filter(r => !excluidos.has(r.id))
  const todosSelecionados = listaFinal.length > 0 && listaFinal.every(r => selecionados.has(r.id))

  function toggleTodos() {
    if (todosSelecionados) {
      setSelecionados(new Set())
    } else {
      setSelecionados(new Set(listaFinal.map(r => r.id)))
    }
  }

  function getValorCampo(j: JornalistaRow, campo: string): string {
    const map: Record<string, () => string> = {
      nome: () => j.nome,
      email: () => j.email ?? '',
      telefone: () => j.telefone ?? '',
      whatsapp: () => j.whatsapp ?? '',
      cargo: () => j.cargo ?? '',
      editoria: () => j.editoria ?? '',
      programa: () => j.programa ?? '',
      regiao: () => j.regiao ?? '',
      situacao: () => j.situacao,
      veiculo: () => j.spress_veiculos_imprensa?.nome ?? '',
    }
    return map[campo]?.() ?? ''
  }

  async function handleExportar(formato: 'csv' | 'emails_txt') {
    setExportando(true)
    setErro(null)
    try {
      const rows = selecionados.size > 0
        ? listaFinal.filter(r => selecionados.has(r.id))
        : listaFinal

      if (rows.length === 0) { setErro('Nenhum jornalista para exportar.'); return }

      let conteudo = ''
      let mimeType = ''
      let ext = ''

      if (formato === 'csv') {
        const cabecalho = campos.map(c => CAMPOS_DISPONIVEIS.find(d => d.key === c)?.label ?? c)
        const linhas = rows.map(r =>
          campos.map(c => {
            const v = getValorCampo(r, c)
            return v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v
          }).join(',')
        )
        conteudo = [cabecalho.join(','), ...linhas].join('\n')
        mimeType = 'text/csv;charset=utf-8;'
        ext = 'csv'
      } else {
        conteudo = rows.map(r => r.email).filter(Boolean).join('\n')
        mimeType = 'text/plain;charset=utf-8;'
        ext = 'txt'
      }

      const blob = new Blob(['﻿' + conteudo], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mailing_${new Date().toISOString().substring(0, 10)}.${ext}`
      a.click()
      URL.revokeObjectURL(url)

      await registrarExportacao({
        filtros: filtros as unknown as Record<string, unknown>,
        campos,
        formato,
        qtd_registros: rows.length,
      })
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao exportar.')
    } finally {
      setExportando(false)
    }
  }

  async function handleSalvar() {
    if (!nomeMailing.trim()) { setErro('Informe um nome para o mailing.'); return }
    setSalvando(true)
    setErro(null)
    try {
      await salvarMailing({
        nome: nomeMailing.trim(),
        descricao: descricao.trim() || undefined,
        filtros: filtros as unknown as Record<string, unknown>,
        campos,
        incluidos: Array.from(selecionados),
        excluidos: Array.from(excluidos),
      })
      setSucesso(`Mailing "${nomeMailing}" salvo!`)
      setTimeout(() => { setSucesso(null); onSalvo() }, 1500)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar.')
    } finally {
      setSalvando(false)
    }
  }

  function toggleFiltroSituacao(v: string) {
    setFiltros(f => ({
      ...f,
      situacao: f.situacao.includes(v) ? f.situacao.filter(s => s !== v) : [...f.situacao, v],
    }))
  }

  function toggleFiltroEditoria(v: string) {
    setFiltros(f => ({
      ...f,
      editoria: f.editoria.includes(v) ? f.editoria.filter(e => e !== v) : [...f.editoria, v],
    }))
  }

  function toggleFiltroRegiao(v: string) {
    setFiltros(f => ({
      ...f,
      regiao: f.regiao.includes(v) ? f.regiao.filter(r => r !== v) : [...f.regiao, v],
    }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Coluna esquerda: Filtros + Campos */}
      <div className="space-y-5">
        {/* Filtros */}
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Filtros</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Situação</p>
              <div className="flex flex-wrap gap-2">
                {SITUACOES.map(s => (
                  <button key={s} onClick={() => toggleFiltroSituacao(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${filtros.situacao.includes(s) ? 'bg-gold/15 text-yellow-700 dark:text-yellow-400' : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Região</p>
              <div className="flex flex-wrap gap-1.5">
                {REGIOES_IMPRENSA.map(r => (
                  <button key={r} onClick={() => toggleFiltroRegiao(r)}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${filtros.regiao.includes(r) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Editoria</p>
              <div className="flex flex-wrap gap-1.5">
                {EDITORIAS_IMPRENSA.map(e => (
                  <button key={e} onClick={() => toggleFiltroEditoria(e)}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${filtros.editoria.includes(e) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Veículo</p>
              <select
                className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold/50"
                value={filtros.veiculo_ids[0] ?? ''}
                onChange={e => setFiltros(f => ({ ...f, veiculo_ids: e.target.value ? [e.target.value] : [] }))}>
                <option value="">Todos os veículos</option>
                {veiculos.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
              </select>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Busca livre</p>
              <input
                className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold/50"
                placeholder="nome ou e-mail"
                value={filtros.busca}
                onChange={e => setFiltros(f => ({ ...f, busca: e.target.value }))}
              />
            </div>

            <button onClick={handleConsultar} disabled={loadingConsulta}
              className="w-full flex items-center justify-center gap-2 bg-gold text-white py-2 rounded-xl text-sm font-semibold hover:bg-gold/90 disabled:opacity-50 transition-colors">
              {loadingConsulta && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Consultar
            </button>
          </div>
        </div>

        {/* Campos */}
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Campos exportados</h3>
          <div className="space-y-1.5">
            {CAMPOS_DISPONIVEIS.map(c => (
              <label key={c.key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" checked={campos.includes(c.key)} onChange={() => toggleCampo(c.key)}
                  className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold/30" />
                {c.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Coluna direita: Resultados */}
      <div className="lg:col-span-2 space-y-4">
        {/* Barra de ações */}
        {consultado && (
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {listaFinal.length} jornalista{listaFinal.length !== 1 ? 's' : ''}
                {selecionados.size > 0 && ` · ${selecionados.size} selecionado${selecionados.size !== 1 ? 's' : ''}`}
              </span>
              <div className="flex-1" />
              <button onClick={() => handleExportar('emails_txt')} disabled={exportando}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-gold/50 transition-colors">
                📧 Exportar e-mails
              </button>
              <button onClick={() => handleExportar('csv')} disabled={exportando}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-gold/50 transition-colors">
                📊 Exportar CSV
              </button>
            </div>

            {/* Salvar mailing */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 flex flex-wrap items-center gap-3">
              <input
                className="flex-1 min-w-[180px] bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-gold/50"
                placeholder="Nome do mailing para salvar…"
                value={nomeMailing}
                onChange={e => setNomeMailing(e.target.value)}
              />
              <input
                className="flex-1 min-w-[150px] bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-gold/50"
                placeholder="Descrição (opcional)"
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
              />
              <button onClick={handleSalvar} disabled={salvando}
                className="flex items-center gap-2 bg-navy dark:bg-white/10 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-navy/90 disabled:opacity-50 transition-colors">
                {salvando && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Salvar
              </button>
            </div>
          </div>
        )}

        {erro && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-2">{erro}</p>
        )}
        {sucesso && (
          <p className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl px-4 py-2">{sucesso}</p>
        )}

        {/* Tabela de resultados */}
        {!consultado ? (
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-center py-24">
            <p className="text-sm text-gray-400">Configure os filtros e clique em Consultar.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
            {listaFinal.length === 0 ? (
              <div className="text-center py-16 text-sm text-gray-400">Nenhum resultado para esses filtros.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/5">
                      <th className="px-3 py-3 w-8">
                        <input type="checkbox" checked={todosSelecionados} onChange={toggleTodos}
                          className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold/30" />
                      </th>
                      {campos.includes('nome') && <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</th>}
                      {campos.includes('email') && <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">E-mail</th>}
                      {campos.includes('editoria') && <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Editoria</th>}
                      {campos.includes('veiculo') && <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Veículo</th>}
                      <th className="px-3 py-3 w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/3">
                    {listaFinal.map(j => (
                      <tr key={j.id} className={`hover:bg-gray-50 dark:hover:bg-white/2 transition-colors ${selecionados.has(j.id) ? 'bg-gold/5' : ''}`}>
                        <td className="px-3 py-2.5">
                          <input type="checkbox" checked={selecionados.has(j.id)} onChange={() => toggleSelecionado(j.id)}
                            className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold/30" />
                        </td>
                        {campos.includes('nome') && (
                          <td className="px-3 py-2.5">
                            <p className="font-medium text-gray-900 dark:text-white">{j.nome}</p>
                            {j.cargo && <p className="text-xs text-gray-400">{j.cargo}</p>}
                          </td>
                        )}
                        {campos.includes('email') && (
                          <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">
                            {j.email ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        )}
                        {campos.includes('editoria') && (
                          <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                            {j.editoria ?? '—'}
                          </td>
                        )}
                        {campos.includes('veiculo') && (
                          <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400 hidden md:table-cell">
                            {j.spress_veiculos_imprensa?.nome ?? '—'}
                          </td>
                        )}
                        <td className="px-3 py-2.5">
                          <button onClick={() => toggleExcluido(j.id)} title="Excluir desta lista"
                            className="p-1 rounded text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-400 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Excluídos */}
        {excluidos.size > 0 && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-red-600 dark:text-red-400">
              {excluidos.size} jornalista{excluidos.size !== 1 ? 's' : ''} excluído{excluidos.size !== 1 ? 's' : ''} desta lista
            </p>
            <button onClick={() => setExcluidos(new Set())}
              className="text-xs text-red-500 hover:underline">Limpar exclusões</button>
          </div>
        )}
      </div>
    </div>
  )
}
