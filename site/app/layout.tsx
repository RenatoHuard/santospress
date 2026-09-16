import type { Metadata } from 'next'
import { Lato } from 'next/font/google'
import './globals.css'
import { ConditionalLayout } from '@/components/ConditionalLayout'
import { ThemeProvider } from '@/components/ThemeProvider'

const lato = Lato({
  weight: ['300', '400', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-lato',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Santos Press Comunicação Integrada | Santos/SP',
  description:
    'Agência de comunicação integrada em Santos/SP. Assessoria de imprensa, social media, marketing e muito mais para posicionar sua marca com inteligência.',
  openGraph: {
    title: 'Santos Press Comunicação Integrada',
    description: 'Posicionamento estratégico junto à mídia. Santos/SP.',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={lato.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
