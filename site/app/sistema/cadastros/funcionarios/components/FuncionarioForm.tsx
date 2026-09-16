'use client'

import { useState } from 'react'
import { TabAcesso } from './tabs/TabAcesso'
import { TabPessoal } from './tabs/TabPessoal'
import { TabDocumentacao } from './tabs/TabDocumentacao'
import { TabContrato } from './tabs/TabContrato'
import { TabFinanceiro } from './tabs/TabFinanceiro'
import { TabSaude } from './tabs/TabSaude'

type Setor = { id: string; nome: string }

interface Funcionario {
  id: string
  nome: string
  nome_site: string | null
  email: string | null
  cargo: string | null
  setor_id: string | null
  role: string
  ativo: boolean
  foto_url: string | null
  descricao_site: string | null
}

interface Props {
  mode: 'create' | 'edit'
  setores: Setor[]
  initialData?: Funcionario
}

type TabKey = 'acesso' | 'pessoal' | 'documentacao' | 'contrato' | 'financeiro' | 'saude'

const ALL_TABS: { key: TabKey; label: string; editOnly?: boolean }[] = [
  { key: 'acesso',       label: 'Acesso' },
  { key: 'pessoal',      label: 'Dados Pessoais',  editOnly: true },
  { key: 'documentacao', label: 'Documentação',    editOnly: true },
  { key: 'contrato',     label: 'Contrato',        editOnly: true },
  { key: 'financeiro',   label: 'Financeiro',      editOnly: true },
  { key: 'saude',        label: 'Saúde',           editOnly: true },
]

export function FuncionarioForm({ mode, setores, initialData }: Props) {
  const [active, setActive] = useState<TabKey>('acesso')

  const tabs = mode === 'create' ? ALL_TABS.filter((t) => !t.editOnly) : ALL_TABS

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-gray-100 dark:border-white/5 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              active === tab.key
                ? 'border-gold text-gold'
                : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
        {mode === 'create' && (
          <div className="flex items-center px-4 text-xs text-gray-300 dark:text-gray-700 whitespace-nowrap">
            + 5 abas disponíveis após o cadastro
          </div>
        )}
      </div>

      {/* Tab content */}
      {active === 'acesso' && (
        <TabAcesso mode={mode} setores={setores} initialData={initialData} />
      )}
      {mode === 'edit' && initialData && (
        <>
          {active === 'pessoal'      && <TabPessoal      usuarioId={initialData.id} />}
          {active === 'documentacao' && <TabDocumentacao usuarioId={initialData.id} />}
          {active === 'contrato'     && <TabContrato     usuarioId={initialData.id} />}
          {active === 'financeiro'   && <TabFinanceiro   usuarioId={initialData.id} />}
          {active === 'saude'        && <TabSaude        usuarioId={initialData.id} />}
        </>
      )}
    </div>
  )
}
