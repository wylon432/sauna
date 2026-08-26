import Link from 'next/link';
import { Flame, Phone, Mail, MapPin, Clock } from 'lucide-react';

const quickLinks = [
  { href: '/', label: 'Início' },
  { href: '/sauna', label: 'Sauna' },
  { href: '/aluguel', label: 'Aluguel' },
  { href: '/disponibilidade', label: 'Disponibilidade' },
  { href: '/galeria', label: 'Galeria' },
  { href: '/noticias', label: 'Notícias' },
  { href: '/avaliacoes', label: 'Avaliações' },
  { href: '/contato', label: 'Contato' },
];

export default function Footer() {
  return (
    <footer className="bg-dark-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <span className="text-base font-extrabold">Sauna e Espaço</span>
                <span className="ml-1 text-base font-extrabold text-brand-400">da Janice</span>
              </div>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-dark-400">
              Desfrute de momentos de relaxamento e lazer. Sauna, piscina
              e aluguel de espaço para eventos e festas com infraestrutura completa.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-400">
              Links Rápidos
            </h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group flex items-center text-sm text-dark-400 transition-colors duration-200 hover:text-white">
                    <span className="mr-2 h-px w-0 bg-brand-500 transition-all duration-200 group-hover:w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-400">
              Contato
            </h3>
            <ul className="mt-5 space-y-4">
              <li className="flex items-start gap-3 text-sm text-dark-400">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dark-800">
                  <Phone className="h-4 w-4 text-brand-400" />
                </div>
                <span>(37) 99939-2529</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-dark-400">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dark-800">
                  <Mail className="h-4 w-4 text-brand-400" />
                </div>
                <span>contato@saunaespacodajance.com.br</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-dark-400">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dark-800">
                  <MapPin className="h-4 w-4 text-brand-400" />
                </div>
                <span>Rua Cecílio Bernardes, 2245 - Marília (rua da cobeb)</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-dark-400">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dark-800">
                  <Clock className="h-4 w-4 text-brand-400" />
                </div>
                <span>Terça e Quarta: 17h30 às 22h</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-dark-800 pt-8 text-center">
          <p className="text-xs text-dark-500">
            &copy; {new Date().getFullYear()} Sauna e Espaço da Janice. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
