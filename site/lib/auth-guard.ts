import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

function sbAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key === 'sua_service_role_key_aqui') throw new Error('SERVICE_KEY_NOT_SET')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
}

async function getServerSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function requireUser() {
  const sb = await getServerSupabase()
  const { data: { user }, error } = await sb.auth.getUser()
  if (!user || error) throw new Error('UNAUTHORIZED')
  return user
}

export async function requireStaff() {
  const user = await requireUser()
  const admin = sbAdmin()
  const [{ data: func }, { data: sys }] = await Promise.all([
    admin.from('spress_usuarios').select('id').eq('auth_user_id', user.id).maybeSingle(),
    admin.from('spress_sys_users').select('id').eq('auth_user_id', user.id).eq('ativo', true).maybeSingle(),
  ])
  if (!func && !sys) throw new Error('FORBIDDEN')
  return user
}
