'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { TopNav } from '@/app/sistema/components/TopNav'
import { getConteudoSite, salvarSecaoSite, type ConteudoSite } from '@/app/sistema/actions/site'

// ── Configuração das seções ─────────────────────────────────────────

interface Field {
  key: string
  label: string
  type: 'text' | 'textarea' | 'url'
  placeholder?: string
  span?: boolean
}

const SECTIONS = [
  { id: 'hero',     label: 'Hero',     desc: 'Primeira seção visível do site' },
  { id: 'sobre',    label: 'Sobre',    desc: 'Seção "Sobre Nós"' },
  { id: 'servicos', label: 'Serviços', desc: 'Títulos da seção de serviços' },
  { id: 'blog',     label: 'Blog',     desc: 'Cabeçalho da seção de blog' },
  { id: 'cta',      label: 'CTA',      desc: 'Seção de chamada final (rodapé)' },
]

const FIELDS: Record<string, Field[]> = {
  hero: [
    { key: 'badge',      label: 'Badge / etiqueta',           type: 'text',     placeholder: 'Santos/SP · Comunicação Integrada', span: true },
    { key: 'headline1',  label: 'Headline — linha 1',         type: 'text',     placeholder: 'Comunicação que' },
    { key: 'headline2',  label: 'Headline — linha 2 (dourada)', type: 'text',   placeholder: 'transforma marcas.' },
    { key: 'subtitulo',  label: 'Subtítulo / parágrafo',      type: 'textarea', span: true },
    { key: 'cta1_texto', label: 'Botão principal — Texto',    type: 'text' },
    { key: 'cta1_href',  label: 'Botão principal — Link',     type: 'text',     placeholder: '#servicos' },
    { key: 'cta2_texto', label: 'Botão secundário — Texto',   type: 'text' },
    { key: 'cta2_href',  label: 'Botão secundário — Link',    type: 'text',     placeholder: '#sobre' },
  ],
  sobre: [
    { key: 'badge',       label: 'Badge',           type: 'text',     placeholder: 'Sobre nós' },
    { key: 'titulo',      label: 'Título',          type: 'text',     span: true },
    { key: 'paragrafo1',  label: 'Parágrafo 1',     type: 'textarea', span: true },
    { key: 'paragrafo2',  label: 'Parágrafo 2',     type: 'textarea', span: true },
    { key: 'stat1_valor', label: 'Stat 1 — Valor',  type: 'text',     placeholder: '+10' },
    { key: 'stat1_label', label: 'Stat 1 — Rótulo', type: 'text',     placeholder: 'Anos de experiência' },
    { key: 'stat2_valor', label: 'Stat 2 — Valor',  type: 'text',     placeholder: '+80' },
    { key: 'stat2_label', label: 'Stat 2 — Rótulo', type: 'text',     placeholder: 'Clientes atendidos' },
    { key: 'stat3_valor', label: 'Stat 3 — Valor',  type: 'text',     placeholder: '+500' },
    { key: 'stat3_label', label: 'Stat 3 — Rótulo', type: 'text',     placeholder: 'Matérias publicadas' },
    { key: 'stat4_valor', label: 'Stat 4 — Valor',  type: 'text',     placeholder: '+120' },
    { key: 'stat4_label', label: 'Stat 4 — Rótulo', type: 'text',     placeholder: 'Veículos parceiros' },
  ],
  servicos: [
    { key: 'badge',  label: 'Badge',            type: 'text', placeholder: 'O que fazemos' },
    { key: 'titulo', label: 'Título da seção',  type: 'text', span: true },
  ],
  blog: [
    { key: 'badge',  label: 'Badge',            type: 'text', placeholder: 'Conteúdo' },
    { key: 'titulo', label: 'Título da seção',  type: 'text', span: true },
  ],
  cta: [
    { key: 'badge',      label: 'Badge',                   type: 'text',     placeholder: 'Fale conosco' },
    { key: 'titulo',     label: 'Título',                  type: 'text',     span: true },
    { key: 'subtitulo',  label: 'Subtítulo / parágrafo',   type: 'textarea', span: true },
    { key: 'cta1_texto', label: 'Botão principal — Texto', type: 'text' },
    { key: 'cta1_href',  label: 'Botão principal — Link',  type: 'url',      placeholder: 'mailto:...' },
    { key: 'cta2_texto', label: 'Botão secundário — Texto',type: 'text' },
    { key: 'cta2_href',  label: 'Botão secundário — Link', type: 'url',      placeholder: 'https://...' },
    { key: 'endereco',   label: 'Endereço (rodapé)',        type: 'text',     span: true },
  ],
}

// ── Estilos compartilhados ──────────────────────────────────────────

const INPUT =
  'w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/15 transition placeholder:text-gray-400 dark:placeholder:text-gray-600'

// ── Componente principal ────────────────────────────────────────────

export default function EditarSitePage() {
  const [data, setData] = useState<ConteudoSite>({})
  const [activeSection, setActiveSection] = useState('hero')
  const [savedSection, setSavedSection] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getConteudoSite().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  function getValue(secao: string, chave: string) {
    return data[secao]?.[chave] ?? ''
  }

  function setValue(secao: string, chave: string, valor: string) {
    setData((prev) => ({
      ...prev,
      [secao]: { ...(prev[secao] ?? {}), [chave]: valor },
    }))
  }

  function handleSave(secao: string) {
    startTransition(async () => {
      await salvarSecaoSite(secao, data[secao] ?? {})
      setSavedSection(secao)
      setTimeout(() => setSavedSection(null), 2500)
    })
  }

  const fields = FIELDS[activeSection] ?? []

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
      <TopNav />

      <div className="flex flex-1">
        {/* ── Sidebar ──────────────────────────────────────── */}
        <aside className="w-56 shrink-0 border-r border-gray-100 dark:border-white/5 bg-white dark:bg-[#0d0d0d] flex flex-col">
          <div className="px-4 py-5 border-b border-gray-100 dark:border-white/5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-600">
              Seções
            </p>
          </div>
          <nav className="p-3 flex-1 space-y-0.5">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                  activeSection === s.id
                    ? 'bg-gold/10 text-gold font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-gray-100 dark:border-white/5">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-2.5 text-xs text-gray-500 dark:text-gray-600 hover:text-gray-800 dark:hover:text-gray-400 border border-gray-200 dark:border-white/8 rounded-xl transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver site
            </Link>
          </div>
        </aside>

        {/* ── Main ─────────────────────────────────────────── */}
        <main className="flex-1 p-8 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {SECTIONS.find((s) => s.id === activeSection)?.label}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-0.5">
                    {SECTIONS.find((s) => s.id === activeSection)?.desc}
                  </p>
                </div>

                <button
                  onClick={() => handleSave(activeSection)}
                  disabled={isPending}
                  className="px-5 py-2.5 bg-gold text-white rounded-xl text-sm font-semibold hover:bg-gold/90 disabled:opacity-60 transition-all"
                >
                  {isPending
                    ? 'Salvando…'
                    : savedSection === activeSection
                    ? '✓ Salvo!'
                    : 'Salvar alterações'}
                </button>
              </div>

              {/* Fields */}
              <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 p-6">
                <div className="grid grid-cols-2 gap-5">
                  {fields.map((f) => (
                    <div key={f.key} className={f.span ? 'col-span-2' : ''}>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        {f.label}
                      </label>
                      {f.type === 'textarea' ? (
                        <textarea
                          className={`${INPUT} resize-y min-h-[96px]`}
                          placeholder={f.placeholder}
                          value={getValue(activeSection, f.key)}
                          onChange={(e) => setValue(activeSection, f.key, e.target.value)}
                          rows={4}
                        />
                      ) : (
                        <input
                          type={f.type}
                          className={INPUT}
                          placeholder={f.placeholder}
                          value={getValue(activeSection, f.key)}
                          onChange={(e) => setValue(activeSection, f.key, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview link */}
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-4 text-center">
                As alterações ficam visíveis no site após salvar.{' '}
                <Link href="/" target="_blank" className="underline hover:text-gold transition-colors">
                  Abrir site →
                </Link>
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
