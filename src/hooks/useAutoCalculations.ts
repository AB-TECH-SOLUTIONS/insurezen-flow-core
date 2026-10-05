import { Financials, Guarantee } from '@/types/quotes';
import { supabase } from '@/lib/supabase'; // Ajuste le chemin vers ton client Supabase

interface RunCalculationParams {
  companyName: string;
  customCategory: string;
  customZone: string;
  customFuelType: 'essence' | 'diesel';
  customFiscalPower: number;
  customMarketValue: string;
  customNewValue: string;
  durationMonths: number;
  selectedGuarantees: string[];
  availableGuarantees: Guarantee[];
  includeDTA: boolean;
  commercialDiscount: number;
  manualPremiumRC: string;
  manualAccessories: string;
}

interface TaxesAndFees {
  tva_rate?: number | string;
  accessories?: number | string;
  carte_rose?: number | string;
  fichier_central?: number | string;
  tva_applicable_on_fc?: boolean | null;
}

export function useAutoCalculations() {
  // La fonction devient asynchrone (async) pour pouvoir utiliser await avec Supabase
  const runAutoCalculation = async (params: RunCalculationParams): Promise<Financials> => {
    const {
      companyName,
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
    } = params;

    // --------------------------------------------------------
    // 1. RÉCUPÉRATION DES PARAMÈTRES DE LA COMPAGNIE (Taxes & Accessoires)
    // --------------------------------------------------------
    // On cherche d'abord l'ID de la compagnie sélectionnée
    const { data: companyData } = await supabase
      .from('companies')
      .select('id')
      .eq('short_name', companyName)
      .single() as { data: { id: string } | null };

    const companyId = companyData?.id;

    // Récupération des constantes légales et frais de quittance propres à cette compagnie
    // Typage explicite pour éviter les erreurs TypeScript lorsque Supabase renvoie 'any' ou 'never'
    const config = companyId
      ? ((await supabase
          .from('taxes_and_fees')
          .select('*')
          .eq('company_id', companyId)
          .maybeSingle()) as { data: TaxesAndFees | null }).data
      : null;

    // Valeurs de repli (fallbacks) si la configuration n'est pas trouvée
    const tvaRate = config?.tva_rate !== undefined ? Number(config.tva_rate) : 0.1925;
    const finalAcc = manualAccessories !== '' 
      ? Math.round(Number(manualAccessories)) 
      : (config?.accessories ? Number(config.accessories) : (companyName === 'GMC' ? 4500 : 5000));
    
    const carteRose = config?.carte_rose ? Number(config.carte_rose) : 1000;
    const fichierCentral = config?.fichier_central ? Number(config.fichier_central) : 1000;
    const tvaOnFichierCentral = (config as TaxesAndFees | null)?.tva_applicable_on_fc ?? true;

    // --------------------------------------------------------
    // 2. CALCUL DE LA RESPONSABILITÉ CIVILE (RC)
    // --------------------------------------------------------
    let premiumRC = 0;

    if (manualPremiumRC !== '') {
      premiumRC = Math.round(Number(manualPremiumRC));
    } else if (companyId) {
      // Requête dynamique sur la grille tarifaire Supabase
      const { data: tariff } = await supabase
        .from('tarifs_rc')
        .select('base_premium')
        .eq('company_id', companyId)
        .eq('category_code', customCategory)
        .eq('zone_code', customZone)
        .eq('fuel_type', customFuelType.toUpperCase())
        .eq('duration_months', durationMonths)
        .lte('fiscal_power_min', customFiscalPower)
        .gte('fiscal_power_max', customFiscalPower)
        .maybeSingle() as { data: { base_premium: number } | null };

      if (tariff) {
        premiumRC = Number(tariff.base_premium);
      } else {
        console.warn(`Aucun tarif RC trouvé pour les critères demandés. Repli à 0.`);
      }
    }

    // --------------------------------------------------------
    // 3. CALCUL DES GARANTIES OPTIONNELLES
    // --------------------------------------------------------
    let premiumOptions = 0;
    const mValue = Number(customMarketValue);
    const ratioDuree = durationMonths / 12;

    if (mValue > 0) {
      availableGuarantees.forEach(g => {
        // Ignorer la RC (déjà calculée) ou les garanties non cochées par l'utilisateur
        if (g.code === 'RC' || !selectedGuarantees.includes(g.code)) return;

        let annualCost = 0;
        const rate = (g.rate || 0) / 100;

        // Formules de calcul dynamiques basées sur la configuration de la garantie
        if (g.calc_type === 'pct_venale') {
          annualCost = mValue * rate;
        } else if (g.calc_type === 'pct_neuf' && customNewValue) {
          annualCost = Number(customNewValue) * rate;
        } else if (g.calc_type === 'forfait') {
          annualCost = g.min_amount || 0;
        } else {
          // Fallbacks de secours basés sur tes anciennes règles codées en dur si la formule n'est pas définie
          if (g.code === 'BDG') annualCost = mValue * (0.5 / 100);
          else if (g.code === 'INC') annualCost = mValue * (0.25 / 100);
          else if (g.code === 'BRAQ') annualCost = mValue * (1.0 / 100);
          else if (g.code === 'DOM') annualCost = mValue * (3.5 / 100);
        }

        premiumOptions += (annualCost * ratioDuree);
      });
    }
    premiumOptions = Math.round(premiumOptions);

    // --------------------------------------------------------
    // 4. NETS, COMMISSIONS ET DROIT DE TIMBRE AUTOMOBILE (DTA)
    // --------------------------------------------------------
    const cumulativeNetHT = premiumRC + premiumOptions;
    const premiumNet = cumulativeNetHT - Math.round(cumulativeNetHT * (commercialDiscount / 100));

    let dtaAmount = 0;
    if (includeDTA) {
      if (customFiscalPower >= 2 && customFiscalPower <= 7) dtaAmount = 30000;
      else if (customFiscalPower >= 8 && customFiscalPower <= 13) dtaAmount = 50000;
      else if (customFiscalPower >= 14 && customFiscalPower <= 20) dtaAmount = 75000;
      else if (customFiscalPower > 20) dtaAmount = 200000;
    }

    // --------------------------------------------------------
    // 5. CALCUL DE LA TAXE SUR LA VALEUR AJOUTÉE (TVA)
    // --------------------------------------------------------
    // La base de calcul intègre le Net, les Accessoires et optionnellement le Fichier Central selon le pays/référentiel
    const baseTVA = premiumNet + finalAcc + (tvaOnFichierCentral ? fichierCentral : 0);
    const tvaAmount = Math.round(baseTVA * tvaRate);

    // --------------------------------------------------------
    // 6. TOTAL TOUTES TAXES COMPRISES (TTC)
    // --------------------------------------------------------
    const premiumTTC = premiumNet + finalAcc + tvaAmount + dtaAmount + carteRose + fichierCentral;

    return {
      premium_rc: premiumRC,
      premium_options: premiumOptions,
      premium_net: premiumNet,
      premium_acc: finalAcc,
      tva_amount: tvaAmount,
      carte_rose: carteRose,
      fichier_central: fichierCentral,
      dta_amount: dtaAmount,
      premium_ttc: premiumTTC
    };
  };

  return { runAutoCalculation };
}