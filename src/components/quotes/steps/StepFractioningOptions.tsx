// src/components/quotes/steps/StepFractioningOptions.tsx
import React, { useEffect } from 'react';
import { Company, Guarantee } from '@/types/quotes';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Percent, Layers, Calendar } from 'lucide-react';

interface StepFractioningOptionsProps {
  companies: Company[];
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  durationMonths: number;
  setDurationMonths: (months: number) => void;
  includeDTA: boolean;
  setIncludeDTA: (inc: boolean) => void;
  commercialDiscount: number;
  setCommercialDiscount: (discount: number) => void;
  manualPremiumRC: string;
  setManualPremiumRC: (val: string) => void;
  manualAccessories: string;
  setManualAccessories: (val: string) => void;
  customMarketValue: string;
  availableGuarantees: Guarantee[];
  setAvailableGuarantees: (g: Guarantee[]) => void;
  selectedGuarantees: string[];
  setSelectedGuarantees: React.Dispatch<React.SetStateAction<string[]>>;
  customCategory: string;
  setStep: (step: number) => void;
  onCalculate: () => void;
  loading: boolean;
}

export default function StepFractioningOptions({
  companies, selectedCompanyId, setSelectedCompanyId,
  startDate, setStartDate, durationMonths, setDurationMonths,
  includeDTA, setIncludeDTA, commercialDiscount, setCommercialDiscount,
  manualPremiumRC, setManualPremiumRC, manualAccessories, setManualAccessories,
  availableGuarantees, setAvailableGuarantees,
  selectedGuarantees, setSelectedGuarantees, setStep, onCalculate, loading
}: StepFractioningOptionsProps) {

  // Charger les garanties uniquement si le store partagé est vide
  useEffect(() => {
    async function fetchGuarantees() {
      if (availableGuarantees.length > 0) return;

      const { data } = await (supabase.from('guarantees') as any)
        .select('id, code, label, calc_type, rate, min_amount, is_mandatory')
        .order('is_mandatory', { ascending: false });
      
      if (data) {
        setAvailableGuarantees(data);
        
        // Pré-cocher uniquement si aucune sélection n'a été faite au préalable
        setSelectedGuarantees(prev => {
          if (prev.length > 0) return prev;
          const mandatoryCodes = data.filter((g: Guarantee) => g.is_mandatory).map((g: Guarantee) => g.code);
          return Array.from(new Set([...mandatoryCodes, 'RC']));
        });
      }
    }
    fetchGuarantees();
  }, [availableGuarantees.length, setAvailableGuarantees, setSelectedGuarantees]);

  const toggleGuarantee = (code: string) => {
    if (code === 'RC') return; // Sécurité : la RC reste bloquée
    setSelectedGuarantees(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="space-y-6">
      {/* Ligne : Compagnie & Période */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <Layers className="text-indigo-600" size={20} />
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-800">Compagnie Porteuse</h2>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Partenaire d'assurance *</label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            >
              <option value="">-- Choisir une compagnie --</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.short_name.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <Calendar className="text-indigo-600" size={20} />
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-800">Durée du Contrat (Fractionnement)</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Prise d'effet *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Périodicité *</label>
              <select
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value={12}>12 Mois (Annuel)</option>
                <option value={6}>6 Mois (Semestriel)</option>
                <option value={4}>4 Mois (Quadrimestriel)</option>
                <option value={2}>2 Mois (Bimestriel)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sélection des Garanties Annexes */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
          <ShieldCheck className="text-indigo-600" size={20} />
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-800">Extension des Garanties CIMA</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableGuarantees.map(g => {
            const isChecked = selectedGuarantees.includes(g.code);
            const isDisabled = g.code === 'RC' || g.is_mandatory;
            return (
              <div 
                key={g.id}
                onClick={() => !isDisabled && toggleGuarantee(g.code)}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isChecked ? 'bg-indigo-50/40 border-indigo-200' : 'bg-gray-50/50 border-gray-100 hover:bg-gray-50'}`}
              >
                <input 
                  type="checkbox"
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => {}} 
                  className="mt-0.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-gray-800 tracking-tight">{g.code} - {g.label}</span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {g.code === 'RC' ? 'Garantie de base légale obligatoire' : `Calcul par ${g.calc_type}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ajustements Commerciaux et Forçages */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
          <Percent className="text-indigo-600" size={20} />
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-800">Abattements, DTA & Forçage Manuel</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Remise Commerciale (%)</label>
            <input
              type="number"
              min="0"
              max="50"
              value={commercialDiscount || ''}
              onChange={(e) => setCommercialDiscount(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Ex: 10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Taxe DTA Camrail</label>
            <div className="flex items-center h-10">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={includeDTA} 
                  onChange={(e) => setIncludeDTA(e.target.checked)} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className="ml-3 text-xs font-bold text-gray-700 uppercase">Inclure DTA</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-600 uppercase mb-2">Forcer Prime RC (FCFA)</label>
            <input
              type="number"
              value={manualPremiumRC}
              onChange={(e) => setManualPremiumRC(e.target.value)}
              className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none text-amber-900 font-bold"
              placeholder="Surcharger la grille"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-600 uppercase mb-2">Forcer Accessoires (FCFA)</label>
            <input
              type="number"
              value={manualAccessories}
              onChange={(e) => setManualAccessories(e.target.value)}
              className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none text-amber-900 font-bold"
              placeholder="Surcharger accessoires"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-lg transition-all"
        >
          Retour aux Risques
        </button>

        <button
          type="button"
          onClick={onCalculate}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-lg transition-all shadow-md"
        >
          {loading ? 'Calcul de quittance...' : 'Générer la Quittance Finale'}
        </button>
      </div>
    </div>
  );
}