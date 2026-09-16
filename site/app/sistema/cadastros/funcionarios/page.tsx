'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getFuncionarios, toggleFuncionarioAtivo } from '../../actions'
import { getColaboradoresPendentes, aprovarColaborador, rejeitarColaborador, getSetores } from '../../actions/convites'
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

  const [pendentes, setPendentes] = useState<Pendente[]>([])
  const [loadingPendentes, setLoadingPendentes] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const [showConvite, setShowConvite] = useState(false)
  const [setores, setSetores] = useState<Setor[]>([])

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
    getSetores().then(setSetores)
  }, [load, loadPendentes])

  async function handleToggle(id: string, current: boolean) {
    await toggleFuncionarioAtivo(id, !current)
    setList((prev) => prev.map((f) => f.id === id ? { ...f, ativo: !current } : f))
  }

  async function handleAprovar(id: string) {
    setActionId(id)
    try {
      await aprovarColaborador(id)
      setPendentes((prev) => prev.filter((p) => p.id !== id))
      load() // recarrega a lista principal
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

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 dark:text-white text-2xl font-bold">Colaboradores</h1>
          {!loading && (
            <p className="text-gray-400 dark:text-gray-600 text-sm mt-0.5">{list.length} registro{list.length !== 1 ? 's' : ''}</p>
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

      {/* Pendentes de aprovação */}
      {!loadingPendentes && pendentes.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Aguardando aprovação
            </h2>
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
              {list.map((f) => (
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
                    <Link
                      href={`/sistema/cadastros/funcionarios/${f.id}`}
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

      {showConvite && (
        <ConviteModal
          setores={setores}
          onClose={() => setShowConvite(false)}
        />
      )}
    </div>
  )
}
