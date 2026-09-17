import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({
    version: process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_ID ?? 'dev',
  })
}
