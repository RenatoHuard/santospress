import { getFuncionariosBasico, getClientesBasico } from '@/app/sistema/actions/blog'
import { BlogEditorClient } from '@/app/sistema/blog/novo/BlogEditorClient'

export default async function NovoCasePage() {
  const [funcionarios, clientes] = await Promise.all([
    getFuncionariosBasico(),
    getClientesBasico(),
  ])
  return (
    <BlogEditorClient
      funcionarios={funcionarios}
      clientes={clientes}
      tipo="case"
      tipoLabel="Case"
      backHref="/sistema/cases"
    />
  )
}
