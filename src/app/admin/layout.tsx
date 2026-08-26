'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, Flame, Key, CalendarDays, DollarSign, Users,
  Star, Wine, ImageIcon, Newspaper, AlertTriangle, FileText,
  ShieldCheck, Settings, Menu, X, ChevronLeft, LogOut, Loader2,
  ClipboardList,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/comandas', label: 'Comandas', icon: ClipboardList },
  { href: '/admin/sauna', label: 'Sauna', icon: Flame },
  { href: '/admin/aluguel', label: 'Aluguel', icon: Key },
  { href: '/admin/calendario', label: 'Calendário', icon: CalendarDays },
  { href: '/admin/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/admin/pagamentos', label: 'Pagamentos', icon: DollarSign },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/avaliacoes', label: 'Avaliações', icon: Star },
  { href: '/admin/bebidas', label: 'Bebidas', icon: Wine },
  { href: '/admin/galeria', label: 'Galeria', icon: ImageIcon },
  { href: '/admin/noticias', label: 'Notícias', icon: Newspaper },
  { href: '/admin/avisos', label: 'Avisos', icon: AlertTriangle },
  { href: '/admin/termos', label: 'Termos', icon: FileText },
  { href: '/admin/regras', label: 'Regras', icon: ShieldCheck },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    else if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') router.push('/');
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-950">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!session || (session?.user as any)?.role !== 'ADMIN') return null;

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dark-100">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-dark-950 text-white transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex h-16 items-center justify-between border-b border-dark-800 px-4">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Flame className="h-4 w-4" />
              </div>
              <span className="text-sm font-extrabold">Admin</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden rounded-lg p-1.5 text-dark-400 hover:bg-dark-800 hover:text-white lg:block">
            <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-dark-400 hover:bg-dark-800 hover:text-white lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`mx-2 mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  active ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-dark-400 hover:bg-dark-800 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`} title={collapsed ? item.label : undefined}>
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-dark-800 p-3">
          <Link href="/" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-dark-400 transition-colors hover:bg-dark-800 hover:text-white ${collapsed ? 'justify-center' : ''}`}>
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Voltar ao site</span>}
          </Link>
        </div>
      </aside>

      <div className={`flex flex-1 flex-col transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <header className="flex h-16 items-center justify-between border-b border-dark-200 bg-white px-4 shadow-sm lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 text-dark-600 hover:bg-dark-100 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-lg font-extrabold text-dark-900">Painel Administrativo</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-dark-900">{session.user?.name}</p>
              <p className="text-xs text-dark-500">{session.user?.email}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 font-bold text-sm">
              {session.user?.image ? (
                <img src={session.user.image} alt="" className="h-10 w-10 rounded-xl" />
              ) : (
                (session.user?.name || 'A')[0].toUpperCase()
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
