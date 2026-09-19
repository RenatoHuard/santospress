'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isApp = pathname.startsWith('/sistema') || pathname.startsWith('/cliente')

  return (
    <>
      {!isApp && <Navbar />}
      {children}
      {!isApp && <Footer />}
    </>
  )
}
