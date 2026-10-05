import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react';

import { Client, Vehicle, Company, Guarantee, Financials } from '@/types/quotes';
import { useAutoCalculations } from '@/hooks/useAutoCalculations';
import { getCimaZoneByCity } from '@/utils/cimaZones';

import StepRiskConfiguration from '@/components/quotes/steps/StepRiskConfiguration';
import StepPremiumCalculation from '@/components/quotes/steps/StepPremiumCalculation';
import StepQuittanceReceipt from '@/components/quotes/steps/StepQuittanceReceipt';

export default function NewQuotesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { runAutoCalculation } = useAutoCalculations();
  
  const editQuoteId = location.state?.quoteId || null;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Équipes d'états partagés (Référentiels)
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [availableGuarantees, setAvailableGuarantees] = useState<Guarantee[]>([]);

  // Saisies Étape 1 : Client & Risques Véhicule
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [customCategory, setCustomCategory] = useState('01');
  const [customZone, setCustomZone] = useState<'A' | 'B' | 'C'>('A');
  const [customCylinder, setCustomCylinder] = useState('');
  const [customFiscalPower, setCustomFiscalPower] = useState<number>(0);
  const [customFuelType, setCustomFuelType] = useState<'essence' | 'diesel'>('essence');
  const [customMarketValue, setCustomMarketValue] = useState('');
  const [customNewValue, setCustomNewValue] = useState('');

  // Saisies Étape 2 : Paramètres du contrat, Options & Ajustements
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationMonths, setDurationMonths] = useState(12);
  const [selectedGuarantees, setSelectedGuarantees] = useState<string[]>([]);
  const [commercialDiscount, setCommercialDiscount] = useState(0); 
  const [includeDTA, setIncludeDTA] = useState(true); 
  const [manualPremiumRC, setManualPremiumRC] = useState('');
  const [manualAccessories, setManualAccessories] = useState('');

  // Résultats Financiers Centraux
  const [financials, setFinancials] = useState<Financials>({
    premium_rc: 0, premium_options: 0, premium_net: 0, premium_acc: 5000,
    tva_amount: 0, carte_rose: 1000, fichier_central: 1000, dta_amount: 0, premium_ttc: 0
  });

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  const selectedCompanyName = (selectedCompany?.short_name || 'GMC') as 'GMC' | 'NSIA' | 'AFRI';

  // 1. Charger les référentiels initiaux au montage
  useEffect(() => {
    async function loadInitialData() {
      const { data: cData } = await (supabase.from('clients') as any).select('id, first_name, last_name, client_type, company_name, city');
      const { data: compData } = await (supabase.from('companies') as any).select('id, code, short_name').eq('is_active', true);
      if (cData) setClients(cData);
      if (compData) setCompanies(compData);
    }
    loadInitialData();
  }, []);

  // 2. Réactivité Client : Détection de la Zone CIMA & Chargement de ses véhicules rattachés
  useEffect(() => {
    if (!selectedClientId) {
      setVehicles([]);
      setSelectedVehicleId('');
      return;
    }

    const targetClient = clients.find(c => c.id === selectedClientId);
    if (targetClient) {
      const detectedZone = getCimaZoneByCity(targetClient.city);
      setCustomZone(detectedZone);
    }

    async function loadClientVehicles() {
      const { data: vData } = await (supabase.from('vehicles') as any)
        .select('*')
        .eq('client_id', selectedClientId);
      
      setVehicles(vData || []);
      setSelectedVehicleId(''); // Reset automatique de la sélection véhicule
    }

    loadClientVehicles();
  }, [selectedClientId, clients]);

  // 3. Réactivité Véhicule : Injection instantanée des spécifications techniques de la base
  useEffect(() => {
    if (!selectedVehicleId) return;

    const targetVehicle = vehicles.find(v => v.id === selectedVehicleId);
    if (targetVehicle) {
      setCustomCategory(targetVehicle.category_code || '01');
      setCustomFiscalPower(Number(targetVehicle.fiscal_power) || 0);
      setCustomFuelType((targetVehicle.fuel_type?.toLowerCase() === 'diesel') ? 'diesel' : 'essence');
      setCustomMarketValue(targetVehicle.market_value ? String(targetVehicle.market_value) : '');
      setCustomNewValue(targetVehicle.new_value ? String(targetVehicle.new_value) : '');
    }
  }, [selectedVehicleId, vehicles]);

  // Fonction centrale pour exécuter le moteur de calcul de tarification (Devenue ASYNC)
  const handleCalculate = async () => {
    if (!selectedCompanyId) {
      alert("Veuillez sélectionner une compagnie d'assurance.");
      return;
    }

    setLoading(true);
    try {
      // Résolution du Bug 1 : Utilisation de await pour la promesse Supabase
      const results = await runAutoCalculation({
        companyName: selectedCompany?.short_name.toUpperCase() || 'GMC',
        customCategory, 
        customZone, 
        customFuelType, 
        customFiscalPower,
        customMarketValue, 
        customNewValue, 
        durationMonths, 
        selectedGuarantees,
        availableGuarantees, 
        includeDTA, 
        commercialDiscount, 
        manualPremiumRC, 
        manualAccessories
      });

      setFinancials(results);
      setStep(3); // On passe directement à l'affichage de la quittance
    } catch (error) {
      console.error("Erreur de calcul : ", error);
      alert("Une erreur est survenue pendant la tarification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/quotes')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">Module Cotation Automobile</h1>
          <p className="text-xs text-gray-500">Infrastructures de tarification segmentée.</p>
        </div>
      </div>

      {/* Barre de Progression Alignée (3 Étapes) */}
      <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className={`pb-2 border-b-2 text-xs font-bold uppercase tracking-wider transition-all ${step >= 1 ? 'border-indigo-600 text-indigo-600' : 'text-gray-400'}`}>
          1. Véhicule & Risques
        </div>
        <div className={`pb-2 border-b-2 text-xs font-bold uppercase tracking-wider transition-all ${step >= 2 ? 'border-indigo-600 text-indigo-600' : 'text-gray-400'}`}>
          2. Tarification & Options
        </div>
        <div className={`pb-2 border-b-2 text-xs font-bold uppercase tracking-wider transition-all ${step >= 3 ? 'border-indigo-600 text-indigo-600' : 'text-gray-400'}`}>
          3. Quittance & Émission
        </div>
      </div>

      {/* Rendu Contrôlé des Étapes */}
      {step === 1 && (
        <StepRiskConfiguration 
          clients={clients} vehicles={vehicles} selectedClientId={selectedClientId}
          setSelectedClientId={setSelectedClientId} selectedVehicleId={selectedVehicleId}
          setSelectedVehicleId={setSelectedVehicleId} customCategory={customCategory}
          setCustomCategory={setCustomCategory} customFuelType={customFuelType}
          setCustomFuelType={setCustomFuelType} customCylinder={customCylinder}
          setCustomCylinder={setCustomCylinder} customFiscalPower={customFiscalPower}
          setCustomFiscalPower={setCustomFiscalPower} customMarketValue={customMarketValue}
          setCustomMarketValue={setCustomMarketValue} customNewValue={customNewValue}
          setCustomNewValue={setCustomNewValue} customZone={customZone} setStep={setStep}
        />
      )}

      {step === 2 && (
        <StepPremiumCalculation 
          selectedCompany={selectedCompanyName}
          includeDTA={includeDTA}
          setIncludeDTA={setIncludeDTA}
          commercialDiscount={commercialDiscount}
          setCommercialDiscount={setCommercialDiscount}
          manualPremiumRC={manualPremiumRC}
          setManualPremiumRC={setManualPremiumRC}
          manualAccessories={manualAccessories}
          setManualAccessories={setManualAccessories}
          customMarketValue={customMarketValue}
          availableGuarantees={availableGuarantees}
          setAvailableGuarantees={setAvailableGuarantees}
          selectedGuarantees={selectedGuarantees}
          setSelectedGuarantees={setSelectedGuarantees}
          customCategory={customCategory}
          onPrevious={() => setStep(1)}
          onCalculate={handleCalculate}
          loading={loading}
        />
      )}

      {step === 3 && (
        <StepQuittanceReceipt 
          financials={financials}
          selectedCompany={selectedCompany}
          durationMonths={durationMonths}
          setStep={setStep}
          editQuoteId={editQuoteId}
          selectedClientId={selectedClientId}
          selectedVehicleId={selectedVehicleId}
          selectedCompanyId={selectedCompanyId}
          startDate={startDate}
          customCategory={customCategory}
          customZone={customZone}
        />
      )}
    </div>
  );
}