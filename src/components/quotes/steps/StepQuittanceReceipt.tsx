// src/components/quotes/steps/StepQuittanceReceipt.tsx
import React, { useState } from 'react';
import { Financials, Company } from '@/types/quotes';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ReceiptText, Printer, FileCheck } from 'lucide-react';

interface StepQuittanceReceiptProps {
  financials: Financials;
  selectedCompany: Company | undefined;
  durationMonths: number;
  setStep: (step: number) => void;
  editQuoteId: string | null;
  selectedClientId: string;
  selectedVehicleId: string;
  selectedCompanyId: string;
  startDate: string;
  customCategory: string;
  customZone: string;
}

export default function StepQuittanceReceipt({
  financials, selectedCompany, durationMonths, setStep, editQuoteId,
  selectedClientId, selectedCompanyId, startDate, customCategory, customZone
}: StepQuittanceReceiptProps) {
  
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount);
  };

  // Récupération propre et sécurisée du nom de la compagnie courante pour l'affichage
  const currentCompanyName = selectedCompany?.short_name ? selectedCompany.short_name.toUpperCase() : 'GMC';

  const handleSaveQuote = async () => {
    setSaving(true);
    try {
      const quotePayload = {
        client_id: selectedClientId,
        company_id: selectedCompanyId,
        product_type: 'automobile',
        start_date: startDate,
        duration_months: durationMonths,
        category_code: customCategory,
        zone_code: customZone,
        premium_rc: financials.premium_rc,
        premium_options: financials.premium_options,
        premium_net: financials.premium_net,
        accessories: financials.premium_acc,
        tax_tva: financials.tva_amount,
        tax_carte_rose: financials.carte_rose,
        tax_fichier_central: financials.fichier_central,
        tax_dta: financials.dta_amount,
        total_ttc: financials.premium_ttc,
        status: 'draft',
        updated_at: new Date().toISOString()
      };

      if (editQuoteId) {
        await (supabase.from('quotes') as any).update(quotePayload).eq('id', editQuoteId);
      } else {
        await (supabase.from('quotes') as any).insert([{ ...quotePayload, created_at: new Date().toISOString() }]);
      }

      alert("Cotation enregistrée avec succès dans le registre.");
      navigate('/quotes');
    } catch (error) {
      console.error(error);
      alert("Erreur technique lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* En-tête de la Note de Décompte */}
        <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ReceiptText className="text-indigo-400" size={24} />
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider">Note de Décompte Financier</h2>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                Compagnie : <span className="text-white font-bold">{currentCompanyName}</span> | Période : {durationMonths} mois
              </p>
            </div>
          </div>
          <span className="text-xs bg-indigo-600/30 text-indigo-300 px-3 py-1 rounded-full font-bold uppercase tracking-widest text-[9px]">
            Aperçu Quittance
          </span>
        </div>

        {/* Corps du décompte */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase">Prime Pure RC</span>
              <p className="text-base font-black text-gray-800">{formatCurrency(financials.premium_rc)}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase">Garanties Optionnelles</span>
              <p className="text-base font-black text-gray-800">{formatCurrency(financials.premium_options)}</p>
            </div>
          </div>

          <div className="space-y-2 border-b border-gray-100 pb-4">
            <div className="flex justify-between text-xs font-medium text-gray-600">
              <span>Prime Nette Totale (HT) :</span>
              <span className="font-bold text-gray-900">{formatCurrency(financials.premium_net)}</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-600">
              <span>Accessoires Compagnie :</span>
              <span className="font-bold text-gray-900">{formatCurrency(financials.premium_acc)}</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-600">
              <span>Taxe sur la Valeur Ajoutée (TVA 19.25%) :</span>
              <span className="font-bold text-gray-900">{formatCurrency(financials.tva_amount)}</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-600">
              <span>Droit de Timbre Automobile (DTA) :</span>
              <span className="font-bold text-gray-900">{formatCurrency(financials.dta_amount)}</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-600">
              <span>Fonds de Garantie (Carte Rose & Fichier Central) :</span>
              <span className="font-bold text-gray-900">{formatCurrency(financials.carte_rose + financials.fichier_central)}</span>
            </div>
          </div>

          {/* Total TTC à payer */}
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <span className="block text-xs font-black text-gray-400 uppercase tracking-wider">Net à Payer (TTC)</span>
              <span className="text-[10px] text-gray-400">Réglementation CIMA Code</span>
            </div>
            <span className="text-2xl font-black text-indigo-600 tracking-tight">{formatCurrency(financials.premium_ttc)}</span>
          </div>
        </div>
      </div>

      {/* Boutons d'Action */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-lg transition-all"
        >
          Ajuster Options
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 border border-gray-900 text-gray-900 hover:bg-gray-50 font-black text-xs uppercase tracking-wider px-4 py-3 rounded-lg transition-all"
          >
            <Printer size={14} /> Imprimer l'Aperçu
          </button>

          <button
            type="button"
            onClick={handleSaveQuote}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-lg transition-all shadow-md"
          >
            <FileCheck size={14} /> {saving ? 'Enregistrement...' : 'Valider & Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}