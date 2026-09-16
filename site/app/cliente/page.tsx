'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getClientePortalData } from '@/app/sistema/actions/auth'

type ClienteData = {
  id: string
  razao_social: string | null
  nome_fantasia: string | null
  cnpj: string | null
  segmento: string | null
  status: string | null
  email: string | null
  telefone: string | null
  cidade: string | null
  uf: string | null
}

const STATUS_LABEL: Record<string, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  suspenso: 'Suspenso',
}

const STATUS_CLS: Record<string, string> = {
  ativo:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  inativo:   'bg-gray-100 text-gray-500 dark:bg-white/5',
  suspenso:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

export default function ClientePortalPage() {
  const router = useRouter()
  const [cliente, setCliente] = useState<ClienteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      try {
        const data = await getClientePortalData(user.id)
        if (!data) { router.replace('/login'); return }
        setCliente(data)
      } catch {
        setError('Não foi possível carregar os dados. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-2xl p-8 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button onClick={handleLogout} className="mt-4 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
          Sair
        </button>
      </div>
    )
  }

  if (!cliente) return null

  const nome = cliente.nome_fantasia || cliente.razao_social || 'Cliente'

  return (
    <div className="space-y-8">
      {/* Cabeçalho de boas-vindas */}
      <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-1">Bem-vindo,</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{nome}</h1>
          {cliente.razao_social && cliente.nome_fantasia && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{cliente.razao_social}</p>
          )}
          {cliente.status && (
            <span className={`mt-3 inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CLS[cliente.status] ?? STATUS_CLS.inativo}`}>
              {STATUS_LABEL[cliente.status] ?? cliente.status}
            </span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="shrink-0 flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-white border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Sair
        </button>
      </div>

      {/* Informações da empresa */}
      <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-8">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-5">
          Dados Cadastrais
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {[
            { label: 'CNPJ',      value: cliente.cnpj },
            { label: 'Segmento',  value: cliente.segmento },
            { label: 'E-mail',    value: cliente.email },
            { label: 'Telefone',  value: cliente.telefone },
            { label: 'Cidade',    value: cliente.cidade && cliente.uf ? `${cliente.cidade} / ${cliente.uf}` : (cliente.cidade ?? null) },
          ].filter(f => f.value).map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
              <p className="text-sm text-gray-800 dark:text-gray-200">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Aviso de atendimento */}
      <div className="bg-gold/5 dark:bg-gold/10 border border-gold/20 rounded-2xl p-6 flex items-start gap-4">
        <svg className="w-5 h-5 text-gold shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Fale com nosso atendimento</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Entre em contato com sua equipe de atendimento da Santos Press para demandas, aprovações e atualizações de projetos.
          </p>
        </div>
      </div>
    </div>
  )
}
