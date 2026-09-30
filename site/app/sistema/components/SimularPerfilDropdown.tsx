'use client'

import { useState, useEffect, useRef } from 'react'
import { ROLES_SIMULAVEIS, getSimulatedRole, setSimulatedRole } from '../lib/simulador'

export function SimularPerfilDropdown() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrent(getSimulatedRole())
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function switchRole(key: string) {
    setSimulatedRole(key === 'admin' ? null : key)
    setOpen(false)
    window.location.href = '/sistema'
  }

  const activeKey = current ?? 'admin'
  const activeRole = ROLES_SIMULAVEIS.find(r => r.key === activeKey)!
  const isSimulating = !!current

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title="Alternar visualização de perfil"
        className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 transition-colors ${
          isSimulating
            ? 'border-amber-400/60 text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'
            : 'border-gray-200 dark:border-white/8 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
        }`}
      >
        {isSimulating && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
        )}
        <span className="hidden sm:inline">
          {isSimulating ? `👁 ${activeRole.label}` : 'Alternar user'}
        </span>
        <span className="sm:hidden">
          {isSimulating ? `👁 ${activeRole.label}` : '👁'}
        </span>
        <svg className="w-3 h-3 opacity-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/8 rounded-xl shadow-lg py-1.5 z-50">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 px-3 pt-1.5 pb-2">
            Simular perfil
          </p>
          {ROLES_SIMULAVEIS.map(r => {
            const isActive = activeKey === r.key
            return (
              <button
                key={r.key}
                onClick={() => switchRole(r.key)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
                  isActive ? 'font-semibold' : ''
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-gold' : 'bg-transparent'}`} />
                <span className={r.cor}>{r.label}</span>
                {r.key === 'admin' && (
                  <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-600">real</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
