'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { supabase } from '@/lib/supabase'
import { ThemeToggle } from '@/components/ThemeToggle'
import { getMeuRole } from '../actions/auth'
import type { User } from '@supabase/supabase-js'

export function TopNav() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [homeHref, setHomeHref] = useState('/sistema')

  useEffect(() => {
    setMounted(true)
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        const role = await getMeuRole(data.user.id)
        if (role === 'atendente') setHomeHref('/sistema/perfil')
      }
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const logoSrc = mounted && resolvedTheme === 'dark'
    ? '/images/Logo_santospress_horizontal_negativo.png'
    : '/images/Logo_santospress_horizontal.png'

  return (
    <header className="h-14 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#0d0d0d] flex items-center px-6 gap-4 shrink-0">
      <Link href={homeHref} className="flex items-center">
        <Image
          src={logoSrc}
          alt="Santos Press"
          width={130}
          height={40}
          className="h-7 w-auto"
        />
      </Link>

      <span className="text-gray-200 dark:text-white/10 select-none">|</span>
      <span className="text-gray-400 dark:text-gray-600 text-xs uppercase tracking-widest">Painel</span>

      <div className="ml-auto flex items-center gap-4">
        {user && (
          <span className="text-gray-400 dark:text-gray-600 text-xs hidden sm:block">{user.email}</span>
        )}
        <ThemeToggle className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-white transition-colors" />
        <Link
          href="/sistema/perfil"
          className="text-gray-500 hover:text-gray-800 dark:text-gray-600 dark:hover:text-gray-400 text-xs border border-gray-200 dark:border-white/8 rounded-lg px-3 py-1.5 transition-colors hidden sm:block"
        >
          Meus Dados
        </Link>
        <Link
          href="/"
          target="_blank"
          className="text-gray-500 hover:text-gray-800 dark:text-gray-600 dark:hover:text-gray-400 text-xs border border-gray-200 dark:border-white/8 rounded-lg px-3 py-1.5 transition-colors"
        >
          Ver site →
        </Link>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white text-sm transition-colors"
        >
          Sair
        </button>
      </div>
    </header>
  )
}
