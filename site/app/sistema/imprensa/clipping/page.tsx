'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { getClippings, criarClipping, atualizarClipping, deletarClipping, getVeiculos, type Clipping, type Veiculo } from '../../actions/imprensa'
import { getClientesBasico } from '../../actions/blog'

const FORMATO_LABEL: Record<string, string> = {
  materia: 'Matéria', nota: 'Nota', artigo: 'Artigo', entrevista: 'Entrevista',
  impresso: 'Impresso', reels: 'Reels', shorts: 'Shorts', video: 'Vídeo',
  post: 'Post', podcast: 'Podcast', outro: 'Outro',
}

const INPUT = 'w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition'
const LABEL = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1'

function fmt(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

type FormData = {
  titulo: string; url: string; formato: string; data_publicacao: string
  veiculo_id: string; jornalista_id: string; cliente_id: string
}
const EMPTY: FormData = { titulo: '', url: '', formato: '', data_publicacao: '', veiculo_id: '', jornalista_id: '', cliente_id: '' }

export default function ClippingPage() {
  const [rows, setRows] = useState<Clipping[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [clientes, setClientes] = useState<{ id: string; razao_social: string; nome_fantasia: string | null }[]>([])
  const [formatoFiltro, setFormatoFiltro] = useState('')
  const [modal, setModal] = useState<'criar' | 'editar' | null>(null)
  const [editing, setEditing] = useState<Clipping | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const PER_PAGE = 50

  const load = useCallback(async (p = 1, fmt2 = formatoFiltro) => {
    setLoading(true)
    try {
      const res = await getClippings({ page: p, perPage: PER_PAGE, formato: fmt2 || undefined })
      setRows(res.rows)
      setTotal(res.total)
    } catch {
      /* silencioso */
    } finally {
      setLoading(false)
    }
  }, [formatoFiltro])

  useEffect(() => { load(1) }, [])
  useEffect(() => { getVeiculos({ ativo: true }).then(setVeiculos).catch(() => {}) }, [])
  useEffect(() => { getClientesBasico().then(setClientes).catch(() => {}) }, [])

  function abrirCriar() { setForm(EMPTY); setEditing(null); setErro(null); setModal('criar') }
  function abrirEditar(c: Clipping) {
    setForm({
      titulo: c.titulo ?? '', url: c.url ?? '', formato: c.formato ?? '',
      data_publicacao: c.data_publicacao?.substring(0, 10) ?? '',
      veiculo_id: c.veiculo_id ?? '', jornalista_id: c.jornalista_id ?? '',
      cliente_id: c.cliente_id ?? '',
    })
    setEditing(c); setErro(null); setModal('editar')
  }

  function handleSalvar() {
    setErro(null)
    startTransition(async () => {
      try {
        const payload = {
          titulo: form.titulo.trim() || undefined,
          url: form.url.trim() || undefined,
          formato: (form.formato || undefined) as Clipping['formato'],
          data_publicacao: form.data_publicacao || undefined,
          veiculo_id: form.veiculo_id || undefined,
          cliente_id: form.cliente_id || undefined,
        }
        if (modal === 'criar') await criarClipping(payload)
        else if (editing) await atualizarClipping(editing.id, payload)
        setModal(null); load(page)
      } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
    })
  }

  function handleDeletar(id: string) {
    startTransition(async () => {
      try { await deletarClipping(id); setConfirmDelete(null); load(page) }
      catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao excluir.'); setConfirmDelete(null) }
    })
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Clipping</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{total} publicaç{total !== 1 ? 'ões' : 'ão'}</p>
        </div>
        <button onClick={abrirCriar}
          className="flex items-center gap-2 bg-gold text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Registrar
        </button>
      </div>

      <div className="mb-5">
        <select value={formatoFiltro} onChange={e => { setFormatoFiltro(e.target.value); setPage(1); load(1, e.target.value) }}
          className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none">
          <option value="">Todos os formatos</option>
          {Object.entries(FORMATO_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">Nenhum clipping encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Publicação</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Veículo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Formato</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Data</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/3">
                {rows.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      {c.url ? (
                        <a href={c.url} target="_blank" rel="noreferrer"
                          className="font-medium text-gold hover:underline truncate block max-w-xs">
                          {c.titulo || c.url}
                        </a>
                      ) : (
                        <span className="font-medium text-gray-700 dark:text-gray-300">{c.titulo || '—'}</span>
                      )}
                      {c.cliente_nome && <p className="text-xs text-gray-400">{c.cliente_nome}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">{c.veiculo_nome ?? '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {c.formato ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400">
                          {FORMATO_LABEL[c.formato] ?? c.formato}
                        </span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{fmt(c.data_publicacao)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => abrirEditar(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </svg>
                        </button>
                        <button onClick={() => setConfirmDelete(c.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-gray-400">Página {page} de {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); load(page - 1) }}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:border-gold/50 transition-colors">← Anterior</button>
            <button disabled={page >= totalPages} onClick={() => { setPage(p => p + 1); load(page + 1) }}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:border-gold/50 transition-colors">Próximo →</button>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{modal === 'criar' ? 'Registrar Clipping' : 'Editar Clipping'}</h2>
              <button onClick={() => setModal(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={LABEL}>URL da publicação</label>
                <input type="url" className={INPUT} placeholder="https://…" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
              </div>
              <div>
                <label className={LABEL}>Título</label>
                <input className={INPUT} value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
              </div>
              <div>
                <label className={LABEL}>Cliente</label>
                <select className={INPUT} value={form.cliente_id} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))}>
                  <option value="">— sem cliente —</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome_fantasia || c.razao_social}</option>)}
                </select>
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
                  <label className={LABEL}>Formato</label>
                  <select className={INPUT} value={form.formato} onChange={e => setForm(f => ({ ...f, formato: e.target.value }))}>
                    <option value="">— selecione —</option>
                    {Object.entries(FORMATO_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={LABEL}>Data de publicação</label>
                <input type="date" className={INPUT} value={form.data_publicacao} onChange={e => setForm(f => ({ ...f, data_publicacao: e.target.value }))} />
              </div>
              {erro && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2">{erro}</p>}
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400">Cancelar</button>
              <button onClick={handleSalvar} disabled={isPending}
                className="flex items-center gap-2 bg-gold text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gold/90 disabled:opacity-50 transition-colors">
                {isPending && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Excluir clipping?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-600">Cancelar</button>
              <button onClick={() => handleDeletar(confirmDelete!)} disabled={isPending}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
