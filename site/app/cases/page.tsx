import { createClient } from '@supabase/supabase-js'
import { BlogCard } from '@/components/BlogCard'
import type { BlogPost } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Cases | SantosPress Comunicação Integrada',
  description: 'Conheça projetos e resultados de comunicação desenvolvidos pela SantosPress.',
}

async function getAllCases(): Promise<BlogPost[]> {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const { data } = await sb
    .from('spress_blog_posts')
    .select('id, titulo, slug, resumo, capa_url, publicado_em')
    .eq('status', 'publicado')
    .eq('tipo', 'case')
    .order('publicado_em', { ascending: false })
  return data ?? []
}

export default async function CasesPage() {
  const posts = await getAllCases()

  return (
    <main className="min-h-screen">
      <div className="bg-navy py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold font-semibold text-xs uppercase tracking-widest">Portfólio</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-3">Cases</h1>
          <p className="text-gray-300 mt-4 max-w-xl mx-auto">
            Conheça projetos e resultados de comunicação desenvolvidos pela SantosPress.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-[#161616] min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {posts.length === 0 ? (
            <p className="text-center text-gray-400 py-24">Nenhum case publicado ainda. Em breve!</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} href={`/cases/${post.slug}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
