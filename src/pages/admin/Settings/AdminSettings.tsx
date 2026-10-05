import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import TariffRcAutoTab from '@/components/admin/settings/TariffRcAutoTab';
import { Shield, BarChart3, ShieldCheck, MapPin, Loader2 } from 'lucide-react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<'tarifs' | 'garanties' | 'zones'>('tarifs');
  const [zones, setZones] = useState<any[]>([]);
  const [loadingZones, setLoadingZones] = useState(false);

  // Charger les zones au démarrage pour l'onglet Découpage Géographique
  useEffect(() => {
    if (activeTab === 'zones') {
      fetchZones();
    }
  }, [activeTab]);

  async function fetchZones() {
    setLoadingZones(true);
    try {
      const { data, error } = await supabase
        .from('cima_zones_cities')
        .select('*')
        .order('city_name');
        
      if (!error && data) setZones(data);
    } catch (err) {
      console.error('Erreur chargement zones:', err);
    } finally {
      setLoadingZones(false);
    }
  }

  async function updateZone(id: number, newZone: string) {
    const { error } = await (supabase
      .from('cima_zones_cities') as any)
      .update({ zone_code: newZone })
      .eq('id', id);

    if (!error) {
      fetchZones();
    } else {
      alert('Erreur lors de la mise à jour de la zone');
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen space-y-6">
      {/* En-tête de la Page */}
      <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
          <Shield size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Configuration Globale</h1>
          <p className="text-xs text-gray-400 font-medium">Gestion du moteur d'identification, des barèmes CIMA et des taxes</p>
        </div>
      </div>

      {/* Barre d'onglets (Tabs) */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('tarifs')}
          className={`py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'tarifs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <BarChart3 size={15} />
          Tarifs & Moteur CIMA (RC)
        </button>
        <button
          onClick={() => setActiveTab('garanties')}
          className={`py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'garanties'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <ShieldCheck size={15} />
          Catalogue Garanties & Taxes
        </button>
        <button
          onClick={() => setActiveTab('zones')}
          className={`py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'zones'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <MapPin size={15} />
          Découpage Géographique CIMA
        </button>
      </div>

      {/* Contenu des Onglets */}
      <div className="mt-4">
        {activeTab === 'tarifs' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Grille des Primes Pures Responsabilité Civile</h2>
              <p className="text-xs text-gray-400 font-medium mb-2">Matrice de tarification réglementaire issue de la table database.</p>
            </div>
            {/* Injection de ton composant dynamique connecté à Supabase */}
            <TariffRcAutoTab />
          </div>
        )}

        {activeTab === 'garanties' && (
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Garanties optionnelles et Taxes Légales</h2>
            <p className="text-xs text-gray-400 font-medium mb-4">Gestion des formules (Pourcentage Valeur Vénale, Neuf, Forfaits compagnie).</p>
            <div className="p-4 bg-gray-50 text-gray-500 rounded-lg text-xs font-medium border border-gray-100">
              🛠️ Module d'édition des taux et taxes en cours d'alignement.
            </div>
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Villes & Correspondances Zones CIMA</h2>
              <p className="text-xs text-gray-400 font-medium">Ajustement instantané de la classification territoriale pour le Cameroun.</p>
            </div>

            {loadingZones ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-gray-400">
                <Loader2 className="animate-spin text-indigo-600" size={24} />
                <span className="text-xs font-medium">Chargement géographique...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm divide-y divide-gray-100">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Ville</th>
                      <th className="px-6 py-3.5">Zone Actuelle</th>
                      <th className="px-6 py-3.5">Action / Mutation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                    {zones.map((z) => (
                      <tr key={z.id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{z.city_name}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${
                            z.zone_code === 'A' ? 'bg-blue-50 text-blue-700' : z.zone_code === 'B' ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            Zone {z.zone_code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={z.zone_code}
                            onChange={(e) => updateZone(z.id, e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg p-1.5 text-xs font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                          >
                            <option value="A">Zone A (Ex: Douala / Ydé)</option>
                            <option value="B">Zone B (Chefs-lieux)</option>
                            <option value="C">Zone C (Campagnes)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}