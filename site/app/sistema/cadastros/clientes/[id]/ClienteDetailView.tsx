'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ClienteForm } from '../components/ClienteForm'
import { TabContatos } from '../components/tabs/TabContatos'
import { TabFinanceiro } from '../components/tabs/TabFinanceiro'
import { TabContratos } from '../components/tabs/TabContratos'
import { TabCRM } from '../components/tabs/TabCRM'
import { TabDepoimentos } from '../components/tabs/TabDepoimentos'

type ClienteSimples = {
  id: string
  razao_social: string | null
  nome_fantasia: string | null
}

type TabKey = 'empresa' | 'contatos' | 'financeiro' | 'contratos' | 'crm' | 'depoimentos'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'empresa',     label: 'Empresa' },
  { key: 'contatos',    label: 'Contatos' },
  { key: 'financeiro',  label: 'Financeiro' },
  { key: 'contratos',   label: 'Contratos' },
  { key: 'crm',         label: 'CRM' },
  { key: 'depoimentos', label: 'Depoimentos' },
]

const STATUS_STYLE: Record<string, string> = {
  ativo:    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/30',
  inativo:  'bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/5 dark:text-gray-500 dark:border-white/10',
  suspenso: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/30',
}

function formatCNPJ(v: string | null | undefined) {
  if (!v) return '—'
  const d = v.replace(/\D/g, '')
  if (d.length !== 14) return v
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 font-medium mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 dark:text-gray-200">{value || '—'}</p>
    </div>
  )
}

function ViewEmpresa({ d }: { d: Record<string, string> }) {
  const addressParts = [d.logradouro, d.numero, d.complemento, d.bairro].filter(Boolean)
  const address = addressParts.length ? addressParts.join(', ') : null
  const cityState = [d.cidade, d.uf].filter(Boolean).join(' — ') || null

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Dados da Empresa</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <Row label="Razão Social"       value={d.razao_social} />
          <Row label="Nome Fantasia"      value={d.nome_fantasia} />
          <Row label="CNPJ"               value={formatCNPJ(d.cnpj)} />
          <Row label="Inscrição Estadual" value={d.inscricao_estadual} />
          <Row label="Inscrição Municipal" value={d.inscricao_municipal} />
          <Row label="Segmento"           value={d.segmento} />
        </div>
      </div>

      {(address || cityState || d.cep) && (
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Endereço</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {d.cep    && <Row label="CEP"        value={d.cep} />}
            {address  && <Row label="Endereço"   value={address} />}
            {cityState && <Row label="Cidade / UF" value={cityState} />}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Contato Geral</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <Row label="Telefone" value={d.telefone} />
          <Row label="E-mail"   value={d.email} />
          {d.site_url && <Row label="Site" value={d.site_url} />}
        </div>
      </div>

      {d.observacoes && (
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Observações</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{d.observacoes}</p>
        </div>
      )}
    </div>
  )
}

interface Props {
  cliente: Record<string, string>
  todos: ClienteSimples[]
}

export function ClienteDetailView({ cliente, todos }: Props) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('empresa')

  const idx = todos.findIndex((t) => t.id === cliente.id)
  const prev = idx > 0 ? todos[idx - 1] : null
  const next = idx >= 0 && idx < todos.length - 1 ? todos[idx + 1] : null
  const nomeDisplay = cliente.nome_fantasia || cliente.razao_social || 'Cliente'
  const status = cliente.status ?? 'ativo'

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/sistema/cadastros/clientes"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 text-xs flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Clientes
          </Link>

          <div className="flex items-center gap-1">
            <button
              disabled={!prev}
              onClick={() => prev && router.push(`/sistema/cadastros/clientes/${prev.id}`)}
              title={prev ? `← ${prev.nome_fantasia ?? prev.razao_social}` : undefined}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {idx >= 0 && (
              <span className="text-[11px] text-gray-400 dark:text-gray-600 tabular-nums px-1">
                {idx + 1} / {todos.length}
              </span>
            )}
            <button
              disabled={!next}
              onClick={() => next && router.push(`/sistema/cadastros/clientes/${next.id}`)}
              title={next ? `${next.nome_fantasia ?? next.razao_social} →` : undefined}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-gray-900 dark:text-white text-2xl font-bold">{nomeDisplay}</h1>
            {cliente.nome_fantasia && cliente.razao_social && (
              <p className="text-gray-500 dark:text-gray-600 text-sm mt-0.5">{cliente.razao_social}</p>
            )}
            <div className="mt-2">
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLE[status] ?? STATUS_STYLE.ativo}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>

          {isEditing ? (
            <button
              onClick={() => setIsEditing(false)}
              className="shrink-0 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 px-4 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          ) : (
            <button
              onClick={() => { setIsEditing(true); setActiveTab('empresa') }}
              className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-gold border border-gold/30 hover:bg-gold/5 px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              </svg>
              Editar
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <ClienteForm mode="edit" initialData={cliente} />
      ) : (
        <>
          <div className="flex border-b border-gray-100 dark:border-white/5 mb-8 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-gold text-gold'
                    : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'empresa'     && <ViewEmpresa d={cliente} />}
          {activeTab === 'contatos'    && <TabContatos    clienteId={cliente.id} />}
          {activeTab === 'financeiro'  && <TabFinanceiro  clienteId={cliente.id} />}
          {activeTab === 'contratos'   && <TabContratos   clienteId={cliente.id} />}
          {activeTab === 'crm'         && <TabCRM          clienteId={cliente.id} />}
          {activeTab === 'depoimentos' && <TabDepoimentos  clienteId={cliente.id} />}
        </>
      )}
    </div>
  )
}
