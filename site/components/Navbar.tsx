'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const logoSrc = mounted && resolvedTheme === 'dark'
    ? '/images/Logo_santospress_horizontal_negativo.png'
    : '/images/Logo_santospress_horizontal.png'

  return (
    <nav className="bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src={logoSrc}
              alt="Santos Press Comunicação Integrada"
              width={220}
              height={66}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-navy dark:hover:text-white font-medium transition-colors text-sm">
              Home
            </Link>
            <Link href="/noticias" className="text-gray-600 dark:text-gray-400 hover:text-navy dark:hover:text-white font-medium transition-colors text-sm">
              Notícias
            </Link>
            <Link href="/equipe" className="text-gray-600 dark:text-gray-400 hover:text-navy dark:hover:text-white font-medium transition-colors text-sm">
              Equipe
            </Link>
            <ThemeToggle />
            <Link
              href="/login"
              className="bg-navy text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-gold transition-colors"
            >
              Área Logada
            </Link>
          </div>

          {/* Mobile buttons */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 text-gray-600 dark:text-gray-400"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#111111] px-4 py-5 flex flex-col gap-4">
          <Link href="/" onClick={() => setOpen(false)} className="text-gray-700 dark:text-gray-300 font-medium">Home</Link>
          <Link href="/noticias" onClick={() => setOpen(false)} className="text-gray-700 dark:text-gray-300 font-medium">Notícias</Link>
          <Link href="/equipe" onClick={() => setOpen(false)} className="text-gray-700 dark:text-gray-300 font-medium">Equipe</Link>
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="bg-navy text-white px-5 py-2.5 rounded-full font-semibold text-center text-sm"
          >
            Área Logada
          </Link>
        </div>
      )}
    </nav>
  )
}
