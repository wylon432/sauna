'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatCurrency, formatDateTime, INVENTORY_TYPES } from '@/lib/utils';
import {
  Loader2, Plus, Search, Warehouse, AlertTriangle, ArrowUp, ArrowDown,
  Minus, X, AlertCircle, Filter, History, Package,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string;
  cost: number;
  category: { name: string } | null;
}

interface Movement {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  reference: string | null;
  notes: string | null;
  createdAt: string;
  product: { id: string; name: string; unit: string };
  user: { id: string; name: string };
}

export default function EstoquePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjProductId, setAdjProductId] = useState('');
  const [adjQuantity, setAdjQuantity] = useState('');
  const [adjNotes, setAdjNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [movFilter, setMovFilter] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [prodRes, movRes] = await Promise.all([
        fetch('/api/products?active=true'),
        fetch(`/api/inventory${movFilter ? `?productId=${movFilter}` : ''}`),
      ]);
      if (!prodRes.ok) throw new Error('Erro ao carregar estoque');
      const [prodData, movData] = await Promise.all([
        prodRes.json(),
        movRes.ok ? movRes.json() : [],
      ]);
      setProducts(prodData);
      setMovements(movData);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [movFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdjust = async () => {
    if (!adjProductId) {
      setError('Selecione um produto');
      return;
    }
    const qty = parseInt(adjQuantity);
    if (isNaN(qty) || qty === 0) {
      setError('Informe uma quantidade válida');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: adjProductId,
          quantity: qty,
          notes: adjNotes.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao ajustar estoque');
      }
      setShowAdjustModal(false);
      setAdjProductId('');
      setAdjQuantity('');
      setAdjNotes('');
      fetchData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockProducts = filteredProducts.filter((p) => p.stock <= p.minStock);
  const outOfStock = filteredProducts.filter((p) => p.stock <= 0);

  const getStockColor = (p: Product) => {
    if (p.stock <= 0) return 'text-red-400';
    if (p.stock <= p.minStock) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStockBg = (p: Product) => {
    if (p.stock <= 0) return 'bg-red-600/10 border-red-600/30';
    if (p.stock <= p.minStock) return 'bg-yellow-600/10 border-yellow-600/30';
    return 'bg-green-600/10 border-green-600/30';
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'ENTRADA': return <ArrowUp className="h-3.5 w-3.5 text-green-400" />;
      case 'VENDA': return <ArrowDown className="h-3.5 w-3.5 text-red-400" />;
      case 'AJUSTE': return <Minus className="h-3.5 w-3.5 text-blue-400" />;
      case 'PERDA': return <ArrowDown className="h-3.5 w-3.5 text-red-400" />;
      case 'ESTORNO': return <ArrowUp className="h-3.5 w-3.5 text-yellow-400" />;
      default: return <Minus className="h-3.5 w-3.5 text-dark-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Estoque</h1>
          <p className="text-sm text-dark-400">{products.length} produto(s)</p>
        </div>
        <button onClick={() => setShowAdjustModal(true)} className="btn-gold">
          <Plus className="h-4 w-4" /> Ajustar Estoque
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-600/30 bg-red-600/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {(lowStockProducts.length > 0 || outOfStock.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {outOfStock.length > 0 && (
            <div className="stat-card border-red-600/30 bg-red-600/5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div>
                  <p className="text-xs text-red-400">Sem Estoque</p>
                  <p className="text-xl font-bold text-red-400">{outOfStock.length}</p>
                </div>
              </div>
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <div className="stat-card border-yellow-600/30 bg-yellow-600/5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-xs text-yellow-400">Estoque Baixo</p>
                  <p className="text-xl font-bold text-yellow-400">{lowStockProducts.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-500" />
        <input
          type="text"
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      <div className="card overflow-x-auto p-0">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center py-12">
            <Package className="mb-3 h-10 w-10 text-dark-600" />
            <p className="text-sm text-dark-500">Nenhum produto encontrado</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-dark-800 text-dark-400">
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Categoria</th>
                <th className="px-4 py-3 font-medium text-center">Estoque</th>
                <th className="px-4 py-3 font-medium text-center hidden md:table-cell">Mínimo</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const status = p.stock <= 0 ? 'Esgotado' : p.stock <= p.minStock ? 'Baixo' : 'OK';
                return (
                  <tr key={p.id} className="table-row">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{p.name}</p>
                      <p className="text-xs text-dark-500">{p.unit}</p>
                    </td>
                    <td className="px-4 py-3 text-dark-300 hidden sm:table-cell">{p.category?.name || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-lg font-bold ${getStockColor(p)}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-dark-400 hidden md:table-cell">{p.minStock}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getStockBg(p)} ${
                        p.stock <= 0 ? 'text-red-400' : p.stock <= p.minStock ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-gold-500" />
            <h2 className="text-sm font-semibold text-white">Histórico de Movimentações</h2>
          </div>
          <select value={movFilter} onChange={(e) => setMovFilter(e.target.value)} className="select sm:w-56 text-sm">
            <option value="">Todos os produtos</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {movements.length === 0 ? (
          <div className="py-8 text-center">
            <History className="mx-auto mb-2 h-8 w-8 text-dark-600" />
            <p className="text-sm text-dark-500">Nenhuma movimentação registrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-dark-800 text-dark-400">
                  <th className="pb-3 font-medium">Tipo</th>
                  <th className="pb-3 font-medium">Produto</th>
                  <th className="pb-3 font-medium text-center">Qtd</th>
                  <th className="pb-3 font-medium">Referência</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Usuário</th>
                  <th className="pb-3 font-medium text-right">Data</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="table-row">
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        {getMovementIcon(m.type)}
                        <span className="badge-gray">{m.type}</span>
                      </div>
                    </td>
                    <td className="py-3 font-medium text-white">{m.product.name}</td>
                    <td className="py-3 text-center">
                      <span className={m.quantity > 0 ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                        {m.quantity > 0 ? '+' : ''}{m.quantity}
                      </span>
                    </td>
                    <td className="py-3 text-dark-300 text-xs max-w-[200px] truncate">{m.reference || '—'}</td>
                    <td className="py-3 text-dark-400 hidden sm:table-cell">{m.user.name}</td>
                    <td className="py-3 text-dark-500 text-right text-xs">{formatDateTime(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-xl bg-dark-900 border border-dark-800 sm:rounded-xl">
            <div className="flex items-center justify-between border-b border-dark-800 p-4">
              <h3 className="text-sm font-semibold text-white">Ajustar Estoque</h3>
              <button onClick={() => setShowAdjustModal(false)} className="rounded p-1 text-dark-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="label">Produto</label>
                <select value={adjProductId} onChange={(e) => setAdjProductId(e.target.value)} className="select" autoFocus>
                  <option value="">Selecione um produto</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (atual: {p.stock} {p.unit})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Quantidade</label>
                <p className="mb-1 text-xs text-dark-500">Use positivo para entrada, negativo para saída</p>
                <input
                  type="number"
                  value={adjQuantity}
                  onChange={(e) => setAdjQuantity(e.target.value)}
                  className="input"
                  placeholder="+10 para entrada, -5 para saída"
                />
              </div>
              <div>
                <label className="label">Observações</label>
                <input
                  type="text"
                  value={adjNotes}
                  onChange={(e) => setAdjNotes(e.target.value)}
                  className="input"
                  placeholder="Motivo do ajuste (opcional)"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdjustModal(false)} className="btn-outline flex-1">Cancelar</button>
                <button onClick={handleAdjust} disabled={saving} className="btn-gold flex-1">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
