/* ============================================================
   InsureZenFlow — Types TypeScript (générés depuis le schéma SQL)
   Maintenus manuellement — synchroniser avec les migrations
   ============================================================ */

export type UserRole = 'super_admin' | 'admin' | 'agent' | 'courtier'
export type VehicleCategory = 'CAT1' | 'CAT2' | 'CAT3' | 'CAT4A' | 'CAT4B' | 'CAT4C' | 'CAT5' | 'CAT6' | 'CAT7' | 'CAT8' | 'CAT9' | 'CAT11'
export type TariffZone = 'A' | 'B' | 'C'
export type FuelType = 'essence' | 'diesel' | 'electrique' | 'hybride'
export type PaymentMethod = 'especes' | 'cheque' | 'momo_mtn' | 'momo_orange' | 'virement'
export type ContractStatus = 'active' | 'expired' | 'cancelled' | 'suspended'
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'cancelled'
export type ReversalStatus = 'pending' | 'partial' | 'reversed' | 'overdue'
export type ClaimStatus = 'declared' | 'transmitted' | 'under_expertise' | 'pending_payment' | 'paid' | 'rejected' | 'closed'
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'refused' | 'expired' | 'converted'
export type MovementType = 'affaire_nouvelle' | 'renouvellement' | 'avenant_modif' | 'avenant_resil'
export type ClientType = 'particulier' | 'entreprise'
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled'
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'

/* ── Profil utilisateur ─────────────────────────────────── */
export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: UserRole
  is_active: boolean
  avatar_url: string | null
  created_at: string
  updated_at: string
}

/* ── Compagnie ──────────────────────────────────────────── */
export interface Company {
  id: string
  code: string
  name: string
  short_name: string
  logo_url: string | null
  phone: string | null
  email: string | null
  address: string | null
  bureau_code: string | null
  is_active: boolean
  bank_accounts: BankAccount[]
  contacts: CompanyContact[]
  created_at: string
  updated_at: string
}

export interface BankAccount {
  bank: string
  account_number: string
  label?: string
}

export interface CompanyContact {
  name: string
  title?: string
  phone?: string
  email?: string
}

/* ── Zone tarifaire ─────────────────────────────────────── */
export interface TariffZoneRecord {
  id: string
  code: TariffZone
  label: string
  description: string | null
  cities: string[]
}

/* ── Catégorie véhicule ─────────────────────────────────── */
export interface VehicleCategoryRecord {
  id: string
  code: VehicleCategory
  label: string
  description: string | null
  sort_order: number
}

/* ── Tarif RC Auto ──────────────────────────────────────── */
export interface TariffRCAuto {
  id: string
  category_code: VehicleCategory
  zone_code: TariffZone
  fuel_type: 'essence' | 'diesel' | 'both'
  cv_min: number
  cv_max: number | null
  base_premium: number
  is_active: boolean
  updated_at: string
}

/* ── Garantie ───────────────────────────────────────────── */
export interface TariffGuarantee {
  id: string
  company_id: string | null
  category_code: VehicleCategory | null
  code: string
  label: string
  calc_type: 'pct_venale' | 'pct_neuf' | 'forfait' | 'pct_rc'
  rate: number | null
  min_amount: number | null
  max_amount: number | null
  franchise_pct: number | null
  is_mandatory: boolean
  is_active: boolean
  sort_order: number
}

/* ── Commission compagnie ───────────────────────────────── */
export interface CompanyCommission {
  id: string
  company_id: string
  branch_code: string
  branch_label: string
  rate_pct: number
  applies_to: string
  is_active: boolean
  notes: string | null
  updated_at: string
}

/* ── Paramètres fiscaux ─────────────────────────────────── */
export interface FiscalParam {
  id: string
  code: string
  label: string
  value: number
  value_type: 'pct' | 'forfait'
  applies_to: string | null
  notes: string | null
  updated_at: string
}

/* ── Client ─────────────────────────────────────────────── */
export interface Client {
  id: string
  client_type: ClientType
  title: string | null
  first_name: string | null
  last_name: string
  company_name: string | null
  phone: string
  phone2: string | null
  email: string | null
  address: string | null
  city: string | null
  zone_code: TariffZone | null
  id_type: string | null
  id_number: string | null
  id_expiry: string | null
  niu: string | null
  profession: string | null
  notes: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export function getClientFullName(client: Client): string {
  if (client.client_type === 'entreprise') return client.company_name ?? client.last_name
  const parts = [client.title, client.first_name, client.last_name].filter(Boolean)
  return parts.join(' ')
}

/* ── Véhicule ───────────────────────────────────────────── */
export interface Vehicle {
  id: string
  client_id: string
  plate_number: string
  plate_date: string | null
  first_circulation: string | null
  brand: string
  model: string | null
  body_type: string | null
  fuel_type: FuelType
  fiscal_power: number
  real_power: number | null
  seats: number | null
  seats_hc: number
  weight_empty: number | null
  payload: number | null
  ptac: number | null
  chassis_number: string | null
  category_code: VehicleCategory
  usage: string
  zone_code: TariffZone | null
  market_value: number | null
  new_value: number | null
  has_trailer: boolean
  transports_flammable: boolean
  is_active: boolean
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Relations optionnelles (joined)
  client?: Client
}

/* ── Garantie sélectionnée (quote/contract) ─────────────── */
export interface SelectedGuarantee {
  id?: string
  guarantee_code: string
  guarantee_label: string
  sum_assured: number | null
  premium_ht: number
  franchise_pct: number | null
  franchise_min: number | null
  is_mandatory: boolean
}

/* ── Cotation ───────────────────────────────────────────── */
export interface Quote {
  id: string
  quote_number: string
  client_id: string
  vehicle_id: string | null
  company_id: string
  start_date: string
  end_date: string
  duration_days: number
  category_code: VehicleCategory
  zone_code: TariffZone
  premium_rc: number
  premium_options: number
  premium_net: number
  premium_acc: number
  tva_amount: number
  carte_rose: number
  fichier_central: number
  dta_amount: number
  tca_amount: number
  premium_ttc: number
  bns_years: number
  bns_rate: number
  bns_amount: number
  fleet_discount_rate: number
  fleet_discount_amount: number
  status: QuoteStatus
  valid_until: string | null
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
  // Relations
  client?: Client
  vehicle?: Vehicle
  company?: Company
  guarantees?: SelectedGuarantee[]
}

/* ── Contrat ────────────────────────────────────────────── */
export interface Contract {
  id: string
  contract_number: string
  company_policy_number: string | null
  company_quote_number: string | null
  attestation_number: string | null
  carte_rose_number: string | null
  quittance_number: string | null
  quote_id: string | null
  client_id: string
  vehicle_id: string | null
  company_id: string
  agent_id: string
  effect_date: string
  expiry_date: string
  duration_days: number
  category_code: VehicleCategory
  zone_code: TariffZone
  movement_type: MovementType
  premium_net: number
  premium_acc: number
  tva_amount: number
  carte_rose: number
  fichier_central: number
  dta_amount: number
  tca_amount: number
  premium_ttc: number
  commission_rate: number
  commission_amount: number
  payment_status: PaymentStatus
  amount_paid: number
  amount_due: number
  reversal_status: ReversalStatus
  reversal_due_date: string | null
  amount_reversed: number
  status: ContractStatus
  renewal_alert_sent: boolean
  renewal_alert_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Relations
  client?: Client
  vehicle?: Vehicle
  company?: Company
  agent?: Profile
  guarantees?: SelectedGuarantee[]
}

/* ── Encaissement ───────────────────────────────────────── */
export interface Payment {
  id: string
  payment_number: string
  contract_id: string
  client_id: string
  company_id: string
  received_by: string
  amount: number
  payment_method: PaymentMethod
  payment_ref: string | null
  momo_number: string | null
  momo_recipient: string | null
  payment_date: string
  status: string
  commission_rate: number
  commission_amount: number
  reversal_amount: number
  reversal_due_date: string | null
  reversal_id: string | null
  notes: string | null
  created_at: string
  // Relations
  contract?: Contract
  client?: Client
  company?: Company
}

/* ── Reversement ────────────────────────────────────────── */
export interface Reversement {
  id: string
  reversal_number: string
  company_id: string
  prepared_by: string
  period_start: string
  period_end: string
  total_premiums: number
  total_commissions: number
  total_reversed: number
  payment_method: PaymentMethod | null
  payment_ref: string | null
  payment_date: string | null
  due_date: string
  status: string
  bordereau_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Relations
  company?: Company
}

/* ── Sinistre ───────────────────────────────────────────── */
export interface Claim {
  id: string
  claim_number: string
  contract_id: string
  client_id: string
  company_id: string
  agent_id: string
  event_date: string
  declaration_date: string
  event_type: string | null
  event_description: string | null
  event_location: string | null
  company_claim_number: string | null
  company_manager: string | null
  company_manager_phone: string | null
  expert_name: string | null
  expert_date: string | null
  estimated_amount: number | null
  status: ClaimStatus
  status_date: string | null
  status_notes: string | null
  indemnity_amount: number | null
  indemnity_date: string | null
  pv_deadline: string | null
  offer_deadline: string | null
  documents: ClaimDocument[]
  notes: string | null
  created_at: string
  updated_at: string
  // Relations
  contract?: Contract
  client?: Client
  company?: Company
}

export interface ClaimDocument {
  name: string
  url: string
  uploaded_at: string
}

/* ── Stock attestations ─────────────────────────────────── */
export interface DocumentStock {
  id: string
  company_id: string
  document_type: 'attestation' | 'carte_rose'
  range_start: string
  range_end: string
  quantity_received: number
  quantity_used: number
  quantity_annulled: number
  received_date: string
  status: string
  notes: string | null
  created_by: string | null
  created_at: string
  company?: Company
}

/* ── Tâche ──────────────────────────────────────────────── */
export interface Task {
  id: string
  title: string
  description: string | null
  assigned_to: string | null
  created_by: string
  client_id: string | null
  contract_id: string | null
  claim_id: string | null
  priority: TaskPriority
  due_date: string | null
  completed_at: string | null
  status: TaskStatus
  created_at: string
  assigned_profile?: Profile
  created_profile?: Profile
}

/* ── Message ────────────────────────────────────────────── */
export interface Message {
  id: string
  from_id: string
  to_id: string
  subject: string | null
  body: string
  is_read: boolean
  read_at: string | null
  contract_id: string | null
  claim_id: string | null
  created_at: string
  from_profile?: Profile
  to_profile?: Profile
}

/* ── Calcul prime (résultat moteur tarifaire) ───────────── */
export interface PremiumCalculation {
  // Entrées
  categoryCode: VehicleCategory
  zoneCode: TariffZone
  fuelType: FuelType
  fiscalPower: number
  marketValue: number
  newValue: number
  seatsHC: number
  hasTrailer: boolean
  transportsFlammable: boolean
  durationDays: number
  bnsYears: number
  selectedGuaranteeCodes: string[]
  // Résultats
  premiumRC: number
  premiumOptions: number
  premiumBrut: number
  bnsRate: number
  bnsAmount: number
  premiumNet: number
  accessoires: number
  tva: number
  carteRose: number
  fichierCentral: number
  dta: number
  tca: number
  premiumTTC: number
  // Détail garanties
  guaranteeDetails: SelectedGuarantee[]
}

/* ── Type helper Database pour Supabase ─────────────────── */
export interface Database {
  public: {
    Tables: {
      profiles:           { Row: Profile;           Insert: Partial<Profile>;           Update: Partial<Profile> }
      companies:          { Row: Company;            Insert: Partial<Company>;            Update: Partial<Company> }
      tariff_zones:       { Row: TariffZoneRecord;   Insert: Partial<TariffZoneRecord>;   Update: Partial<TariffZoneRecord> }
      vehicle_categories: { Row: VehicleCategoryRecord; Insert: Partial<VehicleCategoryRecord>; Update: Partial<VehicleCategoryRecord> }
      tariff_rc_auto:     { Row: TariffRCAuto;       Insert: Partial<TariffRCAuto>;       Update: Partial<TariffRCAuto> }
      tariff_guarantees:  { Row: TariffGuarantee;    Insert: Partial<TariffGuarantee>;    Update: Partial<TariffGuarantee> }
      company_commissions:{ Row: CompanyCommission;  Insert: Partial<CompanyCommission>;  Update: Partial<CompanyCommission> }
      fiscal_params:      { Row: FiscalParam;        Insert: Partial<FiscalParam>;        Update: Partial<FiscalParam> }
      clients:            { Row: Client;             Insert: Partial<Client>;             Update: Partial<Client> }
      vehicles:           { Row: Vehicle;            Insert: Partial<Vehicle>;            Update: Partial<Vehicle> }
      quotes:             { Row: Quote;              Insert: Partial<Quote>;              Update: Partial<Quote> }
      quote_guarantees:   { Row: SelectedGuarantee;  Insert: Partial<SelectedGuarantee>;  Update: Partial<SelectedGuarantee> }
      contracts:          { Row: Contract;           Insert: Partial<Contract>;           Update: Partial<Contract> }
      contract_guarantees:{ Row: SelectedGuarantee;  Insert: Partial<SelectedGuarantee>;  Update: Partial<SelectedGuarantee> }
      payments:           { Row: Payment;            Insert: Partial<Payment>;            Update: Partial<Payment> }
      reversements:       { Row: Reversement;        Insert: Partial<Reversement>;        Update: Partial<Reversement> }
      claims:             { Row: Claim;              Insert: Partial<Claim>;              Update: Partial<Claim> }
      document_stock:     { Row: DocumentStock;      Insert: Partial<DocumentStock>;      Update: Partial<DocumentStock> }
      tasks:              { Row: Task;               Insert: Partial<Task>;               Update: Partial<Task> }
      messages:           { Row: Message;            Insert: Partial<Message>;            Update: Partial<Message> }
    }
  }
}