'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, ShoppingCart, Users, Package, Warehouse,
  DollarSign, FileText, BarChart3, Shield, ClipboardList,
  Settings, Menu, X, ChevronLeft, LogOut, Loader2, Flame,
  CreditCard, TrendingUp, AlertTriangle,
} from 'lucide-react';

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/comandas', label: 'Comandas', icon: ShoppingCart },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/estoque', label: 'Estoque', icon: Warehouse },
  { href: '/admin/caixa', label: 'Caixa', icon: DollarSign },
  { href: '/admin/financeiro', label: 'Financeiro', icon: TrendingUp },
  { href: '/admin/despesas', label: 'Despesas', icon: FileText },
  { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/admin/usuarios', label: 'Usuários', icon: Shield },
  { href: '/admin/auditoria', label: 'Auditoria', icon: ClipboardList },
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
  }, [status, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-950">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (!session) return null;

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-dark-900 border-r border-dark-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className={`flex h-14 items-center border-b border-dark-800 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-gold-500" />
              <span className="text-sm font-bold text-white">Gestão</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden rounded p-1 text-dark-500 hover:text-white lg:block">
            <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={() => setSidebarOpen(false)} className="rounded p-1 text-dark-500 hover:text-white lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`${active ? 'sidebar-link-active' : 'sidebar-link'} ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.label : undefined}>
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-dark-800 p-2">
          <Link href="/" className={`${collapsed ? 'justify-center px-2' : ''} sidebar-link`}>
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </Link>
        </div>
      </aside>

      <div className={`flex flex-1 flex-col transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <header className="flex h-14 items-center justify-between border-b border-dark-800 bg-dark-900/80 px-4 backdrop-blur-sm lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="rounded p-2 text-dark-400 hover:text-white lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block">
            <h1 className="text-sm font-bold text-white">Painel Administrativo</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{session.user?.name}</p>
              <p className="text-xs text-dark-500">{(session.user as any)?.role}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-600/20 text-gold-500 text-xs font-bold">
              {(session.user?.name || 'U')[0].toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
