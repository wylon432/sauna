'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { formatDateTime } from '@/lib/utils';
import {
  Loader2, ClipboardList, Shield, ChevronLeft, ChevronRight, X, AlertCircle,
  Search, Filter,
} from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: string | null;
  ip: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AuditData {
  logs: AuditLog[];
  pagination: Pagination;
}

const ACTION_OPTIONS = ['CREATE', 'UPDATE', 'DELETE', 'CLOSE', 'OPEN', 'LOGIN', 'LOGOUT', 'VIEW'];
const RESOURCE_OPTIONS = ['USER', 'ORDER', 'PRODUCT', 'EXPENSE', 'CASH_REGISTER', 'SETTING', 'CUSTOMER', 'INVENTORY', 'AUTH'];

export default function AuditoriaPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '50');
      if (userFilter) params.set('userId', userFilter);
      if (actionFilter) params.set('action', actionFilter);
      if (resourceFilter) params.set('resource', resourceFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const res = await fetch(`/api/audit?${params.toString()}`);
      if (!res.ok) throw new Error('Erro ao carregar auditoria');
      setData(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, userFilter, actionFilter, resourceFilter, startDate, endDate]);

  useEffect(() => { if (isAdmin) fetchLogs(); }, [fetchLogs, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/users').then((r) => r.ok ? r.json() : []).then(setUsers).catch(() => {});
  }, [isAdmin]);

  const ACTION_BADGE: Record<string, string> = {
    CREATE: 'badge-green',
    UPDATE: 'badge-blue',
    DELETE: 'badge-red',
    CLOSE: 'badge-yellow',
    OPEN: 'badge-gold',
    LOGIN: 'badge-blue',
    LOGOUT: 'badge-gray',
    VIEW: 'badge-gray',
  };

  if (!isAdmin) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto mb-3 h-10 w-10 text-dark-600" />
          <p className="text-sm text-dark-500">Acesso restrito a administradores</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Auditoria</h1>
          <p className="text-sm text-dark-400">{data ? `${data.pagination.total} registro(s)` : ''}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-600/30 bg-red-600/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="card">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[150px]">
            <label className="label">
              <span className="flex items-center gap-1"><Filter className="h-3 w-3" /> Usuário</span>
            </label>
            <select value={userFilter} onChange={(e) => { setUserFilter(e.target.value); setPage(1); }} className="select">
              <option value="">Todos</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="min-w-[120px]">
            <label className="label">Ação</label>
            <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className="select">
              <option value="">Todas</option>
              {ACTION_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="min-w-[120px]">
            <label className="label">Recurso</label>
            <select value={resourceFilter} onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }} className="select">
              <option value="">Todos</option>
              {RESOURCE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Início</label>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="input w-auto" />
          </div>
          <div>
            <label className="label">Fim</label>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="input w-auto" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
        </div>
      ) : !data || data.logs.length === 0 ? (
        <div className="card flex flex-col items-center py-12">
          <ClipboardList className="mb-3 h-10 w-10 text-dark-600" />
          <p className="text-sm text-dark-500">Nenhum registro encontrado</p>
        </div>
      ) : (
        <>
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-dark-800 text-dark-400">
                  <th className="px-4 py-3 font-medium">Data/Hora</th>
                  <th className="px-4 py-3 font-medium">Usuário</th>
                  <th className="px-4 py-3 font-medium">Ação</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Recurso</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Detalhes</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">IP</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((log) => (
                  <tr key={log.id} className="table-row">
                    <td className="px-4 py-3 text-dark-300 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{log.user?.name || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={ACTION_BADGE[log.action] || 'badge-gray'}>{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-dark-300 hidden sm:table-cell">
                      <span className="badge-gray">{log.resource}</span>
                    </td>
                    <td className="px-4 py-3 text-dark-400 hidden md:table-cell max-w-[300px] truncate">
                      {log.details || '—'}
                    </td>
                    <td className="px-4 py-3 text-dark-500 hidden lg:table-cell">{log.ip || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-dark-500">
                Página {data.pagination.page} de {data.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-ghost disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={page === data.pagination.totalPages}
                  className="btn-ghost disabled:opacity-50"
                >
                  Próxima <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
