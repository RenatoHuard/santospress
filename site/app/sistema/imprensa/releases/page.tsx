'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { getReleases, criarRelease, atualizarRelease, deletarRelease, type Release } from '../../actions/imprensa'
import { getClientesBasico, getPostsPorCliente, type PostVinculado } from '../../actions/blog'

const INPUT = 'w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition'
const LABEL = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1'

function fmt(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

type FormData = { titulo: string; corpo: string; arquivo_url: string; cliente_id: string }
const EMPTY: FormData = { titulo: '', corpo: '', arquivo_url: '', cliente_id: '' }

export default function ReleasesPage() {
  const [rows, setRows] = useState<Release[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState<'criar' | 'editar' | 'ver' | null>(null)
  const [editing, setEditing] = useState<Release | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const buscaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [clientes, setClientes] = useState<{ id: string; razao_social: string; nome_fantasia: string | null }[]>([])
  const [clientePostsFiltro, setClientePostsFiltro] = useState('')
  const [posts, setPosts] = useState<PostVinculado[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const PER_PAGE = 30

  const load = useCallback(async (p = 1, q = busca) => {
    setLoading(true)
    try {
      const res = await getReleases({ page: p, perPage: PER_PAGE, busca: q || undefined })
      setRows(res.rows)
      setTotal(res.total)
    } catch {
      /* silencioso */
    } finally {
      setLoading(false)
    }
  }, [busca])

  useEffect(() => { load(1) }, [])
  useEffect(() => { getClientesBasico().then(setClientes).catch(() => {}) }, [])
  useEffect(() => {
    setPostsLoading(true)
    getPostsPorCliente(clientePostsFiltro || undefined).then(setPosts).catch(() => setPosts([])).finally(() => setPostsLoading(false))
  }, [clientePostsFiltro])

  function handleBusca(v: string) {
    setBusca(v)
    if (buscaTimer.current) clearTimeout(buscaTimer.current)
    buscaTimer.current = setTimeout(() => { setPage(1); load(1, v) }, 350)
  }

  function abrirCriar() { setForm(EMPTY); setEditing(null); setErro(null); setModal('criar') }
  function abrirEditar(r: Release) {
    setForm({ titulo: r.titulo, corpo: r.corpo ?? '', arquivo_url: r.arquivo_url ?? '', cliente_id: r.cliente_id ?? '' })
    setEditing(r); setErro(null); setModal('editar')
  }
  function abrirVer(r: Release) { setEditing(r); setModal('ver') }

  function handleSalvar() {
    if (!form.titulo.trim()) { setErro('Título é obrigatório.'); return }
    setErro(null)
    startTransition(async () => {
      try {
        const payload = {
          titulo: form.titulo.trim(),
          corpo: form.corpo.trim() || undefined,
          arquivo_url: form.arquivo_url.trim() || undefined,
          cliente_id: form.cliente_id || undefined,
        }
        if (modal === 'criar') await criarRelease(payload)
        else if (editing) await atualizarRelease(editing.id, payload)
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
        await deletarRelease(id)
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
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Releases</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{total} release{total !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={abrirCriar}
          className="flex items-center gap-2 bg-gold text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Release
        </button>
      </div>

      <div className="mb-5">
        <input
          type="text" placeholder="Buscar por título…" value={busca}
          onChange={e => handleBusca(e.target.value)}
          className="w-full max-w-sm bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold/50"
        />
      </div>

      <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">Nenhum release encontrado.</div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-white/3">
            {rows.map(r => (
              <div key={r.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                <div className="flex-1 min-w-0">
                  <button onClick={() => abrirVer(r)}
                    className="text-left font-medium text-gray-900 dark:text-white hover:text-gold transition-colors truncate block w-full">
                    {r.titulo}
                  </button>
                  <div className="flex items-center gap-3 mt-1">
                    {r.cliente_nome && (
                      <span className="text-xs text-gray-400">{r.cliente_nome}</span>
                    )}
                    <span className="text-xs text-gray-400">{fmt(r.created_at)}</span>
                    {r.arquivo_url && (
                      <a href={r.arquivo_url} target="_blank" rel="noreferrer"
                        className="text-xs text-gold hover:underline">
                        📎 Arquivo
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => abrirEditar(r)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>
                  <button onClick={() => setConfirmDelete(r.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

      {/* Posts por Cliente */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Posts vinculados a Clientes</h2>
          <select
            value={clientePostsFiltro}
            onChange={e => setClientePostsFiltro(e.target.value)}
            className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold/50 max-w-xs"
          >
            <option value="">Todos os clientes</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome_fantasia || c.razao_social}</option>)}
          </select>
        </div>
        {postsLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">Nenhum post vinculado a cliente encontrado.</p>
        ) : (
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
            <div className="divide-y divide-gray-50 dark:divide-white/3">
              {posts.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    p.tipo === 'case' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                    p.tipo === 'blog' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  }`}>
                    {p.tipo === 'case' ? 'Case' : p.tipo === 'blog' ? 'Blog' : 'Notícia'}
                  </span>
                  <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 truncate">{p.titulo || 'Sem título'}</span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {fmt(p.publicado_em ?? p.created_at)}
                  </span>
                  {p.status === 'publicado' && p.slug && (
                    <a
                      href={`/${p.tipo === 'case' ? 'cases' : p.tipo === 'blog' ? 'blog' : 'noticias'}/${p.slug}`}
                      target="_blank" rel="noreferrer"
                      className="text-xs text-gold hover:underline shrink-0"
                    >
                      Ver →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal criar/editar */}
      {(modal === 'criar' || modal === 'editar') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {modal === 'criar' ? 'Novo Release' : 'Editar Release'}
              </h2>
              <button onClick={() => setModal(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={LABEL}>Título *</label>
                <input className={INPUT} value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
              </div>
              <div>
                <label className={LABEL}>Cliente</label>
                <select className={INPUT} value={form.cliente_id} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))}>
                  <option value="">— sem cliente —</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome_fantasia || c.razao_social}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Conteúdo</label>
                <textarea rows={8} className={INPUT + ' resize-y'} value={form.corpo}
                  onChange={e => setForm(f => ({ ...f, corpo: e.target.value }))}
                  placeholder="Texto do release…" />
              </div>
              <div>
                <label className={LABEL}>URL do arquivo (PDF, DOCX…)</label>
                <input type="url" className={INPUT} value={form.arquivo_url}
                  onChange={e => setForm(f => ({ ...f, arquivo_url: e.target.value }))}
                  placeholder="https://…" />
              </div>
              {erro && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2">{erro}</p>}
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

      {/* Modal ver */}
      {modal === 'ver' && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing.titulo}</h2>
              <button onClick={() => setModal(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {editing.corpo ? (
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">{editing.corpo}</pre>
              ) : (
                <p className="text-sm text-gray-400 italic">Sem conteúdo.</p>
              )}
              {editing.arquivo_url && (
                <a href={editing.arquivo_url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-sm text-gold hover:underline">
                  📎 Baixar arquivo
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Excluir release?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-600">Cancelar</button>
              <button onClick={() => handleDeletar(confirmDelete)} disabled={isPending}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
