import { supabase } from '@/lib/supabase'
import { TeamCard } from '@/components/TeamCard'
import type { TeamMember } from '@/lib/types'

export const revalidate = 60

export const metadata = {
  title: 'Nossa Equipe | SantosPress Comunicação Integrada',
  description: 'Conheça os profissionais especializados da SantosPress.',
}

async function getTeam(): Promise<TeamMember[]> {
  const { data } = await supabase
    .from('spress_usuarios')
    .select('id, nome, nome_site, cargo, foto_url, descricao_site')
    .eq('ativo', true)
    .order('nome')
  return data ?? []
}

export default async function EquipePage() {
  const team = await getTeam()

  return (
    <main className="min-h-screen">
      <div className="bg-navy py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold font-semibold text-xs uppercase tracking-widest">Time</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-3">Nossa Equipe</h1>
          <p className="text-gray-300 mt-4 max-w-xl mx-auto">
            Profissionais especializados e apaixonados por comunicação, prontos para transformar a sua marca.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-[#161616] min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {team.length === 0 ? (
            <p className="text-center text-gray-400 py-24">
              Em breve apresentaremos nossa equipe completa.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {team.map((member) => (
                <TeamCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
