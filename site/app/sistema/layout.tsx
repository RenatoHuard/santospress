'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getBrowserSupabase } from '@/lib/supabase-browser'
import { getMeusRoles } from './actions/auth'
import { apenasPerfilProprio } from './lib/roles'
import { VersionBanner } from './components/VersionBanner'

export default function SistemaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    getBrowserSupabase().auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
        return
      }

      const roles = await getMeusRoles()

      // Colaboradores/atendentes/clientes têm acesso restrito
      const rotasPermitidas = [
        '/sistema/perfil',
        '/sistema/blog',
        '/sistema/cases',
        '/sistema/kanban',
        '/sistema/calendario',
        '/sistema/cadastros',
        '/sistema/cliente',
        '/sistema/noticias',
        '/sistema/imprensa',
      ]
      if (
        apenasPerfilProprio(roles) &&
        pathname !== '/sistema' &&
        !rotasPermitidas.some(r => pathname.startsWith(r))
      ) {
        router.replace('/sistema')
        return
      }

      setReady(true)
    })
  }, [router, pathname])

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-600 text-sm">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <VersionBanner />
      {children}
    </div>
  )
}
