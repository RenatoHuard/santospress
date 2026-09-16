import { notFound } from 'next/navigation'
import { getBlogPost, getFuncionariosBasico } from '../../actions/blog'
import { BlogEditorClient } from '../novo/BlogEditorClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarBlogPostPage({ params }: Props) {
  const { id } = await params

  let post = null
  let funcionarios: { id: string; nome: string; email: string; is_coringa: boolean }[] = []

  try {
    ;[post, funcionarios] = await Promise.all([getBlogPost(id), getFuncionariosBasico()])
  } catch {
    // service key not set
  }

  if (post === null && funcionarios.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-sm">Configure SUPABASE_SERVICE_ROLE_KEY para editar publicações.</p>
      </div>
    )
  }

  if (!post) notFound()

  return (
    <BlogEditorClient
      funcionarios={funcionarios}
      initialPost={post as Parameters<typeof BlogEditorClient>[0]['initialPost']}
    />
  )
}
