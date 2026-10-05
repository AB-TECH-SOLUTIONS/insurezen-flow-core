import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Ajout de Link pour la navigation
import { supabase } from '@/lib/supabase';

interface Vehicle {
  id: string;
  plate_number: string;
  brand: string;
  model: string;
  fiscal_power: number;
  fuel_type: string;
  market_value: number | null;
  new_value: number | null;
  client: { first_name: string | null; last_name: string; client_type: string; company_name: string | null } | null;
  created_at: string;
}

interface ClientOption {
  id: string;
  first_name: string | null;
  last_name: string;
  client_type: 'particulier' | 'entreprise';
  company_name: string | null;
}

interface NewVehicleInsert {
  client_id: string;
  plate_number: string;
  brand: string;
  model: string;
  fuel_type: string;
  fiscal_power: number;
  category_code: string;
  market_value?: number | null;
  new_value?: number | null;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State du formulaire unifié
  const [formData, setFormData] = useState({
    client_id: '',
    plate_number: '',
    brand: '',
    model: '',
    fuel_type: 'essence',
    fiscal_power: '',
    category_code: '01',
    market_value: '',
    new_value: '',
  });

  // Charger les véhicules avec les informations du client associé
  const loadVehicles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase.from('vehicles') as any)
      .select(`
        id, plate_number, brand, model, fiscal_power, fuel_type, market_value, new_value, created_at,
        client:clients (first_name, last_name, client_type, company_name)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setVehicles(data as any);
    }
    setLoading(false);
  }, []);

  // Charger la liste des clients pour le select du formulaire
  const loadClients = useCallback(async () => {
    const { data } = await (supabase.from('clients') as any).select('id, first_name, last_name, client_type, company_name');
    if (data) setClients(data);
  }, []);

  useEffect(() => {
    loadVehicles();
    loadClients();
  }, [loadVehicles, loadClients]);

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const vehicleData: NewVehicleInsert = {
      client_id: formData.client_id,
      plate_number: formData.plate_number,
      brand: formData.brand,
      model: formData.model,
      fuel_type: formData.fuel_type,
      fiscal_power: parseInt(formData.fiscal_power) || 0,
      category_code: formData.category_code,
      market_value: formData.market_value ? parseFloat(formData.market_value) : null,
      new_value: formData.new_value ? parseFloat(formData.new_value) : null,
    };

    const { error } = await (supabase.from('vehicles') as any).insert([vehicleData]);

    if (error) {
      alert(`Erreur lors de la création : ${error.message}`);
    } else {
      setIsModalOpen(false);
      setFormData({
        client_id: '',
        plate_number: '',
        brand: '',
        model: '',
        fuel_type: 'essence',
        fiscal_power: '',
        category_code: '01',
        market_value: '',
        new_value: '',
      });
      loadVehicles();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parc Automobile / Véhicules</h1>
          <p className="text-sm text-gray-500">Gérez les véhicules associés à vos assurés particuliers et flottes.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition text-sm"
        >
          + Nouveau Véhicule
        </button>
      </div>

      {/* Tableau des véhicules */}
      {loading ? (
        <div className="text-center py-10 text-sm text-gray-500">Chargement des véhicules...</div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center text-gray-500 text-sm">
          Aucun véhicule enregistré pour le moment.
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-4">Assuré / Flotte</th>
                <th className="p-4">Immatriculation</th>
                <th className="p-4">Marque & Modèle</th>
                <th className="p-4">Énergie</th>
                <th className="p-4">Puissance (CV)</th>
                <th className="p-4">Valeur Vénale</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900">
                    {v.client 
                      ? v.client.client_type === 'entreprise' 
                        ? `🏢 ${v.client.company_name}` 
                        : `👤 ${v.client.first_name || ''} ${v.client.last_name}`
                      : 'Inconnu'
                    }
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-mono font-bold border border-gray-200">
                      {v.plate_number}
                    </span>
                  </td>
                  <td className="p-4">{v.brand} {v.model || ''}</td>
                  <td className="p-4 capitalize">{v.fuel_type}</td>
                  <td className="p-4 font-mono">{v.fiscal_power} CV</td>
                  <td className="p-4 font-mono font-bold text-gray-600">
                    {v.market_value ? `${v.market_value.toLocaleString()} FCFA` : '-'}
                  </td>
                  <td className="p-4 text-right">
                    {/* FIX: Remplacement du bouton inerte par un composant Link de routage dynamique */}
                    <Link 
                      to={`/vehicles/${v.id}`} 
                      className="text-blue-600 hover:underline font-medium text-xs bg-transparent border-none cursor-pointer"
                    >
                      Ouvrir le dossier
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de création express */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-gray-900">Ajouter un véhicule au parc</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-sm">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Assuré propriétaire *</label>
                <select
                  required
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full border rounded-lg p-2.5 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Sélectionner un assuré ou une entreprise --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.client_type === 'entreprise' ? `🏢 [FLOTTE] ${c.company_name}` : `👤 ${c.first_name || ''} ${c.last_name}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">N° d'immatriculation *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: LT 1234 AB"
                    value={formData.plate_number}
                    onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Usage / Catégorie *</label>
                  <select
                    value={formData.category_code}
                    onChange={(e) => setFormData({ ...formData, category_code: e.target.value })}
                    className="w-full border rounded-lg p-2 bg-white text-sm outline-none"
                  >
                    {/* FIX: Ajout des Catégories 4 et 5 manquantes */}
                    <option value="01">Catégorie 1 : Promenade & Affaires</option>
                    <option value="02">Catégorie 2 : Transport d'employés / Personnel</option>
                    <option value="03">Catégorie 3 : Transport Public de Voyageurs (TPV)</option>
                    <option value="04">Catégorie 4 : Transport Privé de Marchandises</option>
                    <option value="05">Catégorie 5 : Transport Public de Marchandises</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Marque *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Toyota"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Modèle</label>
                  <input
                    type="text"
                    placeholder="ex: Hilux"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Carburant *</label>
                  <select
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    className="w-full border rounded-lg p-2 bg-white text-sm outline-none"
                  >
                    <option value="essence">Essence</option>
                    <option value="diesel">Diesel</option>
                    <option value="electrique">Électrique</option>
                    <option value="hybride">Hybride</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Puissance Fiscale (CV) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="ex: 7"
                    value={formData.fiscal_power}
                    onChange={(e) => setFormData({ ...formData, fiscal_power: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Valeur Vénale (FCFA)</label>
                  <input 
                    type="number" 
                    value={formData.market_value} 
                    onChange={e => setFormData({ ...formData, market_value: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded bg-white font-mono text-xs"
                    placeholder="Pour Vol/Incendie/BDG"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Valeur à Neuf (FCFA)</label>
                  <input 
                    type="number" 
                    value={formData.new_value} 
                    onChange={e => setFormData({ ...formData, new_value: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded bg-white font-mono text-xs"
                    placeholder="Pour Dommages Collision"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  Enregistrer le véhicule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}