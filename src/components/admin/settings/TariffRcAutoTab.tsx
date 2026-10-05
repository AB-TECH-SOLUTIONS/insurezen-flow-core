import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Company, VehicleCategory, TariffZone } from '@/types/database';

// Interface explicite et robuste pour éliminer définitivement les erreurs 'never'
interface TariffRow {
  id: string;
  company_id: string;
  category_code: string;
  zone_code: string;
  fuel_type: string;
  cv_min: number;
  cv_max: number | null;
  base_premium: number;
  updated_at?: string;
}

export default function TariffRcAutoTab() {
  // Initialisation typée pour éviter les déductions erronées de TypeScript
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [zones, setTariffZones] = useState<TariffZone[]>([]);

  // Filtres de sélection
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string>('CAT1');
  const [selectedZoneCode, setSelectedZoneCode] = useState<string>('A');  
  
  // Matrice de tarification typée
  const [tariffs, setTariffs] = useState<TariffRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Charger les structures de base
  useEffect(() => {
    async function loadMeta() {
      const [compRes, catRes, zoneRes] = await Promise.all([
        supabase.from('companies').select('id, name, short_name').eq('is_active', true),
        supabase.from('vehicle_categories').select('code, label').order('sort_order'),
        supabase.from('tariff_zones').select('code, label').order('code')
      ]);

      if (compRes.data && compRes.data.length > 0) {
        setCompanies(compRes.data as Company[]);
        setSelectedCompanyId(compRes.data[0].id);
      }
      if (catRes.data) setCategories(catRes.data as VehicleCategory[]);
      if (zoneRes.data) setTariffZones(zoneRes.data as TariffZone[]);
    }
    loadMeta();
  }, []);

  // Charger la matrice dès qu'un filtre change
  useEffect(() => {
    if (selectedCompanyId && selectedCategoryCode && selectedZoneCode) {
      fetchMatrix();
    }
  }, [selectedCompanyId, selectedCategoryCode, selectedZoneCode]);

  async function fetchMatrix() {
    setLoading(true);
    const { data, error } = await supabase
      .from('tariff_rc_auto')
      .select('*')
      .eq('company_id', selectedCompanyId)
      .eq('category_code', selectedCategoryCode)
      .eq('zone_code', selectedZoneCode)
      .order('fuel_type', { ascending: false })
      .order('cv_min', { ascending: true });

    if (!error && data) {
      setTariffs(data as TariffRow[]);
    } else {
      setTariffs([]);
    }
    setLoading(false);
  }

  // Sauvegarde à la volée du montant d'une ligne
  async function handlePriceChange(id: string, newPremium: string) {
    const numericValue = parseFloat(newPremium.replace(/\s/g, ''));
    if (isNaN(numericValue)) return;

    // Vérifier si le prix a réellement changé pour éviter des requêtes inutiles
    const currentRow = tariffs.find(t => t.id === id);
    if (currentRow && currentRow.base_premium === numericValue) return;

    setSavingId(id);
    setSuccessId(null);

    const { error } = await supabase
      .from('tariff_rc_auto')
      .update({
        base_premium: numericValue,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      alert('Erreur lors de la mise à jour du tarif');
    } else {
      // Mise à jour de l'état local avec typage sécurisé
      setTariffs(prev => prev.map(t => t.id === id ? { ...t, base_premium: numericValue } : t));
      
      // Feedback visuel de succès temporaire
      setSuccessId(id);
      setTimeout(() => setSuccessId(null), 2000);
    }
    setSavingId(null);
  }

  return (
    <div className="space-y-6">
      {/* Barre de Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Compagnie d'Assurance</label>
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
          >
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.short_name})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Catégorie CIMA</label>
          <select
            value={selectedCategoryCode}
            onChange={(e) => setSelectedCategoryCode(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
          >
            {categories.map(c => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Zone Tarifaire</label>
          <select
            value={selectedZoneCode}
            onChange={(e) => setSelectedZoneCode(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
          >
            {zones.map(z => (
              <option key={z.code} value={z.code}>Zone {z.code} — ({z.label})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau de la Matrice */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="animate-spin text-indigo-600" size={28} />
            <span className="text-xs font-semibold">Chargement de la matrice tarifaire...</span>
          </div>
        ) : tariffs.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-gray-400 bg-gray-50/50">
            <AlertCircle size={24} className="text-amber-500" />
            <span className="text-sm font-medium text-gray-500">Aucun tarif configuré pour cette combinaison.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm divide-y divide-gray-100">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Énergie</th>
                  <th className="px-6 py-4">Puissance Fiscale (CV)</th>
                  <th className="px-6 py-4 text-right">Prime Pure Annuelle (HT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {tariffs.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${
                        t.fuel_type === 'essence' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {t.fuel_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {t.cv_max ? `${t.cv_min} — ${t.cv_max} CV` : `${t.cv_min} CV et plus`}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <div className="relative inline-flex items-center">
                        <input
                          type="number"
                          defaultValue={t.base_premium}
                          onBlur={(e) => handlePriceChange(t.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handlePriceChange(t.id, (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className="w-40 text-right bg-gray-50 border border-gray-200 hover:border-gray-300 focus:bg-white focus:border-indigo-500 rounded-lg p-1.5 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                        />
                        <span className="ml-2 text-xs font-bold text-gray-400">FCFA</span>
                      </div>
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {savingId === t.id && <Loader2 className="animate-spin text-indigo-600" size={14} />}
                        {successId === t.id && <CheckCircle2 className="text-emerald-500" size={14} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}