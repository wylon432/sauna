'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Loader2,
  Check,
  X,
  Eye,
  Ban,
  Save,
  Edit2,
  Package,
} from 'lucide-react';
import { formatDate, formatCurrency, RESERVATION_STATUS } from '@/lib/utils';

interface RentalReservation {
  id: string;
  date: string;
  endDate?: string;
  status: string;
  totalValue: number;
  notes?: string;
  adminNotes?: string;
  user: { id: string; name: string; email: string; phone?: string };
  package: { name: string; days: number; price: number };
  payments: { id: string; amount: number; status: string; method: string }[];
}

interface RentalPackage {
  id: string;
  name: string;
  description: string;
  days: number;
  includesSauna: boolean;
  saunaHours: number;
  price: number;
  active: boolean;
}

export default function AluguelPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reservations, setReservations] = useState<RentalReservation[]>([]);
  const [packages, setPackages] = useState<RentalPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedReservation, setSelectedReservation] = useState<RentalReservation | null>(null);
  const [editingPackage, setEditingPackage] = useState<RentalPackage | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pkgForm, setPkgForm] = useState({ name: '', description: '', days: 1, price: 0, includesSauna: false, saunaHours: 0 });
  const [tab, setTab] = useState<'reservations' | 'packages'>('reservations');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchData = () => {
    Promise.all([
      fetch('/api/admin/rental/reservations').then((r) => r.json()),
      fetch('/api/admin/rental/packages').then((r) => r.json()),
    ])
      .then(([res, pkgs]) => {
        setReservations(res.reservations || []);
        setPackages(pkgs.packages || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (id: string, newStatus: string, reason?: string) => {
    await fetch(`/api/admin/rental/reservations/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, reason }),
    });
    fetchData();
  };

  const handleSavePackage = async () => {
    const url = editingPackage ? `/api/admin/rental/packages/${editingPackage.id}` : '/api/admin/rental/packages';
    const method = editingPackage ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pkgForm),
    });
    setEditingPackage(null);
    setShowForm(false);
    setPkgForm({ name: '', description: '', days: 1, price: 0, includesSauna: false, saunaHours: 0 });
    fetchData();
  };

  const filtered = filter === 'ALL' ? reservations : reservations.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-sauna-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Aluguel</h1>

      <div className="flex gap-2 border-b">
        <button onClick={() => setTab('reservations')} className={`border-b-2 px-4 py-3 text-sm font-medium ${tab === 'reservations' ? 'border-sauna-600 text-sauna-700' : 'border-transparent text-gray-500'}`}>
          Reservas
        </button>
        <button onClick={() => setTab('packages')} className={`border-b-2 px-4 py-3 text-sm font-medium ${tab === 'packages' ? 'border-sauna-600 text-sauna-700' : 'border-transparent text-gray-500'}`}>
          Pacotes
        </button>
      </div>

      {tab === 'reservations' && (
        <>
          <div className="flex flex-wrap gap-2">
            {['ALL', 'REQUESTED', 'PRE_RESERVED', 'AWAITING_SIGNAL', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map((s) => (
              <button key={s} onClick={() => setFilter(s)} className={`badge cursor-pointer ${filter === s ? 'bg-sauna-600 text-white' : RESERVATION_STATUS[s]?.color || 'bg-gray-100'}`}>
                {s === 'ALL' ? 'Todas' : RESERVATION_STATUS[s]?.label || s}
              </button>
            ))}
          </div>

          <div className="admin-card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Cliente</th>
                  <th className="table-header">Pacote</th>
                  <th className="table-header">Data</th>
                  <th className="table-header">Valor</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="table-cell font-medium">{r.user?.name}</td>
                    <td className="table-cell">{r.package?.name}</td>
                    <td className="table-cell">{formatDate(r.date)}</td>
                    <td className="table-cell">{formatCurrency(r.totalValue)}</td>
                    <td className="table-cell">
                      <span className={`badge ${RESERVATION_STATUS[r.status]?.color || 'bg-gray-100'}`}>
                        {RESERVATION_STATUS[r.status]?.label || r.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button onClick={() => setSelectedReservation(r)} className="rounded p-1 text-blue-600 hover:bg-blue-50">
                          <Eye className="h-4 w-4" />
                        </button>
                        {r.status === 'REQUESTED' && (
                          <>
                            <button onClick={() => handleStatusChange(r.id, 'CONFIRMED')} className="rounded p-1 text-green-600 hover:bg-green-50" title="Aprovar">
                              <Check className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleStatusChange(r.id, 'CANCELLED')} className="rounded p-1 text-red-600 hover:bg-red-50" title="Cancelar">
                              <Ban className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {r.status === 'PRE_RESERVED' && (
                          <button onClick={() => handleStatusChange(r.id, 'CANCELLED')} className="rounded p-1 text-red-600 hover:bg-red-50" title="Cancelar">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="table-cell text-center text-gray-500">Nenhuma reserva encontrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'packages' && (
        <>
          <button
            onClick={() => { setEditingPackage(null); setShowForm(true); setPkgForm({ name: '', description: '', days: 1, price: 0, includesSauna: false, saunaHours: 0 }); }}
            className="btn-primary"
          >
            <Package className="mr-2 h-4 w-4" /> Novo Pacote
          </button>

          {(editingPackage || showForm) && (
            <div className="admin-card space-y-4">
              <h3 className="font-semibold">{editingPackage ? 'Editar Pacote' : 'Novo Pacote'}</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="label">Nome</label>
                  <input className="input" value={pkgForm.name} onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">Descrição</label>
                  <input className="input" value={pkgForm.description} onChange={(e) => setPkgForm({ ...pkgForm, description: e.target.value })} />
                </div>
                <div>
                  <label className="label">Dias</label>
                  <input className="input" type="number" value={pkgForm.days} onChange={(e) => setPkgForm({ ...pkgForm, days: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label">Preço (R$)</label>
                  <input className="input" type="number" step="0.01" value={pkgForm.price} onChange={(e) => setPkgForm({ ...pkgForm, price: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label">Inclui Sauna</label>
                  <select className="input" value={pkgForm.includesSauna ? '1' : '0'} onChange={(e) => setPkgForm({ ...pkgForm, includesSauna: e.target.value === '1' })}>
                    <option value="0">Não</option>
                    <option value="1">Sim</option>
                  </select>
                </div>
                <div>
                  <label className="label">Horas de Sauna</label>
                  <input className="input" type="number" value={pkgForm.saunaHours} onChange={(e) => setPkgForm({ ...pkgForm, saunaHours: Number(e.target.value) })} />
                </div>
              </div>
              <button onClick={handleSavePackage} className="btn-primary"><Save className="mr-2 h-4 w-4" /> Salvar</button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((p) => (
              <div key={p.id} className="admin-card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="text-sm text-gray-500">{p.description}</p>
                    <p className="mt-2 text-lg font-bold text-sauna-600">{formatCurrency(p.price)}</p>
                    <p className="text-xs text-gray-500">{p.days} dia(s) {p.includesSauna && `- ${p.saunaHours}h sauna`}</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingPackage(p);
                      setShowForm(true);
                      setPkgForm({ name: p.name, description: p.description, days: p.days, price: p.price, includesSauna: p.includesSauna, saunaHours: p.saunaHours });
                    }}
                    className="rounded p-1 text-gray-400 hover:text-sauna-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Detalhes da Reserva</h3>
              <button onClick={() => setSelectedReservation(null)} className="text-gray-400 hover:text-gray-600">X</button>
            </div>
            <div className="space-y-3 text-sm">
              <p><strong>Cliente:</strong> {selectedReservation.user?.name}</p>
              <p><strong>Email:</strong> {selectedReservation.user?.email}</p>
              <p><strong>Telefone:</strong> {selectedReservation.user?.phone || '-'}</p>
              <p><strong>Pacote:</strong> {selectedReservation.package?.name}</p>
              <p><strong>Data:</strong> {formatDate(selectedReservation.date)}</p>
              {selectedReservation.endDate && <p><strong>Data Fim:</strong> {formatDate(selectedReservation.endDate)}</p>}
              <p><strong>Valor:</strong> {formatCurrency(selectedReservation.totalValue)}</p>
              <p><strong>Status:</strong> <span className={`badge ${RESERVATION_STATUS[selectedReservation.status]?.color}`}>{RESERVATION_STATUS[selectedReservation.status]?.label}</span></p>
              {selectedReservation.notes && <p><strong>Notas:</strong> {selectedReservation.notes}</p>}
              {selectedReservation.adminNotes && <p><strong>Notas Admin:</strong> {selectedReservation.adminNotes}</p>}
              {selectedReservation.payments?.length > 0 && (
                <div>
                  <strong>Pagamentos:</strong>
                  {selectedReservation.payments.map((pay) => (
                    <div key={pay.id} className="ml-2 mt-1 text-gray-600">
                      {formatCurrency(pay.amount)} - {pay.method} ({pay.status})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
