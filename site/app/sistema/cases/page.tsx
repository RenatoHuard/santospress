import Link from 'next/link'
import Image from 'next/image'
import { getBlogPosts } from '../actions/blog'

const STATUS_STYLE: Record<string, string> = {
  publicado: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rascunho:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function CasesListPage() {
  let posts: Awaited<ReturnType<typeof getBlogPosts>> = []
  let loadError = false

  try {
    posts = await getBlogPosts('case')
  } catch {
    loadError = true
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 dark:text-white text-2xl font-bold">Post Cases</h1>
          {!loadError && (
            <p className="text-gray-400 dark:text-gray-600 text-sm mt-0.5">
              {posts.length} publicaç{posts.length === 1 ? 'ão' : 'ões'}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Link
            href="/sistema/cases/relatorios"
            className="flex items-center gap-2 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-xl text-sm font-medium hover:border-gold hover:text-gold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Relatórios
          </Link>
          <Link
            href="/sistema/cases/novo"
            className="bg-gold text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9e2126] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nova Case
          </Link>
        </div>
      </div>

      {loadError && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 text-amber-700 dark:text-amber-400 text-sm mb-6">
          Configure <code className="font-mono bg-amber-100 dark:bg-black/30 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> no .env.local para visualizar os post cases.
        </div>
      )}

      {!loadError && posts.length === 0 && (
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-20 text-center">
          <svg className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-600">Nenhum post case ainda.</p>
          <Link href="/sistema/cases/novo" className="mt-4 inline-block text-gold hover:text-gold/80 text-sm transition-colors">
            Criar o primeiro post case →
          </Link>
        </div>
      )}

      {posts.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/sistema/cases/${post.id}`}
              className="group bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden hover:border-gold/40 hover:shadow-lg hover:shadow-gold/5 transition-all duration-200"
            >
              <div className="relative h-36 bg-gray-100 dark:bg-[#1a1a1a]">
                {post.capa_url ? (
                  <Image src={post.capa_url} alt={post.titulo} fill className="object-contain p-1" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                )}
                <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[post.status ?? 'rascunho'] ?? STATUS_STYLE.rascunho}`}>
                  {post.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                </span>
              </div>
              <div className="p-4">
                <p className="text-gray-900 dark:text-white text-sm font-semibold leading-snug line-clamp-2 group-hover:text-gold transition-colors">
                  {post.titulo || 'Sem título'}
                </p>
                <div className="flex items-center justify-between mt-2">
                  {post.categoria && (
                    <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                      {post.categoria}
                    </span>
                  )}
                  <span className="text-[11px] text-gray-400 ml-auto">
                    {formatDate(post.publicado_em ?? post.created_at)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
