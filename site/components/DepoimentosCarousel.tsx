'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import type { DepoimentoPublico } from '@/app/sistema/actions/depoimentos'

export function DepoimentosCarousel({ depoimentos }: { depoimentos: DepoimentoPublico[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(depoimentos.length > 1)

  function onScroll() {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 8)
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }

  function scroll(dir: 'prev' | 'next') {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-dep-card]')
    const gap = 24
    const step = (card?.offsetWidth ?? 340) + gap
    el.scrollBy({ left: dir === 'next' ? step : -step, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {/* Track */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {depoimentos.map((dep) => {
          const empresa = dep.cliente?.nome_fantasia ?? dep.cliente?.razao_social ?? ''
          const iniciais = empresa.charAt(0).toUpperCase()
          return (
            <div
              key={dep.id}
              data-dep-card
              className="snap-start shrink-0 w-[85vw] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-7 border border-gray-100 dark:border-white/5 flex flex-col"
            >
              <svg className="w-6 h-6 text-gold/40 mb-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1 italic">
                &ldquo;{dep.texto}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-white/6">
                {dep.foto_url ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <Image src={dep.foto_url} alt={dep.autor_nome} fill className="object-cover" sizes="40px" />
                  </div>
                ) : dep.cliente?.logo_url ? (
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-white/5">
                    <Image src={dep.cliente.logo_url} alt={empresa} fill className="object-contain p-1" sizes="40px" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/70 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {iniciais}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{dep.autor_nome}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                    {dep.autor_cargo ? `${dep.autor_cargo} · ` : ''}{empresa}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Botões prev / next */}
      <button
        onClick={() => scroll('prev')}
        disabled={!canPrev}
        aria-label="Anterior"
        className="absolute -left-5 top-1/2 -translate-y-1/2 hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 shadow-md text-gray-500 dark:text-gray-400 hover:text-gold dark:hover:text-gold hover:border-gold/40 transition-all disabled:opacity-0 disabled:pointer-events-none"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => scroll('next')}
        disabled={!canNext}
        aria-label="Próximo"
        className="absolute -right-5 top-1/2 -translate-y-1/2 hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 shadow-md text-gray-500 dark:text-gray-400 hover:text-gold dark:hover:text-gold hover:border-gold/40 transition-all disabled:opacity-0 disabled:pointer-events-none"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
