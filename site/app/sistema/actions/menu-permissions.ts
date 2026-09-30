'use server'

import { createClient } from '@supabase/supabase-js'
import { DEFAULT_PERMISSIONS } from '../lib/menu-tree'

function sb() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key === 'sua_service_role_key_aqui') throw new Error('SERVICE_KEY_NOT_SET')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
}

export async function getMenuPermissions(role: string): Promise<string[]> {
  const { data } = await sb()
    .from('spress_menu_permissions')
    .select('item_id')
    .eq('role', role)

  if (!data || data.length === 0) return DEFAULT_PERMISSIONS[role] ?? []
  return data.map((d: { item_id: string }) => d.item_id)
}

export async function saveRolePermissions(role: string, enabledIds: string[]): Promise<void> {
  await sb().from('spress_menu_permissions').delete().eq('role', role)
  if (enabledIds.length > 0) {
    await sb().from('spress_menu_permissions').insert(
      enabledIds.map(item_id => ({ role, item_id }))
    )
  }
}
