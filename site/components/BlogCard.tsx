import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '@/lib/types'

function formatDate(date: string | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/noticias/${post.slug}`}
      className="group block bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none transition-shadow border border-gray-100 dark:border-white/5"
    >
      {post.capa_url ? (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={post.capa_url}
            alt={post.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-navy/10 to-gold/20" />
      )}
      <div className="p-6">
        <p className="text-xs text-gray-400 mb-2 font-medium">{formatDate(post.publicado_em)}</p>
        <h3 className="text-base font-semibold text-navy dark:text-white group-hover:text-gold dark:group-hover:text-gold transition-colors mb-2 line-clamp-2 leading-snug">
          {post.titulo}
        </h3>
        {post.resumo && (
          <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed">{post.resumo}</p>
        )}
      </div>
    </Link>
  )
}
