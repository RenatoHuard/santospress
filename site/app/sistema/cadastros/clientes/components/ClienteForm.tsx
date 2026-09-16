'use client'

import { useState } from 'react'
import { TabEmpresa } from './tabs/TabEmpresa'
import { TabContatos } from './tabs/TabContatos'
import { TabFinanceiro } from './tabs/TabFinanceiro'
import { TabContratos } from './tabs/TabContratos'
import { TabCRM } from './tabs/TabCRM'

interface Props {
  mode: 'create' | 'edit'
  initialData?: Record<string, string>
}

type TabKey = 'empresa' | 'contatos' | 'financeiro' | 'contratos' | 'crm'

const ALL_TABS: { key: TabKey; label: string; editOnly?: boolean }[] = [
  { key: 'empresa',    label: 'Empresa' },
  { key: 'contatos',  label: 'Contatos',   editOnly: true },
  { key: 'financeiro', label: 'Financeiro', editOnly: true },
  { key: 'contratos',  label: 'Contratos',  editOnly: true },
  { key: 'crm',        label: 'CRM',        editOnly: true },
]

export function ClienteForm({ mode, initialData }: Props) {
  const [active, setActive] = useState<TabKey>('empresa')

  const tabs = mode === 'create' ? ALL_TABS.filter((t) => !t.editOnly) : ALL_TABS
  const clienteId = initialData?.id ?? ''

  return (
    <div>
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
            + 4 abas disponíveis após o cadastro
          </div>
        )}
      </div>

      {active === 'empresa' && (
        <TabEmpresa mode={mode} initialData={initialData} />
      )}
      {mode === 'edit' && clienteId && (
        <>
          {active === 'contatos'   && <TabContatos  clienteId={clienteId} />}
          {active === 'financeiro' && <TabFinanceiro clienteId={clienteId} />}
          {active === 'contratos'  && <TabContratos  clienteId={clienteId} />}
          {active === 'crm'        && <TabCRM         clienteId={clienteId} />}
        </>
      )}
    </div>
  )
}
