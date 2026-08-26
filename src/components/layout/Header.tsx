'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Flame, Menu, X, LogIn, User, LogOut, ChevronDown,
  CalendarCheck, UserCircle, LayoutDashboard, Star,
} from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Início' },
  { href: '/sauna', label: 'Sauna' },
  { href: '/aluguel', label: 'Aluguel' },
  { href: '/disponibilidade', label: 'Disponibilidade' },
  { href: '/galeria', label: 'Galeria' },
  { href: '/noticias', label: 'Notícias' },
  { href: '/avaliacoes', label: 'Avaliações' },
  { href: '/contato', label: 'Contato' },
];

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const userRole = (session?.user as any)?.role;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 shadow-lg shadow-black/5 backdrop-blur-xl'
          : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.jpg"
            alt="Sauna e Espaço da Janice"
            className="h-11 w-11 rounded-xl object-cover shadow-lg shadow-brand-600/20 transition-transform duration-300 group-hover:scale-110"
          />
          <div className="hidden sm:block">
            <span className="text-base font-extrabold tracking-tight text-dark-900">
              Sauna e Espaço
            </span>
            <span className="ml-1 text-base font-extrabold tracking-tight text-brand-600">
              da Janice
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                isActive(link.href)
                  ? 'text-brand-600'
                  : 'text-dark-500 hover:text-dark-900 hover:bg-dark-50'
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-brand-600" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 rounded-xl border-2 border-dark-100 bg-white px-4 py-2 text-sm font-semibold text-dark-700 transition-all duration-200 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                  <UserCircle className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">{session.user?.name}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-60 origin-top-right rounded-2xl border border-dark-100 bg-white py-2 shadow-2xl shadow-black/10 animate-fade-in">
                    <div className="border-b border-dark-100 px-5 py-3">
                      <p className="text-sm font-bold text-dark-900">{session.user?.name}</p>
                      <p className="text-xs text-dark-500 truncate">{session.user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/minha-conta" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-dark-600 transition-colors hover:bg-brand-50 hover:text-brand-700">
                        <User className="h-4 w-4" /> Meu perfil
                      </Link>
                      <Link href="/minhas-reservas" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-dark-600 transition-colors hover:bg-brand-50 hover:text-brand-700">
                        <CalendarCheck className="h-4 w-4" /> Minhas reservas
                      </Link>
                      {userRole === 'ADMIN' && (
                        <Link href="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-dark-600 transition-colors hover:bg-brand-50 hover:text-brand-700">
                          <LayoutDashboard className="h-4 w-4" /> Admin
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-dark-100 pt-1">
                      <button onClick={() => { setProfileOpen(false); signOut(); }} className="flex w-full items-center gap-3 px-5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
                        <LogOut className="h-4 w-4" /> Sair
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition-all duration-300 hover:bg-brand-700 hover:shadow-xl hover:-translate-y-0.5">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Entrar</span>
            </Link>
          )}

          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-xl p-2.5 text-dark-600 transition-colors hover:bg-dark-100 lg:hidden">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 top-16 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-white shadow-2xl lg:hidden animate-fade-in">
            <nav className="mx-auto max-w-7xl space-y-1 px-4 py-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center rounded-xl px-4 py-4 text-base font-semibold transition-all duration-200 ${
                    isActive(link.href)
                      ? 'bg-brand-50 text-brand-700 border-l-4 border-brand-600'
                      : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!session && (
                <div className="mt-4 border-t border-dark-100 pt-4">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-base font-bold text-white"
                  >
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
