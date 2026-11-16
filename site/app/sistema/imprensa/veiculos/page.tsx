'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import {
  getVeiculos, getVeiculoOpcoes, criarVeiculo, atualizarVeiculo, deletarVeiculo,
  type Veiculo,
} from '../../actions/imprensa'
import { ComboInput } from '../../components/ComboInput'

const TIER_STYLE: Record<string, string> = {
  tier1: 'bg-gold/15 text-yellow-700 dark:text-yellow-400',
  tier2: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  tier3: 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500',
}

const INPUT = 'w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition'
const LABEL = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1'

type FormData = {
  nome: string
  tipo: string
  regiao: string
  cidade: string
  tier: '' | 'tier1' | 'tier2' | 'tier3'
  periodicidade: string
  principal: boolean
  ativo: boolean
  observacoes: string
}

const EMPTY: FormData = {
  nome: '', tipo: '', regiao: '', cidade: '', tier: '', periodicidade: '',
  principal: false, ativo: true, observacoes: '',
}

// Opções pré-carregadas para campos com combo
interface OpcoesCampos {
  tipo: string[]
  periodicidade: string[]
  regiao: string[]
  cidade: string[]
}

const OPCOES_VAZIAS: OpcoesCampos = { tipo: [], periodicidade: [], regiao: [], cidade: [] }

export default function VeiculosPage() {
  const [rows, setRows] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [opcoes, setOpcoes] = useState<OpcoesCampos>(OPCOES_VAZIAS)
  const [busca, setBusca] = useState('')
  const [ativoFiltro, setAtivoFiltro] = useState<'todos' | 'ativo' | 'inativo'>('ativo')
  const [tierFiltro, setTierFiltro] = useState('')
  const [modal, setModal] = useState<'criar' | 'editar' | null>(null)
  const [editing, setEditing] = useState<Veiculo | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const buscaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (q = busca, ativo = ativoFiltro, tier = tierFiltro) => {
    setLoading(true)
    try {
      const res = await getVeiculos({
        busca: q || undefined,
        ativo: ativo === 'todos' ? undefined : ativo === 'ativo',
        tier: tier || undefined,
      })
      setRows(res)
    } catch {
      /* silencioso */
    } finally {
      setLoading(false)
    }
  }, [busca, ativoFiltro, tierFiltro])

  useEffect(() => { load() }, [])

  async function carregarOpcoes() {
    const [tipo, periodicidade, regiao, cidade] = await Promise.all([
      getVeiculoOpcoes('tipo'),
      getVeiculoOpcoes('periodicidade'),
      getVeiculoOpcoes('regiao'),
      getVeiculoOpcoes('cidade'),
    ])
    setOpcoes({ tipo, periodicidade, regiao, cidade })
  }

  function handleBusca(v: string) {
    setBusca(v)
    if (buscaTimer.current) clearTimeout(buscaTimer.current)
    buscaTimer.current = setTimeout(() => load(v, ativoFiltro, tierFiltro), 350)
  }

  function abrirCriar() {
    setForm(EMPTY)
    setEditing(null)
    setErro(null)
    setModal('criar')
    carregarOpcoes()
  }

  function abrirEditar(v: Veiculo) {
    setForm({
      nome: v.nome, tipo: v.tipo ?? '', regiao: v.regiao ?? '', cidade: v.cidade ?? '',
      tier: v.tier ?? '', periodicidade: v.periodicidade ?? '',
      principal: v.principal, ativo: v.ativo, observacoes: v.observacoes ?? '',
    })
    setEditing(v)
    setErro(null)
    setModal('editar')
    carregarOpcoes()
  }

  function mergeOpcao(campo: keyof OpcoesCampos, valor: string) {
    if (!valor.trim()) return
    setOpcoes(prev => {
      if (prev[campo].includes(valor)) return prev
      return { ...prev, [campo]: [...prev[campo], valor].sort() }
    })
  }

  function handleSalvar() {
    if (!form.nome.trim()) { setErro('Nome é obrigatório.'); return }
    setErro(null)
    startTransition(async () => {
      try {
        const payload = {
          nome: form.nome.trim(),
          tipo: form.tipo.trim() || undefined,
          regiao: form.regiao.trim() || undefined,
          cidade: form.cidade.trim() || undefined,
          tier: (form.tier || undefined) as 'tier1' | 'tier2' | 'tier3' | undefined,
          periodicidade: form.periodicidade.trim() || undefined,
          principal: form.principal,
          ativo: form.ativo,
          observacoes: form.observacoes.trim() || undefined,
        }
        if (modal === 'criar') await criarVeiculo(payload)
        else if (editing) await atualizarVeiculo(editing.id, payload)

        // Adiciona novos valores nas opções em memória
        if (payload.tipo) mergeOpcao('tipo', payload.tipo)
        if (payload.periodicidade) mergeOpcao('periodicidade', payload.periodicidade)
        if (payload.regiao) mergeOpcao('regiao', payload.regiao)
        if (payload.cidade) mergeOpcao('cidade', payload.cidade)

        setModal(null)
        load()
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Erro ao salvar.')
      }
    })
  }

  function handleDeletar(id: string) {
    startTransition(async () => {
      try {
        await deletarVeiculo(id)
        setConfirmDelete(null)
        load()
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Erro ao excluir.')
        setConfirmDelete(null)
      }
    })
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Veículos de Imprensa</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{rows.length} veículo{rows.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={abrirCriar}
          className="flex items-center gap-2 bg-gold text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text" placeholder="Buscar…" value={busca}
          onChange={e => handleBusca(e.target.value)}
          className="flex-1 min-w-[180px] bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold/50"
        />
        <select
          value={ativoFiltro}
          onChange={e => { setAtivoFiltro(e.target.value as typeof ativoFiltro); load(busca, e.target.value as typeof ativoFiltro, tierFiltro) }}
          className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none">
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
          <option value="todos">Todos</option>
        </select>
        <select
          value={tierFiltro}
          onChange={e => { setTierFiltro(e.target.value); load(busca, ativoFiltro, e.target.value) }}
          className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none">
          <option value="">Todos os tiers</option>
          <option value="tier1">Tier 1</option>
          <option value="tier2">Tier 2</option>
          <option value="tier3">Tier 3</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">Nenhum veículo encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Tipo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Região</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tier</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/3">
                {rows.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {v.principal && <span className="text-gold" title="Veículo principal">★</span>}
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{v.nome}</span>
                          {v.cidade && <p className="text-xs text-gray-400">{v.cidade}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">{v.tipo ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell">{v.regiao ?? '—'}</td>
                    <td className="px-4 py-3">
                      {v.tier ? (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TIER_STYLE[v.tier]}`}>
                          {v.tier}
                        </span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${v.ativo ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500'}`}>
                        {v.ativo ? 'ativo' : 'inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => abrirEditar(v)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </svg>
                        </button>
                        <button onClick={() => setConfirmDelete(v.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal criar/editar */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {modal === 'criar' ? 'Novo Veículo' : 'Editar Veículo'}
              </h2>
              <button onClick={() => setModal(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Nome */}
              <div>
                <label className={LABEL}>Nome *</label>
                <input
                  className={INPUT}
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                />
              </div>

              {/* Tipo + Periodicidade */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Tipo</label>
                  <ComboInput
                    value={form.tipo}
                    onChange={v => setForm(f => ({ ...f, tipo: v }))}
                    options={opcoes.tipo}
                    placeholder="TV, Rádio, Portal…"
                  />
                </div>
                <div>
                  <label className={LABEL}>Periodicidade</label>
                  <ComboInput
                    value={form.periodicidade}
                    onChange={v => setForm(f => ({ ...f, periodicidade: v }))}
                    options={opcoes.periodicidade}
                    placeholder="Diário, Semanal…"
                  />
                </div>
              </div>

              {/* Região + Cidade */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Região</label>
                  <ComboInput
                    value={form.regiao}
                    onChange={v => setForm(f => ({ ...f, regiao: v }))}
                    options={opcoes.regiao}
                    placeholder="Nacional, SP, RJ…"
                  />
                </div>
                <div>
                  <label className={LABEL}>Cidade</label>
                  <ComboInput
                    value={form.cidade}
                    onChange={v => setForm(f => ({ ...f, cidade: v }))}
                    options={opcoes.cidade}
                    placeholder="São Paulo, Rio…"
                  />
                </div>
              </div>

              {/* Tier + flags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Tier</label>
                  <select
                    className={INPUT}
                    value={form.tier}
                    onChange={e => setForm(f => ({ ...f, tier: e.target.value as FormData['tier'] }))}>
                    <option value="">— sem tier —</option>
                    <option value="tier1">Tier 1 (top)</option>
                    <option value="tier2">Tier 2</option>
                    <option value="tier3">Tier 3</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2 pt-5">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.principal}
                      onChange={e => setForm(f => ({ ...f, principal: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold/30"
                    />
                    Principal
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.ativo}
                      onChange={e => setForm(f => ({ ...f, ativo: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold/30"
                    />
                    Ativo
                  </label>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className={LABEL}>Observações</label>
                <textarea
                  rows={2}
                  className={INPUT + ' resize-none'}
                  value={form.observacoes}
                  onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                />
              </div>

              {erro && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2">{erro}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setModal(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400">
                Cancelar
              </button>
              <button onClick={handleSalvar} disabled={isPending}
                className="flex items-center gap-2 bg-gold text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gold/90 disabled:opacity-50 transition-colors">
                {isPending && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Excluir veículo?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-600">
                Cancelar
              </button>
              <button onClick={() => handleDeletar(confirmDelete!)} disabled={isPending}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
