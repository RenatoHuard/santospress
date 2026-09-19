import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ClienteNav } from './ClienteNav'

export const metadata = { title: 'Portal do Cliente | Santos Press' }

export default function ClienteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col">
      <header className="bg-white dark:bg-[#111] border-b border-gray-100 dark:border-white/5 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/cliente">
            <Image
              src="/images/Logo_santospress_horizontal.png"
              alt="Santos Press"
              width={160}
              height={48}
              className="h-9 w-auto"
            />
          </Link>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-widest">
            Portal do Cliente
          </span>
        </div>
      </header>

      <ClienteNav />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {children}
      </main>

      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100 dark:border-white/5">
        Santos Press Comunicação Integrada &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
