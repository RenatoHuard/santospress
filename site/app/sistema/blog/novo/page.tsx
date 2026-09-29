import { getFuncionariosBasico, getClientesBasico } from '@/app/sistema/actions/blog'
import { BlogEditorClient } from './BlogEditorClient'

export default async function NovoBlogPostPage() {
  const [funcionarios, clientes] = await Promise.all([
    getFuncionariosBasico(),
    getClientesBasico(),
  ])
  return <BlogEditorClient funcionarios={funcionarios} clientes={clientes} />
}
