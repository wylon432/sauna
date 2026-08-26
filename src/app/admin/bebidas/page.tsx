'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Loader2,
  Plus,
  Save,
  Trash2,
  Edit2,
  AlertTriangle,
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  X,
  History,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Beverage {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  minStock: number;
  currentStock: number;
  active: boolean;
}

interface Movement {
  id: string;
  type: string;
  quantity: number;
  reason?: string;
  createdAt: string;
  beverage: { name: string };
}

interface Consumption {
  id: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  paymentStatus: string;
  createdAt: string;
  beverage: { name: string };
  user?: { name: string };
}

export default function BebidasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBeverage, setEditingBeverage] = useState<Beverage | null>(null);
  const [form, setForm] = useState({ name: '', category: 'BEBIDA', unit: 'un', price: 0, minStock: 5, currentStock: 0 });
  const [showMovement, setShowMovement] = useState<string | null>(null);
  const [movementForm, setMovementForm] = useState({ type: 'ADD', quantity: 0, reason: '' });
  const [showConsumption, setShowConsumption] = useState<string | null>(null);
  const [consumptionForm, setConsumptionForm] = useState({ quantity: 1 });
  const [showHistory, setShowHistory] = useState(false);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchBeverages = () => {
    fetch('/api/admin/beverages')
      .then((r) => r.json())
      .then((d) => setBeverages(d.beverages || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBeverages(); }, []);

  const handleSave = async () => {
    const url = editingBeverage ? `/api/admin/beverages/${editingBeverage.id}` : '/api/admin/beverages';
    const method = editingBeverage ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setEditingBeverage(null);
    setForm({ name: '', category: 'BEBIDA', unit: 'un', price: 0, minStock: 5, currentStock: 0 });
    fetchBeverages();
  };

  const handleMovement = async (beverageId: string) => {
    await fetch(`/api/admin/beverages/${beverageId}/movement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movementForm),
    });
    setShowMovement(null);
    setMovementForm({ type: 'ADD', quantity: 0, reason: '' });
    fetchBeverages();
  };

  const handleConsumption = async (beverageId: string) => {
    await fetch(`/api/admin/beverages/${beverageId}/consumption`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consumptionForm),
    });
    setShowConsumption(null);
    setConsumptionForm({ quantity: 1 });
    fetchBeverages();
  };

  const loadHistory = async () => {
    const [m, c] = await Promise.all([
      fetch('/api/admin/beverages/history?type=movements').then((r) => r.json()),
      fetch('/api/admin/beverages/history?type=consumptions').then((r) => r.json()),
    ]);
    setMovements(m.movements || []);
    setConsumptions(c.consumptions || []);
    setShowHistory(true);
  };

  const lowStock = beverages.filter((b) => b.currentStock <= b.minStock);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-sauna-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bebidas</h1>
        <div className="flex gap-2">
          <button onClick={loadHistory} className="btn-secondary"><History className="mr-2 h-4 w-4" /> Histórico</button>
          <button onClick={() => { setEditingBeverage(null); setForm({ name: '', category: 'BEBIDA', unit: 'un', price: 0, minStock: 5, currentStock: 0 }); setShowForm(true); }} className="btn-primary">
            <Plus className="mr-2 h-4 w-4" /> Nova Bebida
          </button>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="admin-card border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Estoque Baixo</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((b) => (
              <span key={b.id} className="badge bg-yellow-200 text-yellow-900">{b.name}: {b.currentStock} {b.unit}</span>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="admin-card space-y-4">
          <h3 className="font-semibold">{editingBeverage ? 'Editar Bebida' : 'Nova Bebida'}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label">Nome</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Categoria</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="BEBIDA">Bebida</option>
                <option value="COMIDA">Comida</option>
                <option value="OUTROS">Outros</option>
              </select>
            </div>
            <div>
              <label className="label">Unidade</label>
              <input className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div>
              <label className="label">Preço (R$)</label>
              <input className="input" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Estoque Mínimo</label>
              <input className="input" type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Estoque Atual</label>
              <input className="input" type="number" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary"><Save className="mr-2 h-4 w-4" /> Salvar</button>
            <button onClick={() => { setShowForm(false); setEditingBeverage(null); }} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      <div className="admin-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header">Nome</th>
              <th className="table-header">Categoria</th>
              <th className="table-header">Preço</th>
              <th className="table-header">Estoque</th>
              <th className="table-header">Status</th>
              <th className="table-header">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {beverages.map((b) => (
              <tr key={b.id}>
                <td className="table-cell font-medium">{b.name}</td>
                <td className="table-cell">{b.category}</td>
                <td className="table-cell">{formatCurrency(b.price)}</td>
                <td className="table-cell">{b.currentStock} {b.unit}</td>
                <td className="table-cell">
                  <span className={`badge ${b.currentStock <= b.minStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {b.currentStock <= b.minStock ? 'Estoque Baixo' : 'OK'}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingBeverage(b); setForm({ name: b.name, category: b.category, unit: b.unit, price: b.price, minStock: b.minStock, currentStock: b.currentStock }); setShowForm(true); }} className="rounded p-1 text-blue-600 hover:bg-blue-50"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => { setShowMovement(b.id); setMovementForm({ type: 'ADD', quantity: 0, reason: '' }); }} className="rounded p-1 text-green-600 hover:bg-green-50" title="Movimentar"><ArrowUpCircle className="h-4 w-4" /></button>
                    <button onClick={() => { setShowConsumption(b.id); setConsumptionForm({ quantity: 1 }); }} className="rounded p-1 text-orange-600 hover:bg-orange-50" title="Registrar Consumo"><Package className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Movimentar Estoque</h3>
              <button onClick={() => setShowMovement(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Tipo</label>
                <select className="input" value={movementForm.type} onChange={(e) => setMovementForm({ ...movementForm, type: e.target.value })}>
                  <option value="ADD">Entrada</option>
                  <option value="REMOVE">Saída</option>
                  <option value="ADJUST">Ajuste</option>
                </select>
              </div>
              <div>
                <label className="label">Quantidade</label>
                <input className="input" type="number" value={movementForm.quantity} onChange={(e) => setMovementForm({ ...movementForm, quantity: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Motivo</label>
                <input className="input" value={movementForm.reason} onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })} />
              </div>
              <button onClick={() => handleMovement(showMovement)} className="btn-primary w-full">Registrar</button>
            </div>
          </div>
        </div>
      )}

      {showConsumption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Registrar Consumo</h3>
              <button onClick={() => setShowConsumption(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Quantidade</label>
                <input className="input" type="number" min="1" value={consumptionForm.quantity} onChange={(e) => setConsumptionForm({ ...consumptionForm, quantity: Number(e.target.value) })} />
              </div>
              <button onClick={() => handleConsumption(showConsumption)} className="btn-primary w-full">Registrar Consumo</button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Histórico</h3>
              <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Movimentações</h4>
              {movements.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded border p-2 text-sm">
                  <span>{m.beverage?.name} - {m.type === 'ADD' ? 'Entrada' : m.type === 'REMOVE' ? 'Saída' : 'Ajuste'}: {m.quantity}</span>
                  <span className="text-gray-500">{formatDate(m.createdAt)}</span>
                </div>
              ))}
              <h4 className="font-semibold">Consumos</h4>
              {consumptions.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded border p-2 text-sm">
                  <span>{c.beverage?.name} - Qtd: {c.quantity} - {formatCurrency(c.totalValue)} {c.user?.name ? `(${c.user.name})` : ''}</span>
                  <span className="text-gray-500">{formatDate(c.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
