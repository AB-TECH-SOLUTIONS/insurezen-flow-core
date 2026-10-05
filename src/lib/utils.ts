import { clsx, type ClassValue } from 'clsx'

/* ── Tailwind class merge ─────────────────────────────────── */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/* ── Formatage montants FCFA ──────────────────────────────── */
export function formatFCFA(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  return new Intl.NumberFormat('fr-FR').format(n)
}

/* ── Dates ────────────────────────────────────────────────── */
export function formatDate(
  date: string | Date | null | undefined,
  opts?: Intl.DateTimeFormatOptions
): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', opts ?? {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export function formatDateLong(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function addDays(date: Date | string, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function daysDiff(from: Date | string, to: Date | string): number {
  const a = new Date(from).getTime()
  const b = new Date(to).getTime()
  return Math.ceil((b - a) / (1000 * 60 * 60 * 24))
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}

export function daysUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null
  return daysDiff(new Date(), date)
}

/* ── Zone géographique auto ───────────────────────────────── */
const ZONE_A_CITIES = ['douala', 'yaoundé', 'yaounde', 'bafoussam', 'garoua', 'bamenda']
const ZONE_B_CITIES = [
  'maroua', 'ngaoundéré', 'ngaoundere', 'ebolowa', 'buéa', 'buea',
  'bertoua', 'kumba', 'limbe', 'edéa', 'edea', 'nkongsamba',
  'dschang', 'foumban', 'sangmélima', 'sangmelima', 'mbalmayo', 'kribi', 'kumbo', 'mbouda',
]

export function detectZone(city: string): 'A' | 'B' | 'C' {
  const normalized = city.toLowerCase().trim()
  if (ZONE_A_CITIES.some(c => normalized.includes(c))) return 'A'
  if (ZONE_B_CITIES.some(c => normalized.includes(c))) return 'B'
  return 'C'
}

/* ── Droit de Timbre Auto (DTA) par CV ───────────────────── */
export function getDTA(fiscalPower: number): number {
  if (fiscalPower <= 7)  return 15000
  if (fiscalPower <= 13) return 25000
  if (fiscalPower <= 20) return 50000
  return 100000
}

/* ── BNS (Bonus Non Sinistre) ─────────────────────────────── */
export function getBNSRate(yearsWithoutClaim: number): number {
  if (yearsWithoutClaim <= 0) return 0
  if (yearsWithoutClaim === 1) return 5
  if (yearsWithoutClaim === 2) return 10
  if (yearsWithoutClaim === 3) return 15
  return 20 // 4 ans et plus
}

/* ── Accessoires par tranche de prime nette ──────────────── */
export function getAccessoires(primeNette: number): number {
  if (primeNette < 10000)    return 2500
  if (primeNette < 100000)   return 4000
  if (primeNette < 500000)   return 6000
  if (primeNette < 1000000)  return 15000
  if (primeNette < 5000000)  return 20000
  if (primeNette < 20000000) return 50000
  return 100000
}

/* ── Surprimes obligatoires CAT1 ─────────────────────────── */
export function getPersonnesTransporteesSurprime(seatsHC: number): number {
  // 1 800 FCFA par place en sus du conducteur (à partir de la 2ème place)
  return Math.max(0, seatsHC) * 1800
}

/* ── Statut contrat → badge ───────────────────────────────── */
export function getContractStatusBadge(status: string): {
  label: string
  className: string
} {
  const map: Record<string, { label: string; className: string }> = {
    active:    { label: 'Actif',    className: 'iz-badge-success' },
    expired:   { label: 'Expiré',   className: 'iz-badge-danger' },
    cancelled: { label: 'Résilié',  className: 'iz-badge-gray' },
    suspended: { label: 'Suspendu', className: 'iz-badge-amber' },
  }
  return map[status] ?? { label: status, className: 'iz-badge-gray' }
}

export function getPaymentStatusBadge(status: string): {
  label: string
  className: string
} {
  const map: Record<string, { label: string; className: string }> = {
    paid:     { label: 'Payé',         className: 'iz-badge-success' },
    pending:  { label: 'En attente',   className: 'iz-badge-amber' },
    partial:  { label: 'Partiel',      className: 'iz-badge-brand' },
    cancelled:{ label: 'Annulé',       className: 'iz-badge-gray' },
  }
  return map[status] ?? { label: status, className: 'iz-badge-gray' }
}

export function getReversalStatusBadge(status: string): {
  label: string
  className: string
} {
  const map: Record<string, { label: string; className: string }> = {
    pending:  { label: 'À reverser',  className: 'iz-badge-amber' },
    reversed: { label: 'Reversé',     className: 'iz-badge-success' },
    overdue:  { label: '⚠ En retard', className: 'iz-badge-danger' },
    partial:  { label: 'Partiel',     className: 'iz-badge-brand' },
  }
  return map[status] ?? { label: status, className: 'iz-badge-gray' }
}

export function getClaimStatusBadge(status: string): {
  label: string
  className: string
} {
  const map: Record<string, { label: string; className: string }> = {
    declared:        { label: 'Déclaré',         className: 'iz-badge-amber' },
    transmitted:     { label: 'Transmis',         className: 'iz-badge-brand' },
    under_expertise: { label: 'En expertise',     className: 'iz-badge-brand' },
    pending_payment: { label: 'Indemnité en cours',className: 'iz-badge-amber' },
    paid:            { label: 'Indemnisé',         className: 'iz-badge-success' },
    rejected:        { label: 'Rejeté',            className: 'iz-badge-danger' },
    closed:          { label: 'Clôturé',           className: 'iz-badge-gray' },
  }
  return map[status] ?? { label: status, className: 'iz-badge-gray' }
}

/* ── Mode de paiement → label ─────────────────────────────── */
export function getPaymentMethodLabel(method: string): string {
  const map: Record<string, string> = {
    especes:      'Espèces',
    cheque:       'Chèque',
    momo_mtn:     'MTN MoMo',
    momo_orange:  'Orange Money',
    virement:     'Virement bancaire',
  }
  return map[method] ?? method
}

/* ── Durée assurance courte durée ─────────────────────────── */
export function getShortTermRate(days: number): number {
  if (days <= 60)  return 0.20
  if (days <= 120) return 0.40
  if (days <= 180) return 0.60
  if (days <= 240) return 0.80
  return 1.00
}

/* ── Tronquer texte ───────────────────────────────────────── */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/* ── Initiales ────────────────────────────────────────────── */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

/* ── Délai reversement CIMA (J+30) ───────────────────────── */
export function getReversalDueDate(paymentDate: Date | string): Date {
  return addDays(paymentDate, 30)
}

/* ── Alerte délai CIMA ────────────────────────────────────── */
export function getCIMAAlertLevel(dueDate: Date | string | null): 'none' | 'warning' | 'critical' | 'overdue' {
  if (!dueDate) return 'none'
  const days = daysUntil(dueDate)
  if (days === null) return 'none'
  if (days < 0)  return 'overdue'
  if (days <= 7) return 'critical'
  if (days <= 14) return 'warning'
  return 'none'
}