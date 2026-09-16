import { supabase } from '@/lib/supabase'
import { BlogCard } from '@/components/BlogCard'
import type { BlogPost } from '@/lib/types'

export const revalidate = 60

export const metadata = {
  title: 'Notícias | SantosPress Comunicação Integrada',
  description: 'Artigos, notícias e insights sobre comunicação, assessoria de imprensa e marketing.',
}

async function getAllPosts(): Promise<BlogPost[]> {
  const { data } = await supabase
    .from('spress_blog_posts')
    .select('id, titulo, slug, resumo, capa_url, publicado_em')
    .eq('status', 'publicado')
    .order('publicado_em', { ascending: false })
  return data ?? []
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <main className="min-h-screen">
      <div className="bg-navy py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold font-semibold text-xs uppercase tracking-widest">Conteúdo</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-3">Notícias</h1>
          <p className="text-gray-300 mt-4 max-w-xl mx-auto">
            Artigos, notícias e insights sobre comunicação, assessoria de imprensa e marketing.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-[#161616] min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {posts.length === 0 ? (
            <p className="text-center text-gray-400 py-24">Nenhum post publicado ainda. Em breve!</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
