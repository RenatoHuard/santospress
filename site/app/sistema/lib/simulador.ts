const KEY = 'sp_simulate_role'

export const ROLES_SIMULAVEIS = [
  { key: 'admin',       label: 'Admin',       cor: 'text-yellow-500 dark:text-gold' },
  { key: 'gestor',      label: 'Gestor',      cor: 'text-blue-500' },
  { key: 'rh',          label: 'RH',          cor: 'text-purple-500' },
  { key: 'colaborador', label: 'Colaborador', cor: 'text-green-500' },
  { key: 'atendente',   label: 'Atendente',   cor: 'text-orange-500' },
  { key: 'cliente',     label: 'Cliente',     cor: 'text-pink-500' },
]

export function getSimulatedRole(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(KEY)
}

export function setSimulatedRole(role: string | null) {
  if (typeof window === 'undefined') return
  if (role && role !== 'admin') sessionStorage.setItem(KEY, role)
  else sessionStorage.removeItem(KEY)
}

/** Se o usuário for admin e tiver simulação ativa, retorna os roles simulados. */
export function getEffectiveRoles(realRoles: string[]): string[] {
  if (!realRoles.includes('admin')) return realRoles
  const sim = getSimulatedRole()
  return sim ? [sim] : realRoles
}
