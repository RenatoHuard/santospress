'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import {
  getJornalistas, getVeiculos, criarJornalista, atualizarJornalista, deletarJornalista,
  type Jornalista, type Veiculo,
} from '../../actions/imprensa'

const SITUACAO_STYLE: Record<string, string> = {
  ativo:         'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  desatualizado: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  revisar:       'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  inativo:       'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500',
}

const INPUT = 'w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition'
const LABEL = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1'

type FormData = {
  nome: string
  email: string
  telefone: string
  whatsapp: string
  cargo: string
  editoria: string
  programa: string
  regiao: string
  veiculo_id: string
  situacao: Jornalista['situacao']
  observacoes: string
}

const EMPTY: FormData = {
  nome: '', email: '', telefone: '', whatsapp: '', cargo: '',
  editoria: '', programa: '', regiao: '', veiculo_id: '',
  situacao: 'ativo', observacoes: '',
}

export default function JornalistasPage() {
  const [rows, setRows] = useState<Jornalista[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [busca, setBusca] = useState('')
  const [situacaoFiltro, setSituacaoFiltro] = useState('')
  const [modal, setModal] = useState<'criar' | 'editar' | null>(null)
  const [editing, setEditing] = useState<Jornalista | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const buscaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const PER_PAGE = 50

  const load = useCallback(async (p = 1, q = busca, sit = situacaoFiltro) => {
    setLoading(true)
    try {
      const res = await getJornalistas({
        page: p, perPage: PER_PAGE,
        busca: q || undefined,
        situacao: sit || undefined,
      })
      setRows(res.rows)
      setTotal(res.total)
    } catch {
      /* silencioso */
    } finally {
      setLoading(false)
    }
  }, [busca, situacaoFiltro])

  useEffect(() => { load(1) }, [])

  useEffect(() => {
    getVeiculos({ ativo: true }).then(setVeiculos).catch(() => {})
  }, [])

  function handleBusca(v: string) {
    setBusca(v)
    if (buscaTimer.current) clearTimeout(buscaTimer.current)
    buscaTimer.current = setTimeout(() => { setPage(1); load(1, v, situacaoFiltro) }, 350)
  }

  function handleSituacao(v: string) {
    setSituacaoFiltro(v)
    setPage(1)
    load(1, busca, v)
  }

  function abrirCriar() {
    setForm(EMPTY)
    setEditing(null)
    setErro(null)
    setModal('criar')
  }

  function abrirEditar(j: Jornalista) {
    setForm({
      nome: j.nome, email: j.email ?? '', telefone: j.telefone ?? '',
      whatsapp: j.whatsapp ?? '', cargo: j.cargo ?? '', editoria: j.editoria ?? '',
      programa: j.programa ?? '', regiao: j.regiao ?? '',
      veiculo_id: j.veiculo_id ?? '', situacao: j.situacao,
      observacoes: j.observacoes ?? '',
    })
    setEditing(j)
    setErro(null)
    setModal('editar')
  }

  function handleSalvar() {
    if (!form.nome.trim()) { setErro('Nome é obrigatório.'); return }
    setErro(null)
    startTransition(async () => {
      try {
        const payload = {
          nome: form.nome.trim(),
          email: form.email.trim() || undefined,
          telefone: form.telefone.trim() || undefined,
          whatsapp: form.whatsapp.trim() || undefined,
          cargo: form.cargo.trim() || undefined,
          editoria: form.editoria.trim() || undefined,
          programa: form.programa.trim() || undefined,
          regiao: form.regiao.trim() || undefined,
          veiculo_id: form.veiculo_id || undefined,
          situacao: form.situacao,
          observacoes: form.observacoes.trim() || undefined,
        }
        if (modal === 'criar') {
          await criarJornalista(payload)
        } else if (editing) {
          await atualizarJornalista(editing.id, payload)
        }
        setModal(null)
        load(page)
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Erro ao salvar.')
      }
    })
  }

  function handleDeletar(id: string) {
    startTransition(async () => {
      try {
        await deletarJornalista(id)
        setConfirmDelete(null)
        load(page)
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Erro ao excluir.')
        setConfirmDelete(null)
      }
    })
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Jornalistas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{total} cadastro{total !== 1 ? 's' : ''}</p>
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
          type="text" placeholder="Buscar nome ou e-mail…" value={busca}
          onChange={e => handleBusca(e.target.value)}
          className="flex-1 min-w-[200px] bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold/50"
        />
        <select value={situacaoFiltro} onChange={e => handleSituacao(e.target.value)}
          className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold/50">
          <option value="">Todas situações</option>
          <option value="ativo">Ativo</option>
          <option value="desatualizado">Desatualizado</option>
          <option value="revisar">Revisar</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">Nenhum jornalista encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">E-mail</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Editoria</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Veículo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Situação</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/3">
                {rows.map(j => (
                  <tr key={j.id} className="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{j.nome}</p>
                      {j.cargo && <p className="text-xs text-gray-400">{j.cargo}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">{j.email ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell">{j.editoria ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell">{j.veiculo_nome ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${SITUACAO_STYLE[j.situacao] ?? ''}`}>
                        {j.situacao}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => abrirEditar(j)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </svg>
                        </button>
                        <button onClick={() => setConfirmDelete(j.id)}
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

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-gray-400">Página {page} de {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); load(page - 1) }}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:border-gold/50 transition-colors">
              ← Anterior
            </button>
            <button disabled={page >= totalPages} onClick={() => { setPage(p => p + 1); load(page + 1) }}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:border-gold/50 transition-colors">
              Próximo →
            </button>
          </div>
        </div>
      )}

      {/* Modal criar/editar */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {modal === 'criar' ? 'Novo Jornalista' : 'Editar Jornalista'}
              </h2>
              <button onClick={() => setModal(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Nome *</label>
                  <input className={INPUT} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                </div>
                <div>
                  <label className={LABEL}>Cargo</label>
                  <input className={INPUT} value={form.cargo} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>E-mail</label>
                  <input type="email" className={INPUT} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className={LABEL}>Telefone</label>
                  <input className={INPUT} value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>WhatsApp</label>
                  <input className={INPUT} value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} />
                </div>
                <div>
                  <label className={LABEL}>Região</label>
                  <input className={INPUT} placeholder="ex: SP, RJ, Nacional…" value={form.regiao} onChange={e => setForm(f => ({ ...f, regiao: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Editoria</label>
                  <input className={INPUT} value={form.editoria} onChange={e => setForm(f => ({ ...f, editoria: e.target.value }))} />
                </div>
                <div>
                  <label className={LABEL}>Programa / Coluna</label>
                  <input className={INPUT} value={form.programa} onChange={e => setForm(f => ({ ...f, programa: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Veículo</label>
                  <select className={INPUT} value={form.veiculo_id} onChange={e => setForm(f => ({ ...f, veiculo_id: e.target.value }))}>
                    <option value="">— sem veículo —</option>
                    {veiculos.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Situação</label>
                  <select className={INPUT} value={form.situacao} onChange={e => setForm(f => ({ ...f, situacao: e.target.value as Jornalista['situacao'] }))}>
                    <option value="ativo">Ativo</option>
                    <option value="desatualizado">Desatualizado</option>
                    <option value="revisar">Revisar</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={LABEL}>Observações</label>
                <textarea rows={3} className={INPUT + ' resize-none'} value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} />
              </div>
              {erro && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2">{erro}</p>}
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setModal(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400 hover:border-gray-300 transition-colors">
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
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Excluir jornalista?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400">
                Cancelar
              </button>
              <button onClick={() => handleDeletar(confirmDelete)} disabled={isPending}
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
