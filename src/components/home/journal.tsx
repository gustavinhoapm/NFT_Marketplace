import { Link } from '@tanstack/react-router'

/**
 * Seção editorial do frame ("Diário da Cunhagem"). Páginas editoriais não
 * fazem parte da entrega, então "Ler mais" leva a uma página que declara o
 * fora-de-escopo — sem aparentar sucesso funcional.
 */
const POSTS = [
  {
    id: 'propriedade',
    image: '/assets/nft/chimp-blazer.jpg',
    date: '12 de setembro',
    read: 'Leitura de 6 min',
    title: 'Como funciona a propriedade de NFTs',
    excerpt: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
  },
  {
    id: 'artistas',
    image: '/assets/nft/ape-sunglasses.jpg',
    date: '13 de setembro',
    read: 'Leitura de 2 min',
    title: '10 artistas digitais para acompanhar',
    excerpt: 'Conheça criadores que moldam a cultura digital.',
  },
  {
    id: 'raridade',
    image: '/assets/nft/ape-bucket.jpg',
    date: '15 de setembro',
    read: 'Leitura de 3 min',
    title: 'Raridade, atributos e procedência',
    excerpt: 'Entenda raridade, procedência, direitos autorais e utilidade.',
  },
  {
    id: 'carteira',
    image: '/assets/nft/monkey-headphones.jpg',
    date: '15 de setembro',
    read: 'Leitura de 2 min',
    title: 'Como proteger sua carteira',
    excerpt: 'Proteja sua carteira, seus ativos e sua identidade.',
  },
]

export function Journal() {
  return (
    <section aria-labelledby="journal-title" className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:px-[30px]">
      <h2 id="journal-title" className="text-center text-2xl font-bold tracking-[0.06em]">
        Diário da Cunhagem
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-xs text-content-muted">
        Histórias, guias e insights para colecionadores sobre o universo da
        propriedade digital.
      </p>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {POSTS.map((post) => (
          <li key={post.id}>
            <article className="flex h-full flex-col overflow-hidden rounded-md border border-line bg-surface">
              <img src={post.image} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="flex flex-1 flex-col p-4">
                <p className="flex flex-wrap gap-x-2 text-[10px] text-content-subtle">
                  <span>{post.date}</span>
                  <span aria-hidden="true">|</span>
                  <span>{post.read}</span>
                </p>
                <h3 className="mt-2 text-xs leading-relaxed font-bold">{post.title}</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-content-muted">{post.excerpt}</p>
                <Link
                  to="/em-breve"
                  search={{ area: 'diario' }}
                  className="mt-auto pt-3 text-[11px] font-bold text-accent hover:underline"
                >
                  Ler mais →
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
