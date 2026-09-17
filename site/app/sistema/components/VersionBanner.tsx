'use client'

import { useEffect, useState } from 'react'

const POLL_INTERVAL_MS = 5 * 60 * 1000 // 5 minutos
const CURRENT_VERSION  = process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_ID ?? 'dev'

export function VersionBanner() {
  const [outdated, setOutdated] = useState(false)

  useEffect(() => {
    // Sem sentido checar em dev local
    if (CURRENT_VERSION === 'dev') return

    async function check() {
      try {
        const res  = await fetch('/api/version', { cache: 'no-store' })
        const data = await res.json()
        if (data.version && data.version !== CURRENT_VERSION) setOutdated(true)
      } catch {
        // falha silenciosa — não incomoda o usuário
      }
    }

    const id = setInterval(check, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  if (!outdated) return null

  return (
    <div className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-between gap-4 px-5 py-3 bg-navy text-white shadow-2xl border-b-2 border-gold">
      <div className="flex items-center gap-3 min-w-0">
        <span className="shrink-0 w-2 h-2 rounded-full bg-gold animate-pulse" />
        <p className="text-sm font-medium truncate">
          Uma nova versão do sistema está disponível.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="shrink-0 bg-gold hover:bg-gold/90 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors whitespace-nowrap"
      >
        Atualizar agora
      </button>
    </div>
  )
}
