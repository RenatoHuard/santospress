'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { getFuncionarios, toggleFuncionarioAtivo, excluirColaborador } from '../../actions'
import { getColaboradoresPendentes, aprovarColaborador, rejeitarColaborador, getSetores, getConvites, cancelarConvite } from '../../actions/convites'
import { ConviteModal } from './ConviteModal'

type Funcionario = {
  id: string
  nome: string
  email: string | null
  cargo: string | null
  role: string
  ativo: boolean
  foto_url: string | null
  spress_setores: { nome: string }[] | { nome: string } | null
}

type Pendente = {
  id: string
  nome: string
  email: string
  cargo: string | null
  role: string
  created_at: string
  spress_setores: { nome: string } | null
}

type Setor = { id: string; nome: string }

type Convite = {
  id: string
  token: string
  nome_sugerido: string | null
  cargo_sugerido: string | null
  role: string
  usado_em: string | null
  expires_at: string
  created_at: string
  spress_setores: { nome: string } | null
}

const PER_PAGE = 10

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / PER_PAGE)
  if (totalPages <= 1) return null
  const start = (page - 1) * PER_PAGE + 1
  const end = Math.min(page * PER_PAGE, total)
  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-50 dark:border-white/[0.04]">
      <span className="text-xs text-gray-400 dark:text-gray-600">{start}–{end} de {total}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-500 px-2 tabular-nums">{page} / {totalPages}</span>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function DeleteModal({
  target,
  onClose,
  onSuccess,
}: {
  target: { id: string; nome: string }
  onClose: () => void
  onSuccess: () => void
}) {
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleConfirmar() {
    if (!senha) { setErro('Digite sua senha para confirmar.'); return }
    setLoading(true)
    setErro(null)

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { data: { user } } = await sb.auth.getUser()
    if (!user?.email) {
      setErro('Sessão não encontrada. Faça login novamente.')
      setLoading(false)
      return
    }

    const { error: authErr } = await sb.auth.signInWithPassword({ email: user.email, password: senha })
    if (authErr) {
      const msg = authErr.message.toLowerCase()
      setErro(
        msg.includes('invalid login') || msg.includes('invalid credentials')
          ? 'Senha incorreta.'
          : msg.includes('provider') || msg.includes('oauth')
          ? 'Sua conta usa login com Google. Defina uma senha nas configurações para usar esta função.'
          : authErr.message,
      )
      setLoading(false)
      return
    }

    const result = await excluirColaborador(target.id, user.email)
    if (!result.success) {
      setErro(result.erro ?? 'Erro ao excluir colaborador.')
      setLoading(false)
      return
    }

    onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white font-bold text-base leading-tight">Excluir colaborador</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Você está prestes a excluir <strong className="text-gray-900 dark:text-white">{target.nome}</strong>. Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>

        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
          Sua senha para confirmar
        </label>
        <input
          type="password"
          value={senha}
          onChange={(e) => { setSenha(e.target.value); setErro(null) }}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleConfirmar()}
          className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
          placeholder="••••••••"
          autoFocus
        />

        {erro && <p className="mt-2 text-xs text-red-500">{erro}</p>}

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={loading || !senha}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verificando...
              </>
            ) : (
              'Excluir colaborador'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

const ROLE_STYLE: Record<string, string> = {
  admin: 'bg-gold/15 text-gold border-gold/20',
  atendente: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/30',
  colaborador: 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/30',
  cliente: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  atendente: 'Atendente',
  colaborador: 'Colaborador',
  cliente: 'Cliente',
}

export default function FuncionariosPage() {
  const [list, setList] = useState<Funcionario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [colabPage, setColabPage] = useState(1)

  const [pendentes, setPendentes] = useState<Pendente[]>([])
  const [loadingPendentes, setLoadingPendentes] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const [showConvite, setShowConvite] = useState(false)
  const [setores, setSetores] = useState<Setor[]>([])

  const [convites, setConvites] = useState<Convite[]>([])
  const [loadingConvites, setLoadingConvites] = useState(true)
  const [cancelandoId, setCancelandoId] = useState<string | null>(null)
  const [copiadoId, setCopiadoId] = useState<string | null>(null)
  const [convitePage, setConvitePage] = useState(1)

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nome: string } | null>(null)

  const [activeTab, setActiveTab] = useState<'colaboradores' | 'convites'>('colaboradores')

  const loadConvites = useCallback(async () => {
    setLoadingConvites(true)
    try {
      const data = await getConvites()
      setConvites(data as unknown as Convite[])
    } finally {
      setLoadingConvites(false)
    }
  }, [])

  function conviteStatus(c: Convite): 'ativo' | 'utilizado' | 'expirado' {
    if (c.usado_em) return 'utilizado'
    if (new Date(c.expires_at) < new Date()) return 'expirado'
    return 'ativo'
  }

  async function handleCancelar(id: string) {
    if (!confirm('Cancelar este convite? O link deixará de funcionar.')) return
    setCancelandoId(id)
    try {
      await cancelarConvite(id)
      setConvites((prev) => {
        const next = prev.filter((c) => c.id !== id)
        const maxPage = Math.max(1, Math.ceil(next.length / PER_PAGE))
        setConvitePage((p) => Math.min(p, maxPage))
        return next
      })
    } finally {
      setCancelandoId(null)
    }
  }

  function handleCopiar(token: string, id: string) {
    const url = `${window.location.origin}/convite/${token}`
    navigator.clipboard.writeText(url)
    setCopiadoId(id)
    setTimeout(() => setCopiadoId(null), 2000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getFuncionarios()
      setList(data as unknown as Funcionario[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadPendentes = useCallback(async () => {
    setLoadingPendentes(true)
    try {
      const data = await getColaboradoresPendentes()
      setPendentes(data as unknown as Pendente[])
    } finally {
      setLoadingPendentes(false)
    }
  }, [])

  useEffect(() => {
    load()
    loadPendentes()
    loadConvites()
    getSetores().then(setSetores)
  }, [load, loadPendentes, loadConvites])

  async function handleToggle(id: string, current: boolean) {
    await toggleFuncionarioAtivo(id, !current)
    setList((prev) => prev.map((f) => f.id === id ? { ...f, ativo: !current } : f))
  }

  async function handleAprovar(id: string) {
    setActionId(id)
    try {
      await aprovarColaborador(id)
      setPendentes((prev) => prev.filter((p) => p.id !== id))
      load()
    } finally {
      setActionId(null)
    }
  }

  async function handleRejeitar(id: string) {
    if (!confirm('Rejeitar e excluir este cadastro? A ação não pode ser desfeita.')) return
    setActionId(id)
    try {
      await rejeitarColaborador(id)
      setPendentes((prev) => prev.filter((p) => p.id !== id))
    } finally {
      setActionId(null)
    }
  }

  const colabSlice = list.slice((colabPage - 1) * PER_PAGE, colabPage * PER_PAGE)
  const conviteSlice = convites.slice((convitePage - 1) * PER_PAGE, convitePage * PER_PAGE)

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-gray-900 dark:text-white text-2xl font-bold">Colaboradores</h1>
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
            href="/sistema/cadastros/funcionarios/novo"
            className="bg-gold text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9e2126] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Novo Colaborador
          </Link>
        </div>
      </div>

      {/* Pendentes de aprovação — acima das abas */}
      {!loadingPendentes && pendentes.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Aguardando aprovação</h2>
            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30 rounded-full px-2 py-0.5 font-semibold">
              {pendentes.length}
            </span>
          </div>
          <div className="bg-white dark:bg-[#111] border border-amber-200 dark:border-amber-800/20 rounded-2xl overflow-hidden">
            {pendentes.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-4 px-6 py-4 ${i > 0 ? 'border-t border-gray-50 dark:border-white/[0.04]' : ''}`}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-200 dark:from-amber-900 to-amber-400 flex items-center justify-center text-amber-800 dark:text-amber-200 text-sm font-bold shrink-0">
                  {p.nome.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white text-sm font-medium leading-tight truncate">{p.nome}</p>
                  <p className="text-gray-400 dark:text-gray-600 text-xs mt-0.5 truncate">
                    {p.email}
                    {p.cargo && ` · ${p.cargo}`}
                    {p.spress_setores?.nome && ` · ${p.spress_setores.nome}`}
                  </p>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${ROLE_STYLE[p.role] ?? ROLE_STYLE.cliente}`}>
                  {ROLE_LABEL[p.role] ?? p.role}
                </span>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleAprovar(p.id)}
                    disabled={actionId === p.id}
                    className="px-3 py-1.5 text-xs bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 rounded-lg font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-900/40 disabled:opacity-50 transition-colors"
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleRejeitar(p.id)}
                    disabled={actionId === p.id}
                    className="px-3 py-1.5 text-xs bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 rounded-lg font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 transition-colors"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Abas */}
      <div className="flex border-b border-gray-100 dark:border-white/5 mb-6">
        <button
          onClick={() => setActiveTab('colaboradores')}
          className={`flex items-center gap-2 px-1 py-2.5 mr-7 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'colaboradores'
              ? 'border-gold text-gold'
              : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Colaboradores
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

      {/* Aba: Colaboradores */}
      {activeTab === 'colaboradores' && (
        <>
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-600">Nenhum colaborador cadastrado ainda.</p>
              <Link href="/sistema/cadastros/funcionarios/novo" className="mt-4 inline-block text-gold hover:text-gold/80 text-sm transition-colors">
                Cadastrar o primeiro colaborador →
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5">
                    {['Colaborador', 'Setor', 'Role', 'Site', ''].map((h) => (
                      <th key={h} className={`text-left text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium py-3.5 ${h === '' ? 'pr-6' : 'px-6'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {colabSlice.map((f) => (
                    <tr key={f.id} className="border-b border-gray-50 dark:border-white/[0.04] last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                            {f.foto_url ? (
                              <Image src={f.foto_url} alt={f.nome} width={36} height={36} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-200 dark:from-[#2a2a2a] to-gold/60 flex items-center justify-center text-white text-sm font-bold">
                                {f.nome.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-900 dark:text-white text-sm font-medium leading-tight">{f.nome}</p>
                            <p className="text-gray-400 dark:text-gray-600 text-xs mt-0.5">{f.cargo ?? f.email ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {Array.isArray(f.spress_setores) ? (f.spress_setores[0]?.nome ?? '—') : (f.spress_setores?.nome ?? '—')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${ROLE_STYLE[f.role] ?? ROLE_STYLE.cliente}`}>
                          {ROLE_LABEL[f.role] ?? f.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggle(f.id, f.ativo)}
                          title={f.ativo ? 'Ativo no site' : 'Inativo no site'}
                          className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 focus:outline-none ${f.ativo ? 'bg-gold' : 'bg-gray-200 dark:bg-white/10'}`}
                        >
                          <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${f.ativo ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                      <td className="pr-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setDeleteTarget({ id: f.id, nome: f.nome })}
                            title="Excluir colaborador"
                            className="text-gray-300 dark:text-gray-700 hover:text-red-400 dark:hover:text-red-400 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                          <Link
                            href={`/sistema/cadastros/funcionarios/${f.id}`}
                            className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white text-xs transition-colors"
                          >
                            Editar →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={colabPage} total={list.length} onChange={setColabPage} />
            </div>
          )}
        </>
      )}

      {/* Aba: Convites */}
      {activeTab === 'convites' && (
        <>
          {loadingConvites ? (
            <div className="flex justify-center py-24">
              <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : convites.length === 0 ? (
            <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-20 text-center">
              <svg className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              <p className="text-gray-500 dark:text-gray-600">Nenhum convite gerado ainda.</p>
              <button
                onClick={() => setShowConvite(true)}
                className="mt-4 inline-block text-gold hover:text-gold/80 text-sm transition-colors"
              >
                Gerar primeiro convite →
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
              {conviteSlice.map((c, i) => {
                const status = conviteStatus(c)
                const statusStyle = {
                  ativo: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30',
                  utilizado: 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500 border-gray-200 dark:border-white/10',
                  expirado: 'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400 border-red-100 dark:border-red-900/30',
                }[status]
                const statusLabel = { ativo: 'Ativo', utilizado: 'Utilizado', expirado: 'Expirado' }[status]
                return (
                  <div
                    key={c.id}
                    className={`flex items-center gap-4 px-6 py-3.5 ${i > 0 ? 'border-t border-gray-50 dark:border-white/[0.04]' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-white text-sm font-medium leading-tight">
                        {c.nome_sugerido ?? <span className="text-gray-400 italic">Sem nome sugerido</span>}
                      </p>
                      <p className="text-gray-400 dark:text-gray-600 text-xs mt-0.5">
                        {c.cargo_sugerido && `${c.cargo_sugerido} · `}
                        {c.spress_setores?.nome && `${c.spress_setores.nome} · `}
                        {new Date(c.created_at).toLocaleDateString('pt-BR')}
                        {c.usado_em && ` · usado em ${new Date(c.usado_em).toLocaleDateString('pt-BR')}`}
                      </p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${ROLE_STYLE[c.role] ?? ROLE_STYLE.cliente}`}>
                      {ROLE_LABEL[c.role] ?? c.role}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${statusStyle}`}>
                      {statusLabel}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {status === 'ativo' && (
                        <button
                          onClick={() => handleCopiar(c.token, c.id)}
                          className="px-3 py-1.5 text-xs border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gold/40 hover:text-gold rounded-lg font-medium transition-colors flex items-center gap-1.5"
                        >
                          {copiadoId === c.id ? (
                            <>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              Copiado
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                              </svg>
                              Copiar link
                            </>
                          )}
                        </button>
                      )}
                      {status !== 'utilizado' && (
                        <button
                          onClick={() => handleCancelar(c.id)}
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
              <Pagination page={convitePage} total={convites.length} onChange={setConvitePage} />
            </div>
          )}
        </>
      )}

      {showConvite && (
        <ConviteModal
          setores={setores}
          onClose={() => { setShowConvite(false); loadConvites() }}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => {
            setDeleteTarget(null)
            setColabPage(1)
            load()
          }}
        />
      )}
    </div>
  )
}
