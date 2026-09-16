import Image from 'next/image'
import type { TeamMember } from '@/lib/types'

const LOGO = '/images/Logo_santospress_negativo.png'

export function TeamCard({ member }: { member: TeamMember }) {
  const displayName = member.nome_site ?? member.nome

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5 text-center p-8">
      <div className="relative w-28 h-28 mx-auto mb-5 rounded-full overflow-hidden bg-navy">
        {member.foto_url ? (
          <Image
            src={member.foto_url}
            alt={displayName}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <Image
            src={LOGO}
            alt="SantosPress"
            fill
            className="object-contain p-3"
          />
        )}
      </div>
      <h3 className="font-semibold text-navy dark:text-white text-lg leading-tight">{displayName}</h3>
      {member.cargo && (
        <p className="text-gold text-sm font-medium mt-1">{member.cargo}</p>
      )}
      {member.descricao_site && (
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 leading-relaxed">{member.descricao_site}</p>
      )}
    </div>
  )
}
