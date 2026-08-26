'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Loader2,
  Search,
  Eye,
  UserCheck,
  UserX,
  X,
  Mail,
  Phone,
} from 'lucide-react';
import { formatDate, RESERVATION_STATUS } from '@/lib/utils';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  active: boolean;
  createdAt: string;
  rentalReservations: { id: string; date: string; status: string; totalValue: number; package: { name: string } }[];
  saunaReservations: { id: string; date: string; status: string }[];
  payments: { id: string; amount: number; status: string }[];
}

export default function ClientesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    fetch('/api/admin/clients')
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggleActive = async (id: string) => {
    await fetch(`/api/admin/clients/${id}/toggle`, { method: 'PUT' });
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
    if (selectedUser?.id === id) setSelectedUser((prev) => prev ? { ...prev, active: !prev.active } : null);
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-sauna-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>

      <div className="admin-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-10"
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header">Nome</th>
              <th className="table-header">Email</th>
              <th className="table-header">Telefone</th>
              <th className="table-header">Tipo</th>
              <th className="table-header">Status</th>
              <th className="table-header">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="table-cell font-medium">{u.name}</td>
                <td className="table-cell">{u.email}</td>
                <td className="table-cell">{u.phone || '-'}</td>
                <td className="table-cell">
                  <span className={`badge ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="table-cell">
                  <button onClick={() => handleToggleActive(u.id)} className={`badge cursor-pointer ${u.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {u.active ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td className="table-cell">
                  <button onClick={() => setSelectedUser(u)} className="rounded p-1 text-blue-600 hover:bg-blue-50">
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="table-cell text-center text-gray-500">Nenhum cliente encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Detalhes do Cliente</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="flex items-center gap-1 font-medium"><Mail className="h-3 w-3" /> {selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="flex items-center gap-1 font-medium"><Phone className="h-3 w-3" /> {selectedUser.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cadastro</p>
                  <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>

              {selectedUser.rentalReservations.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold">Reservas de Aluguel</h4>
                  <div className="space-y-1">
                    {selectedUser.rentalReservations.map((r) => (
                      <div key={r.id} className="flex items-center justify-between rounded border p-2 text-sm">
                        <span>{formatDate(r.date)} - {r.package?.name}</span>
                        <span className={`badge ${RESERVATION_STATUS[r.status]?.color}`}>{RESERVATION_STATUS[r.status]?.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedUser.saunaReservations.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold">Reservas de Sauna</h4>
                  <div className="space-y-1">
                    {selectedUser.saunaReservations.map((r) => (
                      <div key={r.id} className="flex items-center justify-between rounded border p-2 text-sm">
                        <span>{formatDate(r.date)}</span>
                        <span className={`badge ${r.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
