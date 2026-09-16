'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { checkUserType, getMeuRole } from '@/app/sistema/actions/auth'

export default function LoginPage() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const googleHandledRef = useRef(false)

  const logoSrc = mounted && resolvedTheme === 'dark'
    ? '/images/Logo_santospress_horizontal_negativo.png'
    : '/images/Logo_santospress_horizontal.png'

  useEffect(() => {
    setMounted(true)

    const pending = sessionStorage.getItem('google_login_pending')
    if (!pending) return

    async function processSession(userId: string) {
      if (googleHandledRef.current) return
      googleHandledRef.current = true
      sessionStorage.removeItem('google_login_pending')
      setGoogleLoading(true)
      try {
        const tipo = await checkUserType(userId)
        if (tipo === 'unknown') {
          await supabase.auth.signOut()
          setError('Acesso não autorizado. Contacte o administrador.')
          setGoogleLoading(false)
          googleHandledRef.current = false
          return
        }
        if (tipo === 'cliente') { router.push('/cliente'); return }
        const role = await getMeuRole(userId)
        router.push(role === 'atendente' ? '/sistema/perfil' : '/sistema')
      } catch {
        router.push('/sistema')
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) processSession(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) processSession(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [router])

  async function handleGoogleLogin() {
    setError(null)
    setGoogleLoading(true)
    sessionStorage.setItem('google_login_pending', '1')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/login` },
    })
  }

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
      if (tipo === 'cliente') { router.push('/cliente'); return }
      const role = await getMeuRole(userId)
      router.push(role === 'atendente' ? '/sistema/perfil' : '/sistema')
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

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mb-5"
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {googleLoading ? 'Aguardando...' : 'Entrar com Google'}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
            <span className="text-xs text-gray-400 dark:text-gray-600">ou entre com e-mail</span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
          </div>

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
              disabled={loading || googleLoading}
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
