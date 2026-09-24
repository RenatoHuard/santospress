import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-[#111111] text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/images/Logo_santospress_horizontal_negativo.png"
                alt="Santos Press Comunicação Integrada"
                width={220}
                height={66}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed">
              Comunicação integrada para empresas, entidades e personalidades que buscam posicionamento estratégico junto à mídia.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Navegação</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-gold transition-colors">Home</Link></li>
              <li><Link href="/noticias" className="hover:text-gold transition-colors">Notícias</Link></li>
              <li><Link href="/equipe" className="hover:text-gold transition-colors">Equipe</Link></li>
              <li><Link href="/missao-visao-valores" className="hover:text-gold transition-colors">Missão, Visão e Valores</Link></li>
              <li><Link href="/login" className="hover:text-gold transition-colors">Área Logada</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:atendimento@santospress.com.br" className="hover:text-gold transition-colors">
                  atendimento@santospress.com.br
                </a>
              </li>
              <li>
                <a href="https://wa.me/5513997426063" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                  (13) 99742-6063
                </a>
              </li>
              <li>Rua Quintino Bocaiuva, 03</li>
              <li>Gonzaga — Santos/SP</li>
              <li>
                <div className="flex gap-4 mt-2">
                  <a
                    href="https://www.instagram.com/santospress/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold transition-colors"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://www.facebook.com/SantosPressComunicacao/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold transition-colors"
                  >
                    Facebook
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-sm">
          <p>© {new Date().getFullYear()} Santos Press Comunicação Integrada. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
