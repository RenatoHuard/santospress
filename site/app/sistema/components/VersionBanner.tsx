'use client'

import { useEffect, useState, useRef } from 'react'

const POLL_INTERVAL_MS = 5 * 60 * 1000 // 5 minutos

async function fetchVersion(): Promise<string | null> {
  try {
    const res = await fetch('/api/version', { cache: 'no-store' })
    const data = await res.json()
    return data.version ?? null
  } catch {
    return null
  }
}

export function VersionBanner() {
  const [outdated, setOutdated] = useState(false)
  const initialVersion = useRef<string | null>(null)

  useEffect(() => {
    // Carrega a versão atual ao montar — serve como baseline
    fetchVersion().then(v => {
      if (v && v !== 'dev') initialVersion.current = v
    })

    const id = setInterval(async () => {
      if (!initialVersion.current) return
      const v = await fetchVersion()
      if (v && v !== initialVersion.current) setOutdated(true)
    }, POLL_INTERVAL_MS)

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
