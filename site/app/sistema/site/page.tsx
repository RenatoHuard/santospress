'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { getConteudoSite, salvarSecaoSite, salvarMvvCompleto, type ConteudoSite } from '@/app/sistema/actions/site'

// ── Configuração das seções ─────────────────────────────────────────

interface Field {
  key: string
  label: string
  type: 'text' | 'textarea' | 'url'
  placeholder?: string
  span?: boolean
  defaultValue?: string
}

const SECTIONS = [
  { id: 'hero',     label: 'Hero',     desc: 'Primeira seção visível do site' },
  { id: 'sobre',    label: 'Sobre',    desc: 'Seção "Sobre Nós"' },
  { id: 'mvv',      label: 'MVV',      desc: 'Missão, Visão e Valores (Pilares da Agência)' },
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
    { key: 'whatsapp',   label: 'WhatsApp (link wa.me)',    type: 'url',      placeholder: 'https://wa.me/55139...', span: true },
  ],
}

// ── MVV defaults (espelham os fallbacks do site público) ────────────

const MVV_DEFAULTS = {
  missao: 'Conectar marcas e pessoas por meio de estratégias de comunicação inovadoras, integradas e de vanguarda, tratando cada cliente como nosso maior ativo e gerando resultados sustentáveis que impulsionam negócios para o futuro.',
  visao:  'Ser a agência líder e referência de mercado em comunicação integrada na Baixada Santista, reconhecida pela excelência estratégica, pioneirismo e por atrair e reter os profissionais mais apaixonados do setor.',
  valores: [
    { titulo: 'Paixão e Compromisso',       descricao: 'Atuamos com brilho nos olhos, dedicação total à profissão e orgulho das histórias que ajudamos a construir.' },
    { titulo: 'Foco no Cliente',            descricao: 'O cliente é o nosso maior ativo; cuidamos de sua reputação e de seus objetivos de negócio com zelo e excelência.' },
    { titulo: 'Vanguarda e Inovação',       descricao: 'Buscamos sempre o pioneirismo no mercado de comunicação, antecipando tendências e ferramentas.' },
    { titulo: 'Meritocracia e Reconhecimento', descricao: 'Valorizamos o talento e o esforço individual e coletivo dos nossos colaboradores, garantindo que o crescimento profissional caminhe lado a lado com os resultados entregues.' },
    { titulo: 'Ética e Parceria',           descricao: 'Construímos relações transparentes, íntegras e duradouras com a equipe, clientes e a mídia.' },
  ],
}

type ValorItem = { titulo: string; descricao: string }

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

  // Estado separado para a lista de valores (MVV)
  const [missao, setMissao] = useState('')
  const [visao, setVisao] = useState('')
  const [valores, setValores] = useState<ValorItem[]>([])

  useEffect(() => {
    getConteudoSite().then((d) => {
      setData(d)

      const mvv = d.mvv ?? {}

      setMissao(mvv.missao || MVV_DEFAULTS.missao)
      setVisao(mvv.visao   || MVV_DEFAULTS.visao)

      // Lê valores existentes no banco
      const list: ValorItem[] = []
      for (let i = 1; i <= 50; i++) {
        const t = mvv[`valor${i}_titulo`]
        const desc = mvv[`valor${i}_descricao`]
        if (t === undefined && desc === undefined) break
        list.push({ titulo: t ?? '', descricao: desc ?? '' })
      }
      setValores(list.length > 0 ? list : MVV_DEFAULTS.valores)

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

  // Handlers de Valores
  function addValor() {
    setValores((prev) => [...prev, { titulo: '', descricao: '' }])
  }

  function removeValor(index: number) {
    setValores((prev) => prev.filter((_, i) => i !== index))
  }

  function updateValor(index: number, field: keyof ValorItem, value: string) {
    setValores((prev) => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }

  function handleSave(secao: string) {
    if (secao === 'mvv') {
      startTransition(async () => {
        const mvvData: Record<string, string> = { missao, visao }
        valores.forEach((v, i) => {
          mvvData[`valor${i + 1}_titulo`]    = v.titulo
          mvvData[`valor${i + 1}_descricao`] = v.descricao
        })
        await salvarMvvCompleto(mvvData)
        setSavedSection(secao)
        setTimeout(() => setSavedSection(null), 2500)
      })
      return
    }

    startTransition(async () => {
      await salvarSecaoSite(secao, data[secao] ?? {})
      setSavedSection(secao)
      setTimeout(() => setSavedSection(null), 2500)
    })
  }

  const fields = FIELDS[activeSection] ?? []

  return (
    <div className="flex flex-col h-full">
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

              {/* ── Editor MVV customizado ── */}
              {activeSection === 'mvv' ? (
                <div className="space-y-6">
                  {/* Missão */}
                  <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 p-6">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Missão
                    </label>
                    <textarea
                      className={`${INPUT} resize-y min-h-[100px]`}
                      rows={4}
                      value={missao}
                      onChange={(e) => setMissao(e.target.value)}
                    />
                  </div>

                  {/* Visão */}
                  <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 p-6">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Visão
                    </label>
                    <textarea
                      className={`${INPUT} resize-y min-h-[100px]`}
                      rows={4}
                      value={visao}
                      onChange={(e) => setVisao(e.target.value)}
                    />
                  </div>

                  {/* Valores */}
                  <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Valores ({valores.length})
                      </p>
                      <button
                        type="button"
                        onClick={addValor}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gold hover:text-gold/80 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Adicionar valor
                      </button>
                    </div>

                    <div className="space-y-5">
                      {valores.map((v, i) => (
                        <div
                          key={i}
                          className="relative border border-gray-100 dark:border-white/8 rounded-xl p-5 group"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-bold text-gold/60 w-5 shrink-0">{i + 1}</span>
                            <input
                              type="text"
                              className={INPUT}
                              placeholder="Título do valor"
                              value={v.titulo}
                              onChange={(e) => updateValor(i, 'titulo', e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => removeValor(i)}
                              title="Remover valor"
                              className="shrink-0 p-1.5 text-gray-300 dark:text-gray-700 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <textarea
                            className={`${INPUT} resize-y min-h-[72px]`}
                            rows={3}
                            placeholder="Descrição do valor"
                            value={v.descricao}
                            onChange={(e) => updateValor(i, 'descricao', e.target.value)}
                          />
                        </div>
                      ))}

                      {valores.length === 0 && (
                        <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-6">
                          Nenhum valor cadastrado. Clique em &ldquo;Adicionar valor&rdquo; para começar.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Editor genérico para as demais seções ── */
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
                            placeholder={f.placeholder ?? f.defaultValue}
                            value={getValue(activeSection, f.key) || f.defaultValue || ''}
                            onChange={(e) => setValue(activeSection, f.key, e.target.value)}
                            rows={4}
                          />
                        ) : (
                          <input
                            type={f.type}
                            className={INPUT}
                            placeholder={f.placeholder ?? f.defaultValue}
                            value={getValue(activeSection, f.key) || f.defaultValue || ''}
                            onChange={(e) => setValue(activeSection, f.key, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
