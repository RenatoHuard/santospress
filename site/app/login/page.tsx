'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { checkUserType } from '@/app/sistema/actions/auth'

export default function LoginPage() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => setMounted(true), [])

  const logoSrc = mounted && resolvedTheme === 'dark'
    ? '/images/Logo_santospress_horizontal_negativo.png'
    : '/images/Logo_santospress_horizontal.png'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-mail ou senha inválidos. Tente novamente.')
      setLoading(false)
      return
    }

    const userId = signInData.user?.id
    if (!userId) { router.push('/sistema'); return }

    try {
      const tipo = await checkUserType(userId)
      if (tipo === 'unknown') {
        await supabase.auth.signOut()
        setError('Acesso não autorizado. Contacte o administrador.')
        setLoading(false)
        return
      }
      router.push(tipo === 'cliente' ? '/cliente' : '/sistema')
    } catch {
      router.push('/sistema')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#111111] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src={logoSrc}
              alt="Santos Press Comunicação Integrada"
              width={220}
              height={66}
              className="h-12 w-auto mx-auto"
            />
          </Link>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">Acesso para equipe interna e clientes</p>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5 p-8">
          <h1 className="text-2xl font-bold text-navy dark:text-white mb-7">Entrar</h1>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 dark:bg-red-950/50 rounded-xl px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-white py-3 rounded-xl font-semibold hover:bg-gold/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          <Link href="/" className="hover:text-navy dark:hover:text-white transition-colors">
            ← Voltar ao site
          </Link>
        </p>
      </div>
    </main>
  )
}
