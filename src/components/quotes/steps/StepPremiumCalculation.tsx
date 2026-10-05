import React, { useState, useEffect } from 'react';
import { ShieldCheck, Info, FileText } from 'lucide-react';
import { Guarantee } from '@/types/quotes';

interface StepPremiumCalculationProps {
  selectedCompany: 'GMC' | 'NSIA' | 'AFRI';
  includeDTA: boolean;
  setIncludeDTA: (value: boolean) => void;
  commercialDiscount: number;
  setCommercialDiscount: (value: number) => void;
  manualPremiumRC: string;
  setManualPremiumRC: (value: string) => void;
  manualAccessories: string;
  setManualAccessories: (value: string) => void;
  customMarketValue: string;
  availableGuarantees: Guarantee[];
  setAvailableGuarantees: React.Dispatch<React.SetStateAction<Guarantee[]>>;
  selectedGuarantees: string[];
  setSelectedGuarantees: React.Dispatch<React.SetStateAction<string[]>>;
  customCategory: string;
  onPrevious: () => void;
  onCalculate: () => void;
  loading: boolean;
}

export default function StepPremiumCalculation({
  selectedCompany,
  includeDTA,
  setIncludeDTA,
  commercialDiscount,
  setCommercialDiscount,
  manualPremiumRC,
  setManualPremiumRC,
  manualAccessories,
  setManualAccessories,
  customMarketValue,
  availableGuarantees,
  setAvailableGuarantees,
  selectedGuarantees,
  setSelectedGuarantees,
  customCategory,
  onPrevious,
  onCalculate,
  loading
}: StepPremiumCalculationProps) {
  
  const [accessoriesError, setAccessoriesError] = useState<string | null>(null);

  // Synchronisation et validation locale des accessoires GMC à la saisie
  const handleAccessoriesChange = (value: string) => {
    setManualAccessories(value);
    
    if (selectedCompany === 'GMC' && value !== '') {
      const numVal = Number(value);
      if (numVal < 2500 || numVal > 3500) {
        setAccessoriesError("Chez GMC, les accessoires doivent être compris entre 2 500 et 3 500 FCFA.");
      } else {
        setAccessoriesError(null);
      }
    } else {
      setAccessoriesError(null);
    }
  };

  // Gestion des cases à cocher pour les garanties optionnelles
  const toggleGuarantee = (code: string) => {
    if (selectedGuarantees.includes(code)) {
      setSelectedGuarantees(prev => prev.filter(g => g !== code));
    } else {
      setSelectedGuarantees(prev => [...prev, code]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessoriesError) return;
    onCalculate(); // Déclenche la fonction asynchrone globale connectée à Supabase
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
          <ShieldCheck className="text-indigo-600" size={20} />
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-800">
            Ajustement Financier & Options ({selectedCompany})
          </h2>
        </div>

        {/* SECTION 1 : SÉLECTION DES GARANTIES OPTIONNELLES */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
            Garanties Optionnelles Disponibles
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableGuarantees
              .filter(g => g.code !== 'RC') // La RC est obligatoire et automatique
              .map(guarantee => {
                const isChecked = selectedGuarantees.includes(guarantee.code);
                return (
                  <label
                    key={guarantee.code}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? 'border-indigo-600 bg-indigo-50/30'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleGuarantee(guarantee.code)}
                      className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="block text-sm font-bold text-gray-800">{guarantee.name}</span>
                      <span className="block text-xs text-gray-400">Code: {guarantee.code}</span>
                    </div>
                  </label>
                );
              })}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* SECTION 2 : PARAMÈTRES ET AJUSTEMENTS MANUELS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bloc Saisie Accessoires */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Frais d'Accessoires Compagnie (FCFA)
            </label>
            <input
              type="number"
              value={manualAccessories}
              onChange={(e) => handleAccessoriesChange(e.target.value)}
              placeholder={selectedCompany === 'GMC' ? '3000' : 'Ex: 5000'}
              className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              min="0"
            />
            {selectedCompany === 'GMC' ? (
              <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                <Info size={12} /> Encadrement obligatoire GMC : 2 500 - 3 500 FCFA.
              </p>
            ) : (
              <p className="text-[11px] text-indigo-600 mt-1.5 flex items-center gap-1">
                <Info size={12} /> Laissez vide pour appliquer le tarif de base ({selectedCompany}).
              </p>
            )}

            {accessoriesError && (
              <p className="text-xs text-red-500 font-semibold mt-2">{accessoriesError}</p>
            )}
          </div>

          {/* Bloc Remise Commerciale & Options Fiscales */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Remise Commerciale (%)
              </label>
              <input
                type="number"
                value={commercialDiscount}
                onChange={(e) => setCommercialDiscount(Number(e.target.value))}
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                min="0"
                max="100"
              />
            </div>

            <label className="flex items-center gap-3 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeDTA}
                onChange={(e) => setIncludeDTA(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <div>
                <span className="block text-xs font-bold text-gray-700 uppercase">Inclure le DTA</span>
                <span className="block text-[11px] text-gray-400">Droit de Timbre Automobile Graduel</span>
              </div>
            </label>
          </div>
        </div>

        {/* SECTION 3 : FORÇAGE MANUEL DE LA RC (SÉCURITÉ COURTIER) */}
        <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100">
          <label className="block text-xs font-bold text-amber-800 uppercase mb-2">
            Forçage Manuel de la Prime RC (Optionnel)
          </label>
          <input
            type="number"
            value={manualPremiumRC}
            onChange={(e) => setManualPremiumRC(e.target.value)}
            placeholder="Laisser vide pour utiliser le calcul automatique Supabase"
            className="w-full bg-white border border-amber-200 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none text-amber-900"
            min="0"
          />
          <p className="text-[11px] text-amber-600 mt-1.5">
            ⚠️ Si vous saisissez une valeur ici, la grille tarifaire de la base de données sera ignorée pour la Responsabilité Civile.
          </p>
        </div>

      </div>

      {/* BOUTONS DE NAVIGATION */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrevious}
          className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-lg transition-all"
          disabled={loading}
        >
          Précédent
        </button>
        <button
          type="submit"
          disabled={!!accessoriesError || loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-lg transition-all shadow-sm flex items-center gap-2"
        >
          {loading ? 'Calcul en cours...' : 'Valider et Calculer la Quittance'}
        </button>
      </div>
    </form>
  );
}