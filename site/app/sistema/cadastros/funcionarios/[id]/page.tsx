import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getFuncionario, getSetores } from '../../../actions'
import { FuncionarioForm } from '../components/FuncionarioForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarFuncionarioPage({ params }: Props) {
  const { id } = await params

  let funcionario = null
  let setores: { id: string; nome: string }[] = []

  try {
    ;[funcionario, setores] = await Promise.all([getFuncionario(id), getSetores()])
  } catch {
    // service key not set
  }

  if (funcionario === undefined || (funcionario === null && setores.length === 0)) {
    // May be service key not set — show partial UI
  }

  if (funcionario === null && setores.length > 0) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/sistema/cadastros/funcionarios" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 text-xs flex items-center gap-1.5 mb-4 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Colaboradores
        </Link>
        <h1 className="text-gray-900 dark:text-white text-2xl font-bold">Editar Colaborador</h1>
        {funcionario && (
          <p className="text-gray-500 dark:text-gray-600 text-sm mt-1">{funcionario.nome}</p>
        )}
      </div>

      {!funcionario && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 text-amber-700 dark:text-amber-400 text-sm mb-6">
          Configure <code className="font-mono bg-amber-100 dark:bg-black/30 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> no .env.local para editar colaboradores.
        </div>
      )}

      {funcionario && (
        <FuncionarioForm
          mode="edit"
          setores={setores}
          initialData={funcionario as Parameters<typeof FuncionarioForm>[0]['initialData']}
        />
      )}
    </div>
  )
}
