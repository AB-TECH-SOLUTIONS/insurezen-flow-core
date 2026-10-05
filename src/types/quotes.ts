// src/types/quotes.ts

import { ReactNode } from "react";

export interface Client {
  id: string;
  first_name: string | null;
  last_name: string;
  client_type: 'particulier' | 'entreprise';
  company_name: string | null;
  city?: string | null;
}

export interface Vehicle {
  id: string;
  plate_number: string;
  brand: string;
  model: string;
  cylinder_capacity?: number | null;
  fiscal_power: number;
  fuel_type: 'essence' | 'diesel' | 'electrique' | 'hybride';
  category_code: string;
  zone_code: string | null;
  market_value: number | null;
  new_value: number | null;
}

export interface Company {
  id: string;
  code: string;
  short_name: string;
}

export interface Guarantee {
  name: ReactNode;
  id: string;
  code: string;
  label: string;
  calc_type: 'pct_venale' | 'pct_neuf' | 'forfait' | 'pct_rc';
  rate: number | null;
  min_amount: number | null;
  is_mandatory: boolean;
}

export interface Financials {
  premium_rc: number;
  premium_options: number;
  premium_net: number;
  premium_acc: number;
  tva_amount: number;
  carte_rose: number;
  fichier_central: number;
  dta_amount: number;
  premium_ttc: number;
}