// src/components/quotes/steps/StepRiskConfiguration.tsx
import React, { useEffect } from 'react';
import { Client, Vehicle } from '@/types/quotes';
import { User, Car, MapPin } from 'lucide-react';

interface StepRiskConfigurationProps {
  clients: Client[];
  vehicles: Vehicle[];
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  selectedVehicleId: string;
  setSelectedVehicleId: (id: string) => void;
  customCategory: string;
  setCustomCategory: (cat: string) => void;
  customFuelType: 'essence' | 'diesel';
  setCustomFuelType: (type: 'essence' | 'diesel') => void;
  customCylinder: string;
  setCustomCylinder: (cyl: string) => void;
  customFiscalPower: number;
  setCustomFiscalPower: (power: number) => void;
  customMarketValue: string;
  setCustomMarketValue: (val: string) => void;
  customNewValue: string;
  setCustomNewValue: (val: string) => void;
  customZone: 'A' | 'B' | 'C';
  setStep: (step: number) => void;
}

export default function StepRiskConfiguration({
  clients, vehicles, selectedClientId, setSelectedClientId,
  selectedVehicleId, setSelectedVehicleId, customCategory, setCustomCategory,
  customFuelType, setCustomFuelType, customCylinder, setCustomCylinder,
  customFiscalPower, setCustomFiscalPower, customMarketValue, setCustomMarketValue,
  customNewValue, setCustomNewValue, customZone, setStep
}: StepRiskConfigurationProps) {

  // Effet pour pré-remplir automatiquement les caractéristiques si un véhicule connu est sélectionné
  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId);
      if (vehicle) {
        if (vehicle.fiscal_power) setCustomFiscalPower(vehicle.fiscal_power);
        if (vehicle.category_code) setCustomCategory(vehicle.category_code);
        // Ajoute ici d'autres correspondances si tes objets véhicules contiennent l'énergie ou la cylindrée en base
      }
    }
  }, [selectedVehicleId, vehicles, setCustomFiscalPower, setCustomCategory]);

  // Reset du véhicule si le client change
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedVehicleId(''); // On réinitialise le véhicule sélectionné
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      alert("Veuillez sélectionner un client.");
      return;
    }
    if (!selectedVehicleId) {
      alert("Veuillez sélectionner ou associer un véhicule.");
      return;
    }
    setStep(2);
  };

  return (
    <form onSubmit={handleNext} className="space-y-6">
      {/* Section Client & Zone Géographique */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-50 pb-3">
          <div className="flex items-center gap-2">
            <User className="text-indigo-600" size={20} />
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-800">Identification du Client</h2>
          </div>
          {selectedClientId && (
            <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              <MapPin className="text-indigo-600" size={14} />
              <span className="text-xs font-black text-indigo-700 uppercase">Tarification Zone : {customZone}</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sélectionner un Client *</label>
            <select
              value={selectedClientId}
              onChange={(e) => handleClientChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              required
            >
              <option value="">-- Choisir un client existant --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.client_type === 'entreprise' ? `[Entreprise] ${c.company_name}` : `${c.last_name} ${c.first_name || ''}`} ({c.city || 'Non spécifiée'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Véhicule associé *</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              disabled={!selectedClientId}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              required
            >
              <option value="">-- {selectedClientId ? 'Choisir un véhicule' : 'Sélectionnez d\'abord un client'} --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.brand || 'Marque inconnue'} - {v.model || 'Modèle inconnu'} [{v.plate_number || 'Sans Immat'}]
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section Spécifications du Véhicule & Risques */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
          <Car className="text-indigo-600" size={20} />
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-800">Spécifications du Véhicule & Risques</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Catégorie d'usage *</label>
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="01">Catégorie 1 - Promenade & Affaires</option>
              <option value="02">Catégorie 2 - Transport d'employés / Personnel</option>
              <option value="03">Catégorie 3 - Transport Public de Voyageurs (TPV)</option>
              <option value="04">Catégorie 4 - Transport Privé de Marchandises</option>
              <option value="05">Catégorie 5 - Transport Public de Marchandises</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Énergie / Carburant *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCustomFuelType('essence')}
                className={`p-2.5 text-xs font-bold uppercase rounded-lg border transition-all ${customFuelType === 'essence' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
              >
                Essence
              </button>
              <button
                type="button"
                onClick={() => setCustomFuelType('diesel')}
                className={`p-2.5 text-xs font-bold uppercase rounded-lg border transition-all ${customFuelType === 'diesel' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
              >
                Diesel
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Puissance Fiscale (CV) *</label>
            <input
              type="number"
              min="1"
              value={customFiscalPower || ''}
              onChange={(e) => setCustomFiscalPower(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Ex: 7"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-50 pt-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cylindrée (cm³)</label>
            <input
              type="number"
              value={customCylinder}
              onChange={(e) => setCustomCylinder(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Ex: 1998"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Valeur Vénale (FCFA)</label>
            <input
              type="number"
              value={customMarketValue}
              onChange={(e) => setCustomMarketValue(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Obligatoire pour options"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Valeur à Neuf (FCFA)</label>
            <input
              type="number"
              value={customNewValue}
              onChange={(e) => setCustomNewValue(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Ex: 15000000"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-gray-900 hover:bg-gray-800 text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-lg transition-all shadow-sm"
        >
          Continuer vers la Tarification
        </button>
      </div>
    </form>
  );
}