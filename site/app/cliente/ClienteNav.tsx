'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const TABS = [
  { label: 'Dashboard',    href: '/cliente' },
  { label: 'Meu Cadastro', href: '/cliente/cadastro' },
  { label: 'Nova Demanda', href: '/cliente/demanda' },
]

export function ClienteNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#111]">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
        <div className="flex">
          {TABS.map(t => {
            const active = t.href === '/cliente' ? pathname === '/cliente' : pathname.startsWith(t.href)
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  active
                    ? 'border-gold text-gold'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {t.label}
              </Link>
            )
          })}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors py-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Sair
        </button>
      </div>
    </nav>
  )
}
