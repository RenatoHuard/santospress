'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getDashboardStats } from './actions'
import { getMeusRoles } from './actions/auth'
import { getMenuPermissions } from './actions/menu-permissions'
import { podeAcessarAdmin, apenasPerfilProprio, isCliente } from './lib/roles'
import { getEffectiveRoles } from './lib/simulador'
import { TopNav } from './components/TopNav'
import { RadialMenu } from './components/RadialMenu'
import { MeuMenuRadial } from './components/MeuMenuRadial'
import { NotificacoesDepoimentos } from './components/NotificacoesDepoimentos'

interface Stats {
  clientesAtivos: number
  funcionariosAtivos: number
  configured: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [roles, setRoles] = useState<string[] | null>(null)
  const [stats, setStats] = useState<Stats>({ clientesAtivos: 0, funcionariosAtivos: 0, configured: true })
  const [menuPerms, setMenuPerms] = useState<Set<string> | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const realRoles = await getMeusRoles(user.id)
      const r = getEffectiveRoles(realRoles)
      if (isCliente(r)) {
        // Admins simulando 'cliente' não têm entrada em spress_clientes — mostra placeholder
        if (!realRoles.includes('admin')) {
          router.replace('/sistema/cliente')
          return
        }
      }
      setRoles(r)
      if (podeAcessarAdmin(r)) {
        getDashboardStats().then(setStats)
      } else if (!isCliente(r)) {
        getMenuPermissions(r[0]).then(ids => setMenuPerms(new Set(ids)))
      }
    })
  }, [router])

  const isAdminPanel = roles !== null && podeAcessarAdmin(roles)
  const isPersonal   = roles !== null && apenasPerfilProprio(roles)

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />

      {isAdminPanel && <NotificacoesDepoimentos />}

      {isAdminPanel && !stats.configured && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800/30 px-6 py-2.5 text-amber-700 dark:text-amber-400/90 text-xs text-center">
          Configure{' '}
          <code className="font-mono bg-amber-100 dark:bg-black/30 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code>
          {' '}no <code className="font-mono">.env.local</code> para ativar os dados reais.{' '}
          <span className="text-amber-500 dark:text-amber-600">Supabase → Settings → API → service_role</span>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-10">
        {roles === null ? (
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        ) : isAdminPanel ? (
          <>
            <p className="text-gray-400 dark:text-gray-700 text-[10px] uppercase tracking-[0.25em] font-medium">
              Painel Administrativo
            </p>
            <div className="flex gap-4">
              <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none rounded-2xl px-10 py-5 text-center min-w-[160px]">
                <p className="text-5xl font-bold text-gold tabular-nums">{stats.clientesAtivos}</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 uppercase tracking-widest">Clientes Ativos</p>
              </div>
              <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none rounded-2xl px-10 py-5 text-center min-w-[160px]">
                <p className="text-5xl font-bold text-gold tabular-nums">{stats.funcionariosAtivos}</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 uppercase tracking-widest">Colaboradores Ativos</p>
              </div>
            </div>
            <RadialMenu />
          </>
        ) : isCliente(roles) ? (
          <>
            <p className="text-gray-400 dark:text-gray-700 text-[10px] uppercase tracking-[0.25em] font-medium">
              Simulação: Portal do Cliente
            </p>
            <div className="bg-white dark:bg-[#111] border border-amber-100 dark:border-amber-800/20 rounded-2xl px-10 py-8 text-center max-w-md">
              <svg className="w-12 h-12 text-amber-300 dark:text-amber-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Portal do Cliente</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed">
                A área do cliente exige uma conta real cadastrada em{' '}
                <code className="text-xs bg-gray-100 dark:bg-white/10 px-1 rounded">spress_clientes</code>.
                Para visualizar, acesse com um login de cliente.
              </p>
            </div>
          </>
        ) : isPersonal ? (
          <>
            <p className="text-gray-400 dark:text-gray-700 text-[10px] uppercase tracking-[0.25em] font-medium">
              Área Pessoal
            </p>
            <MeuMenuRadial enabledIds={menuPerms} />
          </>
        ) : (
          /* gestor, rh sem admin — futuramente terão menu próprio */
          <>
            <p className="text-gray-400 dark:text-gray-700 text-[10px] uppercase tracking-[0.25em] font-medium">
              Área Pessoal
            </p>
            <MeuMenuRadial enabledIds={menuPerms} />
          </>
        )}
      </main>
    </div>
  )
}
