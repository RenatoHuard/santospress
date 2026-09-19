'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { getClienteDashboard, type ClienteDashboard, type Contato } from './actions'

function tempoParcerias(createdAt: string): string {
  const inicio = new Date(createdAt)
  const agora = new Date()
  const meses =
    (agora.getFullYear() - inicio.getFullYear()) * 12 +
    (agora.getMonth() - inicio.getMonth())
  if (meses < 1) return 'Menos de 1 mês'
  if (meses < 12) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`
  const anos = Math.floor(meses / 12)
  const resto = meses % 12
  if (resto === 0) return `${anos} ${anos === 1 ? 'ano' : 'anos'}`
  return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${resto} ${resto === 1 ? 'mês' : 'meses'}`
}

function MetricaCard({
  valor,
  label,
  sub,
  icon,
  accent,
}: {
  valor: string | number
  label: string
  sub?: string
  icon: React.ReactNode
  accent?: string
}) {
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-6 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent ?? 'bg-navy/10 dark:bg-white/5'}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{valor}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function ContatoCard({ contato }: { contato: Contato }) {
  const iniciais = contato.nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase()

  const label = contato.tipo === 'atendente'
    ? 'Atendente da conta'
    : contato.cargo_equipe ?? 'Líder de equipe'

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-xl">
      {contato.foto_url ? (
        <Image
          src={contato.foto_url}
          alt={contato.nome}
          width={44}
          height={44}
          className="w-11 h-11 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-11 h-11 rounded-full bg-navy dark:bg-gold/20 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-white dark:text-gold">{iniciais}</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{contato.nome}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
        {contato.cargo && <p className="text-xs text-gray-400 dark:text-gray-600">{contato.cargo}</p>}
      </div>
      {contato.email && (
        <a
          href={`mailto:${contato.email}`}
          className="shrink-0 w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/40 transition-colors"
          title={contato.email}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </a>
      )}
    </div>
  )
}

const STATUS_CLS: Record<string, string> = {
  ativo:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  inativo:  'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400',
  suspenso: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

export default function ClienteDashboardPage() {
  const router = useRouter()
  const [dashboard, setDashboard] = useState<ClienteDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/login'); return }
      const d = await getClienteDashboard(user.id)
      if (!d) { router.replace('/login'); return }
      setDashboard(d)
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!dashboard) return null

  const { nome, razao_social, status, created_at, metricas, contatos } = dashboard
  const total = metricas.atendidas + metricas.emAndamento

  return (
    <div className="space-y-8">

      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-gray-400 dark:text-gray-500">Bem-vindo,</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-0.5">{nome}</h1>
          {razao_social && razao_social !== nome && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{razao_social}</p>
          )}
        </div>
        {status && (
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full self-start mt-1 ${STATUS_CLS[status] ?? STATUS_CLS.inativo}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>

      {/* Métricas */}
      <div className="grid sm:grid-cols-3 gap-4">
        <MetricaCard
          valor={tempoParcerias(created_at)}
          label="Tempo de parceria"
          sub={`Desde ${new Date(created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}
          accent="bg-navy/10 dark:bg-navy/30"
          icon={
            <svg className="w-5 h-5 text-navy dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
        />
        <MetricaCard
          valor={metricas.atendidas}
          label="Solicitações atendidas"
          sub={total > 0 ? `${Math.round((metricas.atendidas / total) * 100)}% do total` : undefined}
          accent="bg-emerald-100 dark:bg-emerald-900/30"
          icon={
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricaCard
          valor={metricas.emAndamento}
          label="Em andamento"
          sub="Demandas abertas"
          accent="bg-gold/10 dark:bg-gold/10"
          icon={
            <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Ações rápidas */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/cliente/demanda"
          className="group bg-gold hover:bg-gold/90 text-white rounded-2xl p-6 flex items-center justify-between transition-colors"
        >
          <div>
            <p className="text-base font-bold">Nova Demanda</p>
            <p className="text-sm text-white/70 mt-0.5">Envie uma solicitação para nossa equipe</p>
          </div>
          <svg className="w-6 h-6 opacity-80 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </Link>
        <Link
          href="/cliente/cadastro"
          className="group bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-6 flex items-center justify-between hover:border-gold/30 transition-colors"
        >
          <div>
            <p className="text-base font-bold text-gray-900 dark:text-white">Atualizar Cadastro</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Mantenha seus dados sempre atualizados</p>
          </div>
          <svg className="w-6 h-6 text-gray-300 dark:text-gray-600 group-hover:text-gold group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      {/* Contatos */}
      {contatos.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
            Seus Contatos na Santos Press
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {contatos.map(c => <ContatoCard key={c.id} contato={c} />)}
          </div>
        </div>
      )}

      {contatos.length === 0 && (
        <div className="bg-gold/5 dark:bg-gold/10 border border-gold/20 rounded-2xl p-6 flex items-start gap-4">
          <svg className="w-5 h-5 text-gold shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Equipe sendo configurada</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Sua equipe de atendimento será exibida aqui assim que for designada.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
