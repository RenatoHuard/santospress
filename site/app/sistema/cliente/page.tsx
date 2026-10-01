'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getClientePortalData } from '@/app/sistema/actions/auth'
import { TopNav } from '@/app/sistema/components/TopNav'

type ClienteData = {
  id: string
  razao_social: string
  nome_fantasia: string | null
  cnpj: string | null
  segmento: string | null
  status: string
  email: string | null
  telefone: string | null
  cidade: string | null
  uf: string | null
}

function formatCNPJ(v: string | null) {
  if (!v) return '—'
  const d = v.replace(/\D/g, '')
  if (d.length !== 14) return v
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}

export default function ClientePortalPage() {
  const router = useRouter()
  const [cliente, setCliente] = useState<ClienteData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/login'); return }
      const data = await getClientePortalData(user.id)
      if (!data) { router.replace('/sistema'); return }
      setCliente(data as ClienteData)
      setLoading(false)
    })
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!cliente) return null

  const nome = cliente.nome_fantasia ?? cliente.razao_social

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <TopNav />

      <main className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/30 to-gold/70 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{nome}</h1>
              {cliente.nome_fantasia && (
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{cliente.razao_social}</p>
              )}
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {cliente.status.charAt(0).toUpperCase() + cliente.status.slice(1)}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>

        {/* Dados da empresa */}
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-50 dark:border-white/[0.04]">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Dados da Empresa</h2>
          </div>

          <div className="grid grid-cols-2 gap-0">
            {[
              { label: 'CNPJ',      value: formatCNPJ(cliente.cnpj) },
              { label: 'Segmento',  value: cliente.segmento ?? '—' },
              { label: 'E-mail',    value: cliente.email ?? '—' },
              { label: 'Telefone',  value: cliente.telefone ?? '—' },
              { label: 'Cidade',    value: cliente.cidade ? `${cliente.cidade}${cliente.uf ? ` / ${cliente.uf}` : ''}` : '—' },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`px-6 py-4 ${i % 2 === 0 ? 'border-r border-gray-50 dark:border-white/[0.04]' : ''} border-b border-gray-50 dark:border-white/[0.04] last:border-b-0`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">
                  {item.label}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Releases e Relatórios */}
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-6 text-center mb-4">
          <svg className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
          </svg>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-500">Releases e Relatórios</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
            Em breve você verá aqui os releases publicados pela Santos Press sobre sua empresa.
          </p>
        </div>

        {/* Depoimento */}
        <Link
          href="/sistema/cliente/depoimento"
          className="flex items-center gap-4 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-6 hover:border-gold/40 hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
            <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-gold transition-colors">
              Registrar Depoimento
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Compartilhe sua experiência — após aprovação, aparece no nosso site
            </p>
          </div>
          <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </main>
    </div>
  )
}
