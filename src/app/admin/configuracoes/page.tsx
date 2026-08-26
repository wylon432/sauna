'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Loader2,
  Save,
  Settings,
  MessageSquare,
  Globe,
  Percent,
  Calendar,
} from 'lucide-react';

interface SettingsData {
  whatsapp_main: string;
  whatsapp_sauna: string;
  whatsapp_rental: string;
  whatsapp_message: string;
  whatsapp_active: string;
  site_name: string;
  site_description: string;
  pre_reservation_days: string;
  signal_percentage: string;
}

export default function ConfiguracoesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsData>({
    whatsapp_main: '',
    whatsapp_sauna: '',
    whatsapp_rental: '',
    whatsapp_message: '',
    whatsapp_active: 'true',
    site_name: '',
    site_description: '',
    pre_reservation_days: '3',
    signal_percentage: '30',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) {
          setSettings((prev) => ({ ...prev, ...d.settings }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
  };

  const handleChange = (key: keyof SettingsData, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          <Save className="mr-2 h-4 w-4" /> {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <div className="admin-card space-y-6">
        <div className="flex items-center gap-2 border-b pb-3">
          <Globe className="h-5 w-5 text-sauna-600" />
          <h2 className="text-lg font-semibold">Site</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Nome do Site</label>
            <input className="input" value={settings.site_name} onChange={(e) => handleChange('site_name', e.target.value)} />
          </div>
          <div>
            <label className="label">Descrição</label>
            <input className="input" value={settings.site_description} onChange={(e) => handleChange('site_description', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="admin-card space-y-6">
        <div className="flex items-center gap-2 border-b pb-3">
          <MessageSquare className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold">WhatsApp</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Número Principal</label>
            <input className="input" placeholder="11999999999" value={settings.whatsapp_main} onChange={(e) => handleChange('whatsapp_main', e.target.value)} />
          </div>
          <div>
            <label className="label">Número Sauna</label>
            <input className="input" placeholder="11999999999" value={settings.whatsapp_sauna} onChange={(e) => handleChange('whatsapp_sauna', e.target.value)} />
          </div>
          <div>
            <label className="label">Número Aluguel</label>
            <input className="input" placeholder="11999999999" value={settings.whatsapp_rental} onChange={(e) => handleChange('whatsapp_rental', e.target.value)} />
          </div>
          <div>
            <label className="label">WhatsApp Ativo</label>
            <select className="input" value={settings.whatsapp_active} onChange={(e) => handleChange('whatsapp_active', e.target.value)}>
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Mensagem Padrão</label>
            <textarea className="input" rows={4} value={settings.whatsapp_message} onChange={(e) => handleChange('whatsapp_message', e.target.value)} placeholder="Use {name}, {date}, {service} como variáveis" />
          </div>
        </div>
      </div>

      <div className="admin-card space-y-6">
        <div className="flex items-center gap-2 border-b pb-3">
          <Settings className="h-5 w-5 text-pool-600" />
          <h2 className="text-lg font-semibold">Reservas</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Dias para Pré-Reserva</label>
            <input className="input" type="number" min="1" value={settings.pre_reservation_days} onChange={(e) => handleChange('pre_reservation_days', e.target.value)} />
          </div>
          <div>
            <label className="label">Porcentagem do Sinal (%)</label>
            <input className="input" type="number" min="0" max="100" value={settings.signal_percentage} onChange={(e) => handleChange('signal_percentage', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}
