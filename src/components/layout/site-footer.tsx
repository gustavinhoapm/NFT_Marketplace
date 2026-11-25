import { Link } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'

import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
} from '@/components/ui/social-icons'

const PROFILE_LINKS = [
  { label: 'Meu perfil', to: '/perfil', search: {} },
  { label: 'Minha coleção', to: '/pedidos', search: {} },
  { label: 'Atividade', to: '/em-breve', search: { area: 'atividade' } },
  { label: 'Estúdio do criador', to: '/em-breve', search: { area: 'criadores' } },
  { label: 'Lista de interesse', to: '/', search: { fav: '1' as const, page: 1 } },
] as const

const HELP_LINKS = [
  'Central de ajuda',
  'Como comprar NFTs',
  'Carteira e segurança',
  'Política do mercado',
  'Denunciar item',
] as const

const COLLECTION_LINKS = [
  { label: 'Arte digital', id: 'arte-digital' },
  { label: 'Fotografia', id: 'fotografia' },
  { label: 'Música', id: 'musica' },
  { label: 'Arte 3D', id: 'arte-3d' },
  { label: 'Utilidade', id: 'utilidade' },
] as const

const SOCIALS = [
  { label: 'Facebook', Icon: FacebookIcon },
  { label: 'Instagram', Icon: InstagramIcon },
  { label: 'Twitter', Icon: TwitterIcon },
  { label: 'LinkedIn', Icon: LinkedinIcon },
  { label: 'YouTube', Icon: YoutubeIcon },
] as const

const FEATURES = [
  {
    letter: 'W',
    title: 'Segurança da carteira',
    text: 'Proteja sua carteira e colecione arte digital verificada com confiança.',
  },
  {
    letter: 'C',
    title: 'Criadores em destaque',
    text: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
  },
  {
    letter: 'D',
    title: 'Alertas de lançamentos',
    text: 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
  },
] as const

/** Footer completo do frame desktop, com ações fora de escopo declaradas. */
export function SiteFooter() {
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  function submitNewsletter(event: FormEvent) {
    event.preventDefault()
    setNotice('A lista de lançamentos não faz parte desta demonstração. Nenhum dado foi enviado.')
  }

  return (
    <footer className="mt-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-[30px]">
        <div className="grid gap-8 rounded-t-md bg-surface p-8 lg:grid-cols-[1fr_1fr_1fr_1.2fr]">
          {FEATURES.map((feature) => (
            <div key={feature.letter}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-ink">
                {feature.letter}
              </span>
              <h2 className="mt-4 text-xs font-bold tracking-wide">{feature.title}</h2>
              <p className="mt-2 text-[11px] leading-relaxed text-content-muted">{feature.text}</p>
            </div>
          ))}
          <div>
            <h2 className="text-xs font-bold tracking-wide">Antecipe-se ao próximo lançamento</h2>
            <form onSubmit={submitNewsletter} className="mt-4 flex gap-2">
              <label htmlFor="newsletter" className="sr-only">Seu e-mail</label>
              <input
                id="newsletter"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Digite seu e-mail.."
                className="h-9 min-w-0 flex-1 rounded-sm border border-line bg-ink px-3 text-[11px] placeholder:text-content-subtle focus:border-accent focus:outline-none"
              />
              <button type="submit" className="rounded-sm bg-accent px-4 py-2 text-[11px] font-bold text-ink hover:bg-accent-hover">
                Enviar
              </button>
            </form>
            {notice && (
              <p role="status" className="mt-2 text-[10px] text-content-subtle">{notice}</p>
            )}
            <p className="mt-3 text-[10px] leading-relaxed text-content-muted">
              Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
            </p>
          </div>
        </div>

        <div className="grid gap-4 bg-coffee px-8 py-5 text-[11px] sm:grid-cols-4">
          <p className="font-bold tracking-[0.22em]">KURIO</p>
          <p className="text-content-muted">Feito para colecionadores, criadores e cultura</p>
          <p className="text-content-muted">contato@email.com</p>
          <p className="text-content-muted">+55 11 4002 8922</p>
        </div>

        <div className="grid gap-8 bg-surface px-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <nav aria-label="Meu perfil">
            <h2 className="text-xs font-bold tracking-wide">Meu perfil</h2>
            <ul className="mt-4 space-y-2.5 text-[11px] text-content-muted">
              {PROFILE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} search={link.search} className="hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Central de ajuda">
            <h2 className="text-xs font-bold tracking-wide">Central de ajuda</h2>
            <ul className="mt-4 space-y-2.5 text-[11px] text-content-muted">
              {HELP_LINKS.map((label) => (
                <li key={label}>
                  <Link to="/em-breve" search={{ area: 'suporte' }} className="hover:text-accent">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Coleções">
            <h2 className="text-xs font-bold tracking-wide">Coleções</h2>
            <ul className="mt-4 space-y-2.5 text-[11px] text-content-muted">
              {COLLECTION_LINKS.map((collection) => (
                <li key={collection.id}>
                  <Link
                    to="/"
                    search={{ collections: collection.id, page: 1 }}
                    className="hover:text-accent"
                  >
                    {collection.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="text-xs font-bold tracking-wide">Redes sociais</h2>
            <ul className="mt-4 flex gap-2">
              {SOCIALS.map(({ label, Icon }) => (
                <li key={label}>
                  <Link
                    to="/em-breve"
                    search={{ area: 'redes' }}
                    aria-label={`${label} (fora do escopo desta demonstração)`}
                    className="flex h-8 w-8 items-center justify-center rounded-sm border border-line text-content-muted hover:border-accent hover:text-accent"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
            <h2 className="mt-6 text-xs font-bold tracking-wide">Carteiras compatíveis</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {['METAMASK', 'WALLETCONNECT', 'COINBASE'].map((wallet) => (
                <li key={wallet} className="rounded-sm bg-coffee px-2 py-1 text-[9px] font-bold tracking-wider text-content-muted">
                  {wallet}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className="bg-ink py-5 text-center text-[10px] tracking-wide text-content-subtle">
        © 2026 Kurio. Propriedade digital para todos.
      </p>
    </footer>
  )
}
