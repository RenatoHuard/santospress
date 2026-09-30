'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopNav } from '../../components/TopNav'
import { CornerRadialMenu } from '../../components/CornerRadialMenu'
import {
  buildTree, applyToggle, DEFAULT_PERMISSIONS, CONFIGURABLE_ROLES,
  type TreeNode,
} from '../../lib/menu-tree'
import { getMenuPermissions, saveRolePermissions } from '../../actions/menu-permissions'

// ── Ícones ──────────────────────────────────────────────────────────

const IconFolder = () => (
  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
)

const IconLeaf = () => (
  <svg className="w-3.5 h-3.5 text-gray-300 dark:text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

// ── Toggle Switch ────────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
        enabled ? 'bg-gold' : 'bg-gray-200 dark:bg-white/10'
      }`}
      aria-label={enabled ? 'Desativar' : 'Ativar'}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
          enabled ? 'left-5' : 'left-0.5'
        }`}
      />
    </button>
  )
}

// ── Tree Node ────────────────────────────────────────────────────────

function TreeItem({
  node,
  depth,
  perms,
  onToggle,
}: {
  node: TreeNode
  depth: number
  perms: Set<string>
  onToggle: (id: string, on: boolean) => void
}) {
  const enabled = perms.has(node.id)
  const parentDisabled = depth > 0 // parent toggle controls opacity visually

  return (
    <>
      <div
        className={`flex items-center justify-between py-3 pr-5 transition-opacity ${
          !enabled && depth > 0 ? 'opacity-40' : ''
        }`}
        style={{ paddingLeft: 20 + depth * 22 }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {depth > 0 && (
            <span className="text-gray-200 dark:text-white/10 text-xs select-none">└</span>
          )}
          {node.isGroup ? <IconFolder /> : <IconLeaf />}
          <span
            className={`text-sm truncate ${
              node.isGroup
                ? 'font-semibold text-gray-700 dark:text-gray-200'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {node.label}
          </span>
        </div>
        <Toggle enabled={enabled} onChange={on => onToggle(node.id, on)} />
      </div>
      {node.children.map(child => (
        <TreeItem key={child.id} node={child} depth={depth + 1} perms={perms} onToggle={onToggle} />
      ))}
    </>
  )
}

// ── Page ─────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  gestor:      'text-blue-500',
  rh:          'text-purple-500',
  colaborador: 'text-green-500',
  atendente:   'text-orange-500',
}

export default function RolesPage() {
  const [selected, setSelected] = useState('colaborador')
  const [perms, setPerms] = useState<Record<string, Set<string>>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const tree = buildTree()

  useEffect(() => {
    async function load() {
      const entries = await Promise.all(
        CONFIGURABLE_ROLES.map(async r => [r.key, new Set(await getMenuPermissions(r.key))] as const)
      )
      setPerms(Object.fromEntries(entries))
    }
    load()
  }, [])

  const handleToggle = useCallback(
    async (itemId: string, on: boolean) => {
      const current = perms[selected] ?? new Set(DEFAULT_PERMISSIONS[selected] ?? [])
      const next = applyToggle(current, itemId, on)
      setPerms(p => ({ ...p, [selected]: next }))
      setSaving(true)
      setSaved(false)
      try {
        await saveRolePermissions(selected, [...next])
        setSaved(true)
        setTimeout(() => setSaved(false), 1500)
      } finally {
        setSaving(false)
      }
    },
    [perms, selected]
  )

  const currentPerms = perms[selected]
  const selectedRole = CONFIGURABLE_ROLES.find(r => r.key === selected)!

  const cornerItems = [{
    id: 'roles',
    label: 'Roles',
    href: '/sistema/admin/roles',
    exact: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
  }]

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <CornerRadialMenu items={cornerItems} />
      <main className="flex-1 px-4 py-8 max-w-xl mx-auto w-full">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/sistema"
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 dark:text-gray-600 font-medium mb-0.5">Sistema</p>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Gestão de Roles</h1>
          </div>
          <div className="h-5 flex items-center">
            {saving && <span className="text-[11px] text-gray-400 animate-pulse">Salvando…</span>}
            {saved && !saving && (
              <span className="text-[11px] text-green-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Salvo
              </span>
            )}
          </div>
        </div>

        {/* Role tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {CONFIGURABLE_ROLES.map(r => (
            <button
              key={r.key}
              onClick={() => setSelected(r.key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                selected === r.key
                  ? 'bg-gold text-white shadow-sm'
                  : 'bg-white dark:bg-[#111] border border-gray-200 dark:border-white/8 text-gray-500 dark:text-gray-400 hover:border-gray-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-400 dark:text-gray-600 mb-4">
          Defina quais itens do menu o perfil{' '}
          <span className={`font-semibold ${ROLE_COLORS[selected]}`}>{selectedRole.label}</span>{' '}
          pode visualizar. Ao ativar um item filho, o caminho até ele é habilitado automaticamente.
          Ao desativar um pai, todos os filhos são desabilitados.
        </p>

        {/* Tree */}
        {!currentPerms ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden divide-y divide-gray-50 dark:divide-white/5">
            {tree.map(node => (
              <TreeItem key={node.id} node={node} depth={0} perms={currentPerms} onToggle={handleToggle} />
            ))}
          </div>
        )}

      </main>
    </div>
  )
}
