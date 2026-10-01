'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { TabEmpresa } from './tabs/TabEmpresa'
import { TabContatos } from './tabs/TabContatos'
import { TabFinanceiro } from './tabs/TabFinanceiro'
import { TabContratos } from './tabs/TabContratos'
import { TabCRM } from './tabs/TabCRM'
import { TabDepoimentos } from './tabs/TabDepoimentos'
import { setSimulatedRole, setSimulatedClienteId } from '@/app/sistema/lib/simulador'

interface Props {
  mode: 'create' | 'edit'
  initialData?: Record<string, string>
}

type TabKey = 'empresa' | 'contatos' | 'financeiro' | 'contratos' | 'crm' | 'depoimentos'

const ALL_TABS: { key: TabKey; label: string; editOnly?: boolean }[] = [
  { key: 'empresa',      label: 'Empresa' },
  { key: 'contatos',     label: 'Contatos',    editOnly: true },
  { key: 'financeiro',   label: 'Financeiro',  editOnly: true },
  { key: 'contratos',    label: 'Contratos',   editOnly: true },
  { key: 'crm',          label: 'CRM',         editOnly: true },
  { key: 'depoimentos',  label: 'Depoimentos', editOnly: true },
]

export function ClienteForm({ mode, initialData }: Props) {
  const searchParams = useSearchParams()
  const [active, setActive] = useState<TabKey>(() => {
    const tab = searchParams.get('tab') as TabKey | null
    if (tab && ALL_TABS.some(t => t.key === tab)) return tab
    return 'empresa'
  })

  useEffect(() => {
    const tab = searchParams.get('tab') as TabKey | null
    if (tab && ALL_TABS.some(t => t.key === tab)) setActive(tab)
  }, [searchParams])

  const tabs = mode === 'create' ? ALL_TABS.filter((t) => !t.editOnly) : ALL_TABS
  const clienteId = initialData?.id ?? ''

  function handleSimularPortal() {
    if (!clienteId) return
    setSimulatedRole('cliente')
    setSimulatedClienteId(clienteId)
    window.location.href = '/cliente'
  }

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
        {mode === 'edit' && clienteId && (
          <div className="flex items-center ml-auto pl-4">
            <button
              type="button"
              onClick={handleSimularPortal}
              title="Ver portal como este cliente"
              className="flex items-center gap-1.5 text-xs text-pink-500 hover:text-pink-600 dark:hover:text-pink-400 whitespace-nowrap transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Simular portal
            </button>
          </div>
        )}
      </div>

      {active === 'empresa' && (
        <TabEmpresa mode={mode} initialData={initialData} />
      )}
      {mode === 'edit' && clienteId && (
        <>
          {active === 'contatos'    && <TabContatos    clienteId={clienteId} />}
          {active === 'financeiro'  && <TabFinanceiro  clienteId={clienteId} />}
          {active === 'contratos'   && <TabContratos   clienteId={clienteId} />}
          {active === 'crm'         && <TabCRM          clienteId={clienteId} />}
          {active === 'depoimentos' && <TabDepoimentos  clienteId={clienteId} />}
        </>
      )}
    </div>
  )
}
