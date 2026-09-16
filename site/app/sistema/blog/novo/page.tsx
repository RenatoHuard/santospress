import { getFuncionariosBasico } from '@/app/sistema/actions/blog'
import { BlogEditorClient } from './BlogEditorClient'

export default async function NovoBlogPostPage() {
  const funcionarios = await getFuncionariosBasico()
  return <BlogEditorClient funcionarios={funcionarios} />
}
