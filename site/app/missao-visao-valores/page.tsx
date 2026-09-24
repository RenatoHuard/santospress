import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Missão, Visão e Valores | Santos Press',
  description: 'Conheça os pilares que guiam a Santos Press: nossa missão, visão de futuro e os valores que orientam cada decisão.',
}

type SiteContent = Record<string, Record<string, string>>

async function getSiteContent(): Promise<SiteContent> {
  const { data } = await supabase.from('spress_conteudo_site').select('secao, chave, valor')
  const result: SiteContent = {}
  for (const row of data ?? []) {
    if (!result[row.secao]) result[row.secao] = {}
    result[row.secao][row.chave] = row.valor ?? ''
  }
  return result
}

function g(c: SiteContent, secao: string, chave: string, fallback: string): string {
  return c[secao]?.[chave] || fallback
}

const VALORES_DEFAULTS = [
  { tituloKey: 'valor1_titulo', descKey: 'valor1_descricao', tituloFallback: 'Paixão e Compromisso', descFallback: 'Atuamos com brilho nos olhos, dedicação total à profissão e orgulho das histórias que ajudamos a construir.' },
  { tituloKey: 'valor2_titulo', descKey: 'valor2_descricao', tituloFallback: 'Foco no Cliente', descFallback: 'O cliente é o nosso maior ativo; cuidamos de sua reputação e de seus objetivos de negócio com zelo e excelência.' },
  { tituloKey: 'valor3_titulo', descKey: 'valor3_descricao', tituloFallback: 'Vanguarda e Inovação', descFallback: 'Buscamos sempre o pioneirismo no mercado de comunicação, antecipando tendências e ferramentas.' },
  { tituloKey: 'valor4_titulo', descKey: 'valor4_descricao', tituloFallback: 'Meritocracia e Reconhecimento', descFallback: 'Valorizamos o talento e o esforço individual e coletivo dos nossos colaboradores, garantindo que o crescimento profissional caminhe lado a lado com os resultados entregues.' },
  { tituloKey: 'valor5_titulo', descKey: 'valor5_descricao', tituloFallback: 'Ética e Parceria', descFallback: 'Construímos relações transparentes, íntegras e duradouras com a equipe, clientes e a mídia.' },
]

export default async function MissaoVisaoValoresPage() {
  const content = await getSiteContent()

  const missao = g(content, 'mvv', 'missao', 'Conectar marcas e pessoas por meio de estratégias de comunicação inovadoras, integradas e de vanguarda, tratando cada cliente como nosso maior ativo e gerando resultados sustentáveis que impulsionam negócios para o futuro.')
  const visao = g(content, 'mvv', 'visao', 'Ser a agência líder e referência de mercado em comunicação integrada na Baixada Santista, reconhecida pela excelência estratégica, pioneirismo e por atrair e reter os profissionais mais apaixonados do setor.')

  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <span className="inline-block bg-gold/20 text-gold text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            Pilares da Agência
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Missão, Visão<br />
            <span className="text-gold">e Valores</span>
          </h1>
          <p className="text-gray-300 text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
            Os princípios que guiam cada decisão, cada projeto e cada relação na Santos Press.
          </p>
        </div>
      </section>

      {/* ── Missão ── */}
      <section className="bg-white dark:bg-[#111111] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="text-gold font-bold text-xs uppercase tracking-widest">Missão</span>
          </div>
          <blockquote className="text-2xl md:text-3xl font-light text-navy dark:text-white text-center leading-relaxed italic">
            &ldquo;{missao}&rdquo;
          </blockquote>
        </div>
      </section>

      {/* ── Divisor ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* ── Visão ── */}
      <section className="bg-gray-50 dark:bg-[#161616] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="text-gold font-bold text-xs uppercase tracking-widest">Visão</span>
          </div>
          <blockquote className="text-2xl md:text-3xl font-light text-navy dark:text-white text-center leading-relaxed italic">
            &ldquo;{visao}&rdquo;
          </blockquote>
        </div>
      </section>

      {/* ── Divisor ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* ── Valores ── */}
      <section className="bg-white dark:bg-[#111111] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-gold font-bold text-xs uppercase tracking-widest">Valores</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-white mt-3">O que nos guia</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {VALORES_DEFAULTS.map((v, i) => (
              <div
                key={v.tituloKey}
                className="relative bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-8 border border-gray-100 dark:border-white/5"
              >
                <span className="absolute top-6 right-6 text-4xl font-black text-gold/10 leading-none select-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="w-2 h-2 rounded-full bg-gold mb-5" />
                <h3 className="font-bold text-navy dark:text-white text-lg mb-3">
                  {g(content, 'mvv', v.tituloKey, v.tituloFallback)}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {g(content, 'mvv', v.descKey, v.descFallback)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
