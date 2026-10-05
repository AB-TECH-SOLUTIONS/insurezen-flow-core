export type VehicleCategory = 'CAT_1' | 'CAT_2' | 'CAT_3';
export type Zone = 'ZONE_A' | 'ZONE_B' | 'ZONE_C';
export type FuelType = 'ESSENCE' | 'DIESEL';

export interface QuoteInput {
  company: 'NSIA' | 'AFRI';
  category: VehicleCategory;
  zone: Zone;
  fuelType: FuelType;
  fiscalPower: number;
  seatsCount: number; // Nombre de places transportées (hors conducteur)
  vehicleValue: number; // Valeur à neuf pour les garanties annexes
  vehicleAge: number; // Âge du véhicule en années
  hasTrailer: boolean;
  selectedGuarantees: string[]; // ['RC', 'DR', 'BDG', 'DOMMAGES', 'INCENDIE', 'VOL']
  durationDays: number; // Souvent 365 par défaut
  isInflammableMaterial?: boolean; // Spécifique CAT_2
}

// 1. Grille RC Catégorie 1 (Tourisme)
const RC_GRID_CAT_1 = [
  { maxEssence: 2, maxDiesel: 0, A: 50311, B: 48124, C: 45937 },
  { maxEssence: 6, maxDiesel: 4, A: 63784, B: 60949, C: 58114 },
  { maxEssence: 10, maxDiesel: 7, A: 70877, B: 67924, C: 64970 },
  { maxEssence: 14, maxDiesel: 10, A: 88643, B: 84789, C: 80935 },
  { maxEssence: 23, maxDiesel: 16, A: 112858, B: 107951, C: 103044 },
  { maxEssence: 999, maxDiesel: 999, A: 133077, B: 127291, C: 121505 },
];

// 2. Grille RC Catégorie 2 (Propre Compte)
const RC_GRID_CAT_2 = [
  { maxEssence: 2, maxDiesel: 1, A: 58759, B: 56311, C: 53863, inflammable: 13213 },
  { maxEssence: 6, maxDiesel: 4, A: 71183, B: 68217, C: 65251, inflammable: 13213 },
  { maxEssence: 10, maxDiesel: 7, A: 80918, B: 77547, C: 74175, inflammable: 13213 },
  { maxEssence: 14, maxDiesel: 10, A: 121212, B: 116162, C: 111111, inflammable: 21144 },
  { maxEssence: 23, maxDiesel: 16, A: 150086, B: 143833, C: 137579, inflammable: 21144 },
  { maxEssence: 999, maxDiesel: 999, A: 173591, B: 166358, C: 159125, inflammable: 21144 },
];

// 3. Forfaits Vol/Incendie pour Catégorie 3 (Marchandises)
const FORFAITS_CAT_3 = [
  { maxVal: 4000000, volSimpleMoins2: 9205, volSimplePlus2: 4565, incendieMoins2: 50015, incendiePlus2: 24815 },
  { maxVal: 6000000, volSimpleMoins2: 15345, volSimplePlus2: 7705, incendieMoins2: 83360, incendiePlus2: 41875 },
  { maxVal: 10000000, volSimpleMoins2: 24550, volSimplePlus2: 12275, incendieMoins2: 133380, incendiePlus2: 66690 },
  { maxVal: 16000000, volSimpleMoins2: 39890, volSimplePlus2: 19980, incendieMoins2: 216740, incendiePlus2: 108565 },
  { maxVal: Infinity, volSimpleMoins2: 61375, volSimplePlus2: 30685, incendieMoins2: 333445, incendiePlus2: 166725 },
];

export function calculateQuote(input: QuoteInput) {
  const {
    category, zone, fuelType, fiscalPower, seatsCount,
    vehicleValue, vehicleAge, hasTrailer, selectedGuarantees,
    durationDays, isInflammableMaterial
  } = input;

  let primeRcDeBase = 0;
  let surprimeMatInflammable = 0;

  // --- CALCUL RC DE BASE ---
  if (category === 'CAT_1') {
    const row = RC_GRID_CAT_1.find(r => 
      fuelType === 'ESSENCE' ? fiscalPower <= r.maxEssence : fiscalPower <= r.maxDiesel
    ) || RC_GRID_CAT_1[RC_GRID_CAT_1.length - 1];
    primeRcDeBase = zone === 'ZONE_A' ? row.A : zone === 'ZONE_B' ? row.B : row.C;
  } 
  else if (category === 'CAT_2') {
    const row = RC_GRID_CAT_2.find(r => 
      fuelType === 'ESSENCE' ? fiscalPower <= r.maxEssence : fiscalPower <= r.maxDiesel
    ) || RC_GRID_CAT_2[RC_GRID_CAT_2.length - 1];
    primeRcDeBase = zone === 'ZONE_A' ? row.A : zone === 'ZONE_B' ? row.B : row.C;
    
    if (isInflammableMaterial && zone === 'ZONE_A') {
      surprimeMatInflammable = row.inflammable;
    }
  }
  // Tu pourras ajouter la CAT_3 ici selon ton besoin exact de prime de base

  // --- SURPRIMES OBLIGATOIRES RC ---
  let surprimePlaces = 0;
  if (category === 'CAT_1') {
    surprimePlaces = seatsCount * 1800; // 1 800 FCFA par place transportée
  } else if (category === 'CAT_2') {
    // Si places aménagées hors cabine (à spécifier via ton UI si besoin)
    // surprimePlaces = placesHorsCabine * 2900;
  }

  let surprimeRemorque = 0;
  if (hasTrailer) {
    const coefficient = category === 'CAT_1' ? 0.10 : category === 'CAT_2' ? 0.20 : 0.30;
    surprimeRemorque = primeRcDeBase * coefficient;
  }

  const primeRcTotaleNette = primeRcDeBase + surprimePlaces + surprimeRemorque + surprimeMatInflammable;

  // --- GARANTIES ANNEXES ---
  let primeDr = 0;
  let primeBdg = 0;
  let primeDommages = 0;
  let primeIncendie = 0;
  let primeVol = 0;

  if (selectedGuarantees.includes('DR')) primeDr = 5000;

  if (selectedGuarantees.includes('BDG')) {
    const tauxBdg = category === 'CAT_1' ? 0.0030 : 0.0040;
    primeBdg = vehicleValue * tauxBdg;
  }

  if (selectedGuarantees.includes('DOMMAGES') && vehicleAge <= 3) {
    // Exemple calcul Tous Risques (5% pour CAT_1, 7% pour CAT_2)
    const tauxDommages = category === 'CAT_1' ? 0.05 : 0.07;
    primeDommages = vehicleValue * tauxDommages;
  }

  if (selectedGuarantees.includes('INCENDIE')) {
    if (category === 'CAT_1' || category === 'CAT_2') {
      primeIncendie = vehicleValue * 0.0024;
      if (isInflammableMaterial) primeIncendie *= 2; // +100% si matières dangereuses
    } else if (category === 'CAT_3') {
      const row = FORFAITS_CAT_3.find(r => vehicleValue <= r.maxVal) || FORFAITS_CAT_3[FORFAITS_CAT_3.length - 1];
      primeIncendie = vehicleAge <= 2 ? row.incendieMoins2 : row.incendiePlus2;
    }
  }

  if (selectedGuarantees.includes('VOL')) {
    if (category === 'CAT_1' || category === 'CAT_2') {
      primeVol = vehicleValue * 0.01; // Vol simple
    } else if (category === 'CAT_3') {
      const row = FORFAITS_CAT_3.find(r => vehicleValue <= r.maxVal) || FORFAITS_CAT_3[FORFAITS_CAT_3.length - 1];
      primeVol = vehicleAge <= 2 ? row.volSimpleMoins2 : row.volSimplePlus2;
    }
  }

  // --- CUMUL ET PRORATA TEMPORIS ---
  const totalPrimeNetteAnnuelle = primeRcTotaleNette + primeDr + primeBdg + primeDommages + primeIncendie + primeVol;
  
  // Application règle de durée (Prorata temporis simplifié ou stricte)
  let fractionDuree = 1;
  if (durationDays <= 60) fractionDuree = 0.20;
  else if (durationDays <= 120) fractionDuree = 0.40;
  else if (durationDays <= 180) fractionDuree = 0.60;
  else if (durationDays <= 240) fractionDuree = 0.80;

  const totalPrimeNetteProratisee = totalPrimeNetteAnnuelle * fractionDuree;

  // --- FRAIS D'ACCESSOIRES (Selon tranches prime nette) ---
  let accessoires = 5000;
  if (totalPrimeNetteProratisee >= 20000000) accessoires = 100000;
  else if (totalPrimeNetteProratisee >= 5000000) accessoires = 50000;
  else if (totalPrimeNetteProratisee >= 1000000) accessoires = 20000;
  else if (totalPrimeNetteProratisee >= 500000) accessoires = 15000;
  else if (totalPrimeNetteProratisee >= 100000) accessoires = 7500;

  // --- TAXES FIXES ---
  const taxeAsac = 1500;
  const carteRose = 1000;
  
  // --- TAXE SUR LE CHIFFRE D'AFFAIRES / TVA ET SYNTHÈSE ---
  // Note : Ajuste ici selon le taux de taxe d'assurance / TVA combiné de ta zone (ex: ~19.25% au Cameroun sur primes nettes + accessoires)
  const tauxTaxes = 0.1925; 
  const taxesSurPrime = (totalPrimeNetteProratisee + accessoires) * tauxTaxes;

  const ttc = totalPrimeNetteProratisee + accessoires + taxeAsac + carteRose + taxesSurPrime;

  return {
    primeNetteFixe: Math.round(totalPrimeNetteProratisee),
    accessoires: Math.round(accessoires),
    taxes: Math.round(taxesSurPrime),
    fondsNationaux: taxeAsac + carteRose,
    totalTtc: Math.round(ttc)
  };
}