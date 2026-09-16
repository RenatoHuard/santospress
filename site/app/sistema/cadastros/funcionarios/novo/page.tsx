import Link from 'next/link'
import { getSetores } from '../../../actions'
import { FuncionarioForm } from '../components/FuncionarioForm'

export default async function NovoFuncionarioPage() {
  let setores: { id: string; nome: string }[] = []
  try {
    setores = await getSetores()
  } catch {
    // service key not set — form handles gracefully
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/sistema/cadastros/funcionarios" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 text-xs flex items-center gap-1.5 mb-4 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Colaboradores
        </Link>
        <h1 className="text-gray-900 dark:text-white text-2xl font-bold">Novo Colaborador</h1>
        <p className="text-gray-500 dark:text-gray-600 text-sm mt-1">
          Informe o e-mail e a senha inicial de acesso do colaborador.
        </p>
      </div>

      <FuncionarioForm mode="create" setores={setores} />
    </div>
  )
}
