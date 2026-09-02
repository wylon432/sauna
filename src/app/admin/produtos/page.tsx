'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  Loader2, Plus, Search, Package, Edit2, Trash2, X, AlertCircle, Tag,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  code: string | null;
  active: boolean;
  categoryId: string | null;
  category: { id: string; name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

interface FormData {
  name: string;
  categoryId: string;
  price: string;
  cost: string;
  stock: string;
  minStock: string;
  unit: string;
  code: string;
}

const emptyForm: FormData = { name: '', categoryId: '', price: '', cost: '', stock: '', minStock: '', unit: 'UN', code: '' };

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryFilter) params.set('categoryId', categoryFilter);
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`/api/products?${params.toString()}`),
        fetch('/api/categories'),
      ]);
      if (!productsRes.ok) throw new Error('Erro ao carregar produtos');
      const [productsData, categoriesData] = await Promise.all([
        productsRes.json(),
        categoriesRes.ok ? categoriesRes.json() : [],
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      categoryId: p.categoryId || '',
      price: (p.price / 100).toFixed(2),
      cost: (p.cost / 100).toFixed(2),
      stock: p.stock.toString(),
      minStock: p.minStock.toString(),
      unit: p.unit,
      code: p.code || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Nome é obrigatório';
    const price = parseFloat(form.price.replace(',', '.'));
    if (isNaN(price) || price < 0) errs.price = 'Preço inválido';
    const cost = parseFloat(form.cost.replace(',', '.'));
    if (isNaN(cost) || cost < 0) errs.cost = 'Custo inválido';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        categoryId: form.categoryId || null,
        price: Math.round(parseFloat(form.price.replace(',', '.')) * 100),
        cost: Math.round(parseFloat(form.cost.replace(',', '.')) * 100),
        stock: parseInt(form.stock) || 0,
        minStock: parseInt(form.minStock) || 0,
        unit: form.unit.trim() || 'UN',
        code: form.code.trim() || null,
      };

      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar');
      }
      setShowModal(false);
      fetchData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Desativar produto "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao remover');
      }
      fetchData();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const priceCents = Math.round(parseFloat(form.price.replace(',', '.')) * 100) || 0;
  const costCents = Math.round(parseFloat(form.cost.replace(',', '.')) * 100) || 0;
  const margin = priceCents > 0 ? ((priceCents - costCents) / priceCents * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Produtos</h1>
          <p className="text-sm text-dark-400">{products.length} produto(s)</p>
        </div>
        <button onClick={openCreate} className="btn-gold">
          <Plus className="h-4 w-4" /> Novo Produto
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-600/30 bg-red-600/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-500" />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="select sm:w-48">
          <option value="">Todas categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
        </div>
      ) : products.length === 0 ? (
        <div className="card flex flex-col items-center py-12">
          <Package className="mb-3 h-10 w-10 text-dark-600" />
          <p className="text-sm text-dark-500">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-dark-800 text-dark-400">
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Categoria</th>
                <th className="px-4 py-3 font-medium text-right">Preço</th>
                <th className="px-4 py-3 font-medium text-right hidden md:table-cell">Custo</th>
                <th className="px-4 py-3 font-medium text-center">Estoque</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const stockColor = p.stock <= 0 ? 'text-red-400' : p.stock <= p.minStock ? 'text-yellow-400' : 'text-green-400';
                return (
                  <tr key={p.id} className="table-row">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{p.name}</p>
                      <p className="text-xs text-dark-500">{p.unit}{p.code ? ` · ${p.code}` : ''}</p>
                    </td>
                    <td className="px-4 py-3 text-dark-300 hidden sm:table-cell">
                      {p.category ? (
                        <span className="badge-gold"><Tag className="mr-1 h-3 w-3" />{p.category.name}</span>
                      ) : (
                        <span className="text-dark-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gold-400">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3 text-right text-dark-300 hidden md:table-cell">{formatCurrency(p.cost)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-medium ${stockColor}`}>{p.stock}</span>
                      {p.minStock > 0 && (
                        <span className="text-dark-600">/{p.minStock}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="rounded p-1.5 text-dark-400 hover:text-gold-400 hover:bg-dark-800">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="rounded p-1.5 text-dark-400 hover:text-red-400 hover:bg-dark-800">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-xl bg-dark-900 border border-dark-800 sm:rounded-xl">
            <div className="flex items-center justify-between border-b border-dark-800 p-4">
              <h3 className="text-sm font-semibold text-white">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={() => setShowModal(false)} className="rounded p-1 text-dark-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="label">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`input ${formErrors.name ? 'border-red-600' : ''}`}
                  autoFocus
                />
                {formErrors.name && <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>}
              </div>
              <div>
                <label className="label">Categoria</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="select">
                  <option value="">Sem categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Preço de Venda (R$) *</label>
                  <input
                    type="text"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={`input ${formErrors.price ? 'border-red-600' : ''}`}
                    placeholder="0,00"
                  />
                  {formErrors.price && <p className="mt-1 text-xs text-red-400">{formErrors.price}</p>}
                </div>
                <div>
                  <label className="label">Custo (R$) *</label>
                  <input
                    type="text"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    className={`input ${formErrors.cost ? 'border-red-600' : ''}`}
                    placeholder="0,00"
                  />
                  {formErrors.cost && <p className="mt-1 text-xs text-red-400">{formErrors.cost}</p>}
                </div>
              </div>
              {priceCents > 0 && (
                <div className="rounded-lg bg-dark-800 p-2 text-center text-sm">
                  <span className="text-dark-400">Margem: </span>
                  <span className={`font-semibold ${parseFloat(margin) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {margin}%
                  </span>
                  <span className="text-dark-400"> · Lucro: </span>
                  <span className="font-medium text-gold-400">{formatCurrency(priceCents - costCents)}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Estoque</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="input"
                    min={0}
                  />
                </div>
                <div>
                  <label className="label">Estoque Mín.</label>
                  <input
                    type="number"
                    value={form.minStock}
                    onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                    className="input"
                    min={0}
                  />
                </div>
                <div>
                  <label className="label">Unidade</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="select">
                    <option value="UN">UN</option>
                    <option value="KG">KG</option>
                    <option value="L">L</option>
                    <option value="M">M</option>
                    <option value="CX">CX</option>
                    <option value="PCT">PCT</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Código</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="input"
                  placeholder="Código de barras ou referência"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancelar</button>
                <button onClick={handleSubmit} disabled={saving} className="btn-gold flex-1">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {editingId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
