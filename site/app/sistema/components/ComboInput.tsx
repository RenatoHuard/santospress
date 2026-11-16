'use client'

import { useEffect, useRef, useState } from 'react'

interface ComboInputProps {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
  className?: string
}

export function ComboInput({ value, onChange, options, placeholder, className }: ComboInputProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [cursor, setCursor] = useState(-1)

  // Sincroniza query quando value muda externamente (ex: resetar form)
  useEffect(() => { setQuery(value) }, [value])

  // Fecha ao clicar fora
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        // Se saiu sem selecionar, mantém o que estava digitado como valor livre
        if (query !== value) onChange(query)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [query, value, onChange])

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
  const queryTrimmed = query.trim()
  const isNovo = queryTrimmed.length > 0 && !options.some(o => o.toLowerCase() === queryTrimmed.toLowerCase())

  // Lista exibida: opções filtradas + (opcional) "Adicionar: X"
  const listaTotal = isNovo ? [...filtered, `__novo__${queryTrimmed}`] : filtered

  function select(item: string) {
    if (item.startsWith('__novo__')) {
      const val = item.replace('__novo__', '')
      setQuery(val)
      onChange(val)
    } else {
      setQuery(item)
      onChange(item)
    }
    setOpen(false)
    setCursor(-1)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setOpen(true)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor(c => Math.min(c + 1, listaTotal.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor(c => Math.max(c - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (cursor >= 0 && cursor < listaTotal.length) {
        select(listaTotal[cursor])
      } else if (queryTrimmed) {
        // Enter sem cursor seleciona o valor digitado livremente
        onChange(queryTrimmed)
        setOpen(false)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const baseInput = className ?? 'w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition'

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={placeholder}
          className={baseInput + ' pr-8'}
          onFocus={() => setOpen(true)}
          onChange={e => {
            setQuery(e.target.value)
            onChange(e.target.value)
            setOpen(true)
            setCursor(-1)
          }}
          onKeyDown={handleKey}
          autoComplete="off"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => { setOpen(o => !o); inputRef.current?.focus() }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {open && (filtered.length > 0 || isNovo) && (
        <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {filtered.map((opt, i) => (
            <li
              key={opt}
              onMouseDown={() => select(opt)}
              onMouseEnter={() => setCursor(i)}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${cursor === i ? 'bg-gold/10 text-gold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
              {opt}
            </li>
          ))}
          {isNovo && (
            <li
              onMouseDown={() => select(`__novo__${queryTrimmed}`)}
              onMouseEnter={() => setCursor(filtered.length)}
              className={`px-3 py-2 text-sm cursor-pointer border-t border-gray-100 dark:border-white/5 transition-colors flex items-center gap-2 ${cursor === filtered.length ? 'bg-gold/10 text-gold' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Adicionar <strong className="text-gray-700 dark:text-gray-200">"{queryTrimmed}"</strong></span>
            </li>
          )}
        </ul>
      )}

      {open && filtered.length === 0 && !isNovo && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg px-3 py-2 text-xs text-gray-400">
          Digite para adicionar um novo valor
        </div>
      )}
    </div>
  )
}
