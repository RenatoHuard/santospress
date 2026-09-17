import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET() {
  // VERCEL_DEPLOYMENT_ID é resolvido em runtime — sempre retorna o deploy atual
  const version =
    process.env.VERCEL_DEPLOYMENT_ID ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    'dev'
  return NextResponse.json({ version })
}
