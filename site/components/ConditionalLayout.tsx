'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isSistema = pathname.startsWith('/sistema')

  return (
    <>
      {!isSistema && <Navbar />}
      {children}
      {!isSistema && <Footer />}
    </>
  )
}
