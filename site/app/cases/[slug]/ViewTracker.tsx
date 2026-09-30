'use client'

import { useEffect } from 'react'
import { registrarVisita } from '@/app/sistema/actions/blog'

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

export function ViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    const sessionId = getSessionId()
    const referrer  = document.referrer
    const ua        = navigator.userAgent
    registrarVisita(postId, sessionId, referrer, ua).catch(() => {})
  }, [postId])

  return null
}
