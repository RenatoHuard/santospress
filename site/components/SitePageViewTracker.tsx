'use client'

import { useEffect } from 'react'
import { registrarVisitaSite } from '@/app/sistema/actions/site'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  const key = 'sp_session'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export function SitePageViewTracker({ path }: { path: string }) {
  useEffect(() => {
    const sessionId = getSessionId()
    registrarVisitaSite(path, sessionId, document.referrer, navigator.userAgent).catch(() => {})
  }, [path])

  return null
}
