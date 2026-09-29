'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { getClientes, toggleClienteStatus } from '../../actions/clientes'
import { getConvitesClientes, cancelarConviteCliente } from '../../actions/convites-clientes'
import { ConviteClienteModal } from './ConviteClienteModal'

type Cliente = {
  id: string
  razao_social: string | null
  nome_fantasia: string | null
  cnpj: string | null
  segmento: string | null
  status: string
  email: string | null
  telefone: string | null
}

const STATUS_STYLE: Record<string, string> = {
  ativo:     'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/30',
  inativo:   'bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/5 dark:text-gray-500 dark:border-white/10',
  suspenso:  'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/30',
}

function formatCNPJ(v: string | null) {
  if (!v) return '—'
  const d = v.replace(/\D/g, '')
  if (d.length !== 14) return v
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}

type ConviteCliente = {
  id: string
  token: string
  empresa_sugerida: string | null
  expires_at: string
  usado_em: string | null
  created_at: string
}

export default function ClientesPage() {
  const [list, setList] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [convites, setConvites] = useState<ConviteCliente[]>([])
  const [loadingConvites, setLoadingConvites] = useState(true)
  const [cancelandoId, setCancelandoId] = useState<string | null>(null)
  const [copiadoId, setCopiadoId] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<'clientes' | 'convites'>('clientes')
  const [showConvite, setShowConvite] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setList((await getClientes()) as unknown as Cliente[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadConvites = useCallback(async () => {
    setLoadingConvites(true)
    try {
      setConvites((await getConvitesClientes()) as unknown as ConviteCliente[])
    } finally {
      setLoadingConvites(false)
    }
  }, [])

  useEffect(() => { load(); loadConvites() }, [load, loadConvites])

  async function handleToggle(id: string, current: string) {
    const next = current === 'ativo' ? 'inativo' : 'ativo'
    await toggleClienteStatus(id, next)
    setList((prev) => prev.map((c) => (c.id === id ? { ...c, status: next } : c)))
  }

  async function handleCancelarConvite(id: string) {
    if (!confirm('Cancelar este convite? O link deixará de funcionar.')) return
    setCancelandoId(id)
    try {
      await cancelarConviteCliente(id)
      setConvites((prev) => prev.filter((c) => c.id !== id))
    } finally {
      setCancelandoId(null)
    }
  }

  function handleCopiarConvite(token: string, id: string) {
    const url = `${window.location.origin}/convite-cliente/${token}`
    navigator.clipboard.writeText(url)
    setCopiadoId(id)
    setTimeout(() => setCopiadoId(null), 2000)
  }

  function conviteStatus(c: ConviteCliente): 'ativo' | 'utilizado' | 'expirado' {
    if (c.usado_em) return 'utilizado'
    if (new Date(c.expires_at) < new Date()) return 'expirado'
    return 'ativo'
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 dark:text-white text-2xl font-bold">Clientes</h1>
          {!loading && (
            <p className="text-gray-400 dark:text-gray-600 text-sm mt-0.5">
              {list.length} registro{list.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConvite(true)}
            className="border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            Convidar
          </button>
          <Link
            href="/sistema/cadastros/clientes/novo"
            className="bg-gold text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9e2126] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Novo Cliente
          </Link>
        </div>
      </div>

      {/* Abas */}
      <div className="flex border-b border-gray-100 dark:border-white/5 mb-6">
        <button
          onClick={() => setActiveTab('clientes')}
          className={`flex items-center gap-2 px-1 py-2.5 mr-7 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'clientes'
              ? 'border-gold text-gold'
              : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Clientes
          {!loading && (
            <span className="text-[11px] bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 rounded-full px-2 py-0.5 font-semibold tabular-nums">
              {list.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('convites')}
          className={`flex items-center gap-2 px-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'convites'
              ? 'border-gold text-gold'
              : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Convites
          {!loadingConvites && (
            <span className="text-[11px] bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 rounded-full px-2 py-0.5 font-semibold tabular-nums">
              {convites.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Aba Clientes ─────────────────────────────────── */}
      {activeTab === 'clientes' && (<>
      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/30 rounded-xl p-4 mb-6 text-red-600 dark:text-red-400 text-sm">
          {error === 'SERVICE_KEY_NOT_SET'
            ? 'Configure SUPABASE_SERVICE_ROLE_KEY no .env.local para acessar os dados.'
            : error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : list.length === 0 && !error ? (
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-20 text-center">
          <svg className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-600">Nenhum cliente cadastrado ainda.</p>
          <Link href="/sistema/cadastros/clientes/novo" className="mt-4 inline-block text-gold hover:text-gold/80 text-sm transition-colors">
            Cadastrar o primeiro cliente →
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5">
                {['Cliente', 'CNPJ', 'Segmento', 'Contato', 'Status', ''].map((h) => (
                  <th key={h} className={`text-left text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium py-3.5 ${h === '' ? 'pr-6' : 'px-6'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 dark:border-white/[0.04] last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold/30 to-gold/60 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {(c.nome_fantasia ?? c.razao_social ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white text-sm font-medium leading-tight">
                          {c.nome_fantasia ?? c.razao_social ?? '—'}
                        </p>
                        {c.nome_fantasia && c.razao_social && (
                          <p className="text-gray-400 dark:text-gray-600 text-xs mt-0.5">{c.razao_social}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm font-mono">
                    {formatCNPJ(c.cnpj)}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                    {c.segmento ?? '—'}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{c.email ?? '—'}</p>
                    {c.telefone && (
                      <p className="text-gray-400 text-xs mt-0.5">{c.telefone}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(c.id, c.status)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${STATUS_STYLE[c.status] ?? STATUS_STYLE.ativo}`}
                    >
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </button>
                  </td>
                  <td className="pr-6 py-4 text-right">
                    <Link
                      href={`/sistema/cadastros/clientes/${c.id}`}
                      className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white text-xs transition-colors"
                    >
                      Editar →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </>)}

      {/* ── Aba Convites ─────────────────────────────────── */}
      {activeTab === 'convites' && (
        loadingConvites ? (
          <div className="flex justify-center py-24">
            <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : convites.length === 0 ? (
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-20 text-center">
            <svg className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            <p className="text-gray-500 dark:text-gray-600">Nenhum convite gerado ainda.</p>
            <button onClick={() => setShowConvite(true)} className="mt-4 inline-block text-gold hover:text-gold/80 text-sm transition-colors">
              Gerar primeiro convite →
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
            {convites.map((c, i) => {
              const st = conviteStatus(c)
              const stStyle = {
                ativo:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30',
                utilizado: 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500 border-gray-200 dark:border-white/10',
                expirado:  'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400 border-red-100 dark:border-red-900/30',
              }[st]
              return (
                <div key={c.id} className={`flex items-center gap-4 px-6 py-3.5 ${i > 0 ? 'border-t border-gray-50 dark:border-white/[0.04]' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-white text-sm font-medium leading-tight">
                      {c.empresa_sugerida ?? <span className="text-gray-400 italic">Sem empresa sugerida</span>}
                    </p>
                    <p className="text-gray-400 dark:text-gray-600 text-xs mt-0.5">
                      {new Date(c.created_at).toLocaleDateString('pt-BR')}
                      {c.usado_em && ` · usado em ${new Date(c.usado_em).toLocaleDateString('pt-BR')}`}
                    </p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${stStyle}`}>
                    {{ ativo: 'Ativo', utilizado: 'Utilizado', expirado: 'Expirado' }[st]}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {st === 'ativo' && (
                      <button
                        onClick={() => handleCopiarConvite(c.token, c.id)}
                        className="px-3 py-1.5 text-xs border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gold/40 hover:text-gold rounded-lg font-medium transition-colors flex items-center gap-1.5"
                      >
                        {copiadoId === c.id ? (
                          <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Copiado</>
                        ) : (
                          <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>Copiar link</>
                        )}
                      </button>
                    )}
                    {st !== 'utilizado' && (
                      <button
                        onClick={() => handleCancelarConvite(c.id)}
                        disabled={cancelandoId === c.id}
                        className="px-3 py-1.5 text-xs text-red-500 hover:text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {cancelandoId === c.id ? '...' : 'Excluir'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {showConvite && (
        <ConviteClienteModal onClose={() => { setShowConvite(false); loadConvites() }} />
      )}
    </div>
  )
}
