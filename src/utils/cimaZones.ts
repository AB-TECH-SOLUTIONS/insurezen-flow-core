// src/utils/cimaZones.ts

export const CIMA_ZONES_MAPPING: Record<string, 'A' | 'B' | 'C'> = {
  // Zone A : Agglomérations à très forte circulation
  'douala': 'A',
  'yaounde': 'A',
  'yaoundé': 'A',

  // Zone B : Moyennes agglomérations
  'bafoussam': 'B',
  'bamenda': 'B',
  'garoua': 'B',
  'maroua': 'B',
  'ngaoundere': 'B',
  'ngaoundéré': 'B',

  // Zone C : Autres villes, chefs-lieux et zones rurales
  'ebolowa': 'C',
  'bertoua': 'C',
  'kribi': 'C',
  'limbe': 'C',
  'buea': 'C',
  'buéa': 'C'
};

/**
 * Récupère la zone CIMA (A, B ou C) à partir du nom d'une ville
 */
export function getCimaZoneByCity(city: string | null | undefined): 'A' | 'B' | 'C' {
  if (!city) return 'C'; // Par défaut, zone rurale / la moins chère
  
  const normalizedCity = city.trim().toLowerCase();
  return CIMA_ZONES_MAPPING[normalizedCity] || 'C';
}