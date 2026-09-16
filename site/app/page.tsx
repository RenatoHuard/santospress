import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { BlogCard } from '@/components/BlogCard'
import type { BlogPost } from '@/lib/types'

export const revalidate = 60

// ── Ícones de serviços (fixos) ─────────────────────────────────────

const serviceIcons = [
  <svg key="1" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>,
  <svg key="2" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>,
  <svg key="3" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
  <svg key="4" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  <svg key="5" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  <svg key="6" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2v4l.586-.586z" /></svg>,
]

// ── Dados do banco ─────────────────────────────────────────────────

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

// Helper com fallback
function g(c: SiteContent, secao: string, chave: string, fallback: string): string {
  return c[secao]?.[chave] || fallback
}

async function getLatestPosts(): Promise<BlogPost[]> {
  const { data } = await supabase
    .from('spress_blog_posts')
    .select('id, titulo, slug, resumo, capa_url, publicado_em')
    .eq('status', 'publicado')
    .order('publicado_em', { ascending: false })
    .limit(3)
  return data ?? []
}

async function getServicos() {
  // Títulos e descrições dos serviços buscados do banco (futuro).
  // Por ora retorna os dados estáticos com ícone do array acima.
  return [
    { title: 'Assessoria de Imprensa',   description: 'Posicionamento estratégico junto à mídia com press releases, pautas contextualizadas e relações com jornalistas.' },
    { title: 'Social Media',             description: 'Criação e gestão de conteúdo para redes sociais com foco em engajamento, identidade de marca e resultados.' },
    { title: 'Marketing Esportivo',      description: 'Estratégias de comunicação e marketing para o universo esportivo — clubes, atletas e eventos.' },
    { title: 'Consultoria de Marketing', description: 'Consultoria especializada para pequenas e médias empresas que precisam de posicionamento eficiente.' },
    { title: 'Cobertura de Eventos',     description: 'Produção e cobertura completa de eventos com criação de conteúdo jornalístico e transmidiático em tempo real.' },
    { title: 'Comunicação Interna',      description: 'Estratégias de comunicação organizacional que engajam, informam e fortalecem a cultura das equipes.' },
  ]
}

// ── Página ─────────────────────────────────────────────────────────

export default async function Home() {
  const [content, posts, services] = await Promise.all([
    getSiteContent(),
    getLatestPosts(),
    getServicos(),
  ])

  const heroStats = [
    { value: g(content, 'sobre', 'stat1_valor', '+10'),  label: g(content, 'sobre', 'stat1_label', 'Anos de experiência') },
    { value: g(content, 'sobre', 'stat2_valor', '+80'),  label: g(content, 'sobre', 'stat2_label', 'Clientes atendidos') },
    { value: g(content, 'sobre', 'stat3_valor', '+500'), label: g(content, 'sobre', 'stat3_label', 'Matérias publicadas') },
    { value: g(content, 'sobre', 'stat4_valor', '+120'), label: g(content, 'sobre', 'stat4_label', 'Veículos parceiros') },
  ]

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/25 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-44">
          <div className="max-w-3xl">
            <span className="inline-block bg-gold/20 text-gold text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-widest uppercase">
              {g(content, 'hero', 'badge', 'Santos/SP · Comunicação Integrada')}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              {g(content, 'hero', 'headline1', 'Comunicação que')}
              <span className="text-gold block mt-1">
                {g(content, 'hero', 'headline2', 'transforma marcas.')}
              </span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-12 leading-relaxed max-w-2xl">
              {g(content, 'hero', 'subtitulo', 'Assessoria de imprensa, social media e marketing integrado para posicionar sua empresa, entidade ou marca com inteligência junto à mídia e ao mercado.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={g(content, 'hero', 'cta1_href', '#servicos')}
                className="inline-block bg-gold text-white px-8 py-4 rounded-full font-semibold hover:bg-gold/85 transition-colors text-center"
              >
                {g(content, 'hero', 'cta1_texto', 'Nossos Serviços')}
              </Link>
              <Link
                href={g(content, 'hero', 'cta2_href', '#sobre')}
                className="inline-block border border-white/25 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors text-center"
              >
                {g(content, 'hero', 'cta2_texto', 'Conheça a SantosPress')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sobre ────────────────────────────────────────── */}
      <section id="sobre" className="bg-white dark:bg-[#111111] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-gold font-semibold text-xs uppercase tracking-widest">
                {g(content, 'sobre', 'badge', 'Sobre nós')}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-white mt-3 mb-6 leading-snug">
                {g(content, 'sobre', 'titulo', 'Comunicação integrada que cria oportunidades')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-5">
                {g(content, 'sobre', 'paragrafo1', 'A SantosPress nasceu para atender empresas, entidades e personalidades que buscam um posicionamento adequado junto à mídia — criando novas oportunidades de negócios com presença e consistência.')}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                {g(content, 'sobre', 'paragrafo2', 'Trabalhamos com o conceito de comunicação integrada, explorando a sinergia entre planejamento estratégico, relações com a mídia e pautas contextualizadas para cada momento.')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {heroStats.map((stat) => (
                <div key={stat.label} className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-7 text-center border border-gray-100 dark:border-white/5">
                  <p className="text-4xl font-bold text-gold">{stat.value}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Serviços ─────────────────────────────────────── */}
      <section id="servicos" className="bg-gray-50 dark:bg-[#161616] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold font-semibold text-xs uppercase tracking-widest">
              {g(content, 'servicos', 'badge', 'O que fazemos')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-white mt-3">
              {g(content, 'servicos', 'titulo', 'Serviços especializados em comunicação')}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <div
                key={s.title}
                className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-8 shadow-sm dark:shadow-none hover:shadow-md transition-shadow border border-gray-100 dark:border-white/5 group"
              >
                <div className="text-navy dark:text-gray-300 mb-4 group-hover:text-gold transition-colors">
                  {serviceIcons[i]}
                </div>
                <h3 className="text-lg font-semibold text-navy dark:text-white mb-3 group-hover:text-gold transition-colors">
                  {s.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blog (dinâmico) ───────────────────────────────── */}
      {posts.length > 0 && (
        <section className="bg-white dark:bg-[#111111] py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
              <div>
                <span className="text-gold font-semibold text-xs uppercase tracking-widest">
                  {g(content, 'blog', 'badge', 'Conteúdo')}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-white mt-3">
                  {g(content, 'blog', 'titulo', 'Últimas Notícias')}
                </h2>
              </div>
              <Link href="/noticias" className="mt-4 sm:mt-0 text-gold font-semibold hover:underline text-sm">
                Ver todas as notícias →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="bg-navy py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold font-semibold text-xs uppercase tracking-widest">
            {g(content, 'cta', 'badge', 'Fale conosco')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-6">
            {g(content, 'cta', 'titulo', 'Vamos conversar?')}
          </h2>
          <p className="text-gray-300 text-lg mb-10 leading-relaxed">
            {g(content, 'cta', 'subtitulo', 'Estamos em Santos/SP e prontos para transformar a comunicação da sua empresa. Entre em contato e descubra como podemos ajudar.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={g(content, 'cta', 'cta1_href', 'mailto:contato@santospress.com.br')}
              className="inline-block bg-gold text-white px-8 py-4 rounded-full font-semibold hover:bg-gold/85 transition-colors"
            >
              {g(content, 'cta', 'cta1_texto', 'Enviar mensagem')}
            </a>
            <a
              href={g(content, 'cta', 'cta2_href', 'https://www.instagram.com/santospress/')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-white/25 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              {g(content, 'cta', 'cta2_texto', 'Seguir no Instagram')}
            </a>
          </div>
          <p className="text-gray-500 text-sm mt-10">
            {g(content, 'cta', 'endereco', 'Rua Quintino Bocaiuva, 03, Gonzaga — Santos/SP')}
          </p>
        </div>
      </section>
    </main>
  )
}
