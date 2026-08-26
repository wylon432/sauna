'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Loader2, Plus, Trash2, CheckCircle, XCircle, Clock, Receipt,
  Wine, Flame, User, Phone, Search, X, AlertTriangle,
} from 'lucide-react';

interface ComandaItem {
  id: string;
  comandaId: string;
  type: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  beverageId: string | null;
  createdAt: string;
}

interface Comanda {
  id: string;
  clientName: string | null;
  clientPhone: string | null;
  saunaEntry: number;
  beveragesTotal: number;
  total: number;
  status: string;
  openedAt: string;
  closedAt: string | null;
  closedBy: string | null;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Beverage {
  id: string;
  name: string;
  price: number;
  currentStock: number;
  category: string;
}

export default function ComandasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '' });
  const [selectedComanda, setSelectedComanda] = useState<Comanda | null>(null);
  const [items, setItems] = useState<ComandaItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [showAddBeverage, setShowAddBeverage] = useState(false);
  const [addBeverageForm, setAddBeverageForm] = useState({ beverageId: '', quantity: 1 });
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchComandas = () => {
    fetch('/api/admin/comandas')
      .then((r) => r.json())
      .then((d) => setComandas(d.comandas || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchBeverages = () => {
    fetch('/api/admin/beverages')
      .then((r) => r.json())
      .then((d) => setBeverages((d.beverages || []).filter((b: Beverage) => b.currentStock > 0 && !b.name.includes('Entrada Sauna'))))
      .catch(() => {});
  };

  const fetchItems = async (comandaId: string) => {
    setLoadingItems(true);
    try {
      const res = await fetch(`/api/admin/comandas/${comandaId}`);
      const data = await res.json();
      setSelectedComanda(data.comanda);
      setItems(data.items || []);
    } catch {}
    setLoadingItems(false);
  };

  useEffect(() => { fetchComandas(); fetchBeverages(); }, []);

  const handleOpenComanda = async () => {
    const res = await fetch('/api/admin/comandas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientName: newClient.name, clientPhone: newClient.phone }),
    });
    const data = await res.json();
    setShowNewForm(false);
    setNewClient({ name: '', phone: '' });
    fetchComandas();
    if (data.comanda) {
      fetchItems(data.comanda.id);
    }
  };

  const handleAddSaunaEntry = async (comandaId: string) => {
    await fetch('/api/admin/comandas/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comandaId,
        type: 'SAUNA',
        name: 'Entrada Sauna',
        quantity: 1,
        unitPrice: 20,
        beverageId: null,
      }),
    });
    fetchItems(comandaId);
    fetchComandas();
  };

  const handleAddBeverage = async () => {
    if (!selectedComanda || !addBeverageForm.beverageId) return;
    const bev = beverages.find((b) => b.id === addBeverageForm.beverageId);
    if (!bev) return;

    await fetch('/api/admin/comandas/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comandaId: selectedComanda.id,
        type: 'BEVERAGE',
        name: bev.name,
        quantity: addBeverageForm.quantity,
        unitPrice: bev.price,
        beverageId: bev.id,
      }),
    });
    setShowAddBeverage(false);
    setAddBeverageForm({ beverageId: '', quantity: 1 });
    fetchItems(selectedComanda.id);
    fetchBeverages();
    fetchComandas();
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!selectedComanda) return;
    await fetch(`/api/admin/comandas/items?itemId=${itemId}`, { method: 'DELETE' });
    fetchItems(selectedComanda.id);
    fetchBeverages();
    fetchComandas();
  };

  const handleCloseComanda = async (comandaId: string) => {
    await fetch(`/api/admin/comandas/${comandaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'close', paymentMethod: 'DINHEIRO' }),
    });
    setSelectedComanda(null);
    setItems([]);
    fetchComandas();
  };

  const handleCancelComanda = async (comandaId: string) => {
    if (!confirm('Cancelar esta comanda?')) return;
    await fetch(`/api/admin/comandas/${comandaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    });
    setSelectedComanda(null);
    setItems([]);
    fetchComandas();
  };

  const filteredComandas = comandas.filter((c) => filter === 'ALL' || c.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-green-100 text-green-700';
      case 'CLOSED': return 'bg-dark-100 text-dark-600';
      case 'CANCELLED': return 'bg-red-100 text-red-600';
      default: return 'bg-dark-100 text-dark-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Aberta';
      case 'CLOSED': return 'Fechada';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-dark-900">Comandas</h1>
          <p className="text-sm text-dark-500">Gerencie as comandas dos clientes na sauna</p>
        </div>
        <button onClick={() => { setShowNewForm(true); fetchBeverages(); }} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" /> Nova Comanda
        </button>
      </div>

      {/* New Comanda Form */}
      {showNewForm && (
        <div className="admin-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-dark-900">Abrir Nova Comanda</h3>
            <button onClick={() => setShowNewForm(false)} className="text-dark-400 hover:text-dark-600"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nome do Cliente</label>
              <input className="input" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} placeholder="Nome (opcional)" />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input className="input" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} placeholder="(00) 00000-0000 (opcional)" />
            </div>
          </div>
          <button onClick={handleOpenComanda} className="btn-primary">
            <CheckCircle className="mr-2 h-4 w-4" /> Abrir Comanda (R$ 20,00 entrada)
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['ALL', 'OPEN', 'CLOSED'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              filter === f ? 'bg-brand-600 text-white' : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
            }`}>
            {f === 'ALL' ? 'Todas' : f === 'OPEN' ? 'Abertas' : 'Fechadas'}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Comandas List */}
        <div className="lg:w-96 space-y-3">
          {filteredComandas.length === 0 ? (
            <div className="admin-card text-center py-12">
              <Receipt className="mx-auto mb-3 h-10 w-10 text-dark-300" />
              <p className="text-dark-400">Nenhuma comanda encontrada.</p>
            </div>
          ) : (
            filteredComandas.map((cmd) => (
              <div
                key={cmd.id}
                onClick={() => { fetchItems(cmd.id); }}
                className={`admin-card cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                  selectedComanda?.id === cmd.id ? 'ring-2 ring-brand-500 shadow-premium-lg' : 'hover:shadow-premium'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
                      <User className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="font-extrabold text-dark-900">{cmd.clientName || 'Cliente avulso'}</p>
                      {cmd.clientPhone && <p className="text-xs text-dark-400">{cmd.clientPhone}</p>}
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${getStatusColor(cmd.status)}`}>
                    {getStatusLabel(cmd.status)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-dark-100 pt-3">
                  <span className="text-sm text-dark-500">
                    {new Date(cmd.openedAt).toLocaleDateString('pt-BR')} {new Date(cmd.openedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-lg font-extrabold text-brand-600">
                    R$ {Number(cmd.total).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Comanda Detail */}
        <div className="flex-1">
          {selectedComanda ? (
            <div className="admin-card">
              <div className="flex items-center justify-between border-b border-dark-100 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-dark-900">{selectedComanda.clientName || 'Cliente avulso'}</h2>
                  {selectedComanda.clientPhone && <p className="text-sm text-dark-400">{selectedComanda.clientPhone}</p>}
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${getStatusColor(selectedComanda.status)}`}>
                  {getStatusLabel(selectedComanda.status)}
                </span>
              </div>

              {/* Items */}
              <div className="mt-4 space-y-2">
                {loadingItems ? (
                  <div className="py-8 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-600" /></div>
                ) : items.length === 0 ? (
                  <div className="py-8 text-center text-dark-400">Nenhum item adicionado.</div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-xl bg-dark-50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.type === 'SAUNA' ? (
                          <Flame className="h-5 w-5 text-orange-500" />
                        ) : (
                          <Wine className="h-5 w-5 text-purple-500" />
                        )}
                        <div>
                          <p className="font-semibold text-dark-900">{item.name}</p>
                          <p className="text-xs text-dark-400">{item.quantity}x R$ {Number(item.unitPrice).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-dark-900">R$ {Number(item.total).toFixed(2)}</span>
                        {selectedComanda.status === 'OPEN' && (
                          <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total */}
              <div className="mt-4 border-t border-dark-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Entrada Sauna</span>
                  <span className="font-semibold text-dark-700">R$ {Number(selectedComanda.saunaEntry).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Bebidas</span>
                  <span className="font-semibold text-dark-700">R$ {Number(selectedComanda.beveragesTotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-dark-200 pt-2">
                  <span className="text-lg font-extrabold text-dark-900">Total</span>
                  <span className="text-xl font-extrabold text-brand-600">R$ {Number(selectedComanda.total).toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              {selectedComanda.status === 'OPEN' && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-dark-100 pt-4">
                  <button onClick={() => handleAddSaunaEntry(selectedComanda.id)} className="flex items-center gap-2 rounded-xl bg-orange-100 px-4 py-2.5 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-200">
                    <Flame className="h-4 w-4" /> + Entrada Sauna (R$ 20)
                  </button>
                  <button onClick={() => { setShowAddBeverage(true); fetchBeverages(); }} className="flex items-center gap-2 rounded-xl bg-purple-100 px-4 py-2.5 text-sm font-semibold text-purple-700 transition-colors hover:bg-purple-200">
                    <Wine className="h-4 w-4" /> + Bebida
                  </button>
                  <button onClick={() => handleCloseComanda(selectedComanda.id)} className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 ml-auto">
                    <CheckCircle className="h-4 w-4" /> Fechar Comanda
                  </button>
                  <button onClick={() => handleCancelComanda(selectedComanda.id)} className="flex items-center gap-2 rounded-xl bg-red-100 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-200">
                    <XCircle className="h-4 w-4" /> Cancelar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="admin-card text-center py-16">
              <Receipt className="mx-auto mb-4 h-12 w-12 text-dark-300" />
              <h3 className="text-lg font-extrabold text-dark-900">Selecione uma comanda</h3>
              <p className="mt-2 text-dark-400">Clique em uma comanda na lista para ver os detalhes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Beverage Modal */}
      {showAddBeverage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddBeverage(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-dark-900">Adicionar Bebida</h3>
              <button onClick={() => setShowAddBeverage(false)} className="text-dark-400 hover:text-dark-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Bebida</label>
                <select className="input" value={addBeverageForm.beverageId} onChange={(e) => setAddBeverageForm({ ...addBeverageForm, beverageId: e.target.value })}>
                  <option value="">Selecione...</option>
                  {beverages.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} - R$ {Number(b.price).toFixed(2)} (Estoque: {b.currentStock})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Quantidade</label>
                <input className="input" type="number" min="1" value={addBeverageForm.quantity} onChange={(e) => setAddBeverageForm({ ...addBeverageForm, quantity: Number(e.target.value) })} />
              </div>
              <button onClick={handleAddBeverage} disabled={!addBeverageForm.beverageId} className="btn-primary w-full disabled:opacity-50">
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
