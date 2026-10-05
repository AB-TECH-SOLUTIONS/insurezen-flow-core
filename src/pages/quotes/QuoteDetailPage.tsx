import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  FileText, 
  Shield, 
  User, 
  Car, 
  Building, 
  CheckCircle, 
  XCircle, 
  Printer,
  TrendingUp
} from 'lucide-react';

// --- INTERFACES ---
interface QuoteDetail {
  id: string;
  quote_number: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  category_code: string;
  zone_code: string;
  status: 'draft' | 'sent' | 'accepted' | 'refused' | 'expired' | 'converted';
  premium_rc: number;
  premium_options: number;
  premium_net: number;
  premium_acc: number;
  tva_amount: number;
  carte_rose: number;
  fichier_central: number;
  dta_amount: number;
  premium_ttc: number;
  notes: string | null;
  created_at: string;
  clients: {
    first_name: string | null;
    last_name: string;
    client_type: 'particulier' | 'entreprise';
    company_name: string | null;
    phone: string;
    email: string | null;
  };
  vehicles: {
    plate_number: string;
    brand: string;
    model: string;
    fiscal_power: number;
    fuel_type: string;
  } | null;
  companies: {
    name: string;
    short_name: string;
  };
}

interface QuoteGuarantee {
  id: string;
  guarantee_code: string;
  guarantee_label: string;
  premium_ht: number;
  is_mandatory: boolean;
}

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [guarantees, setGuarantees] = useState<QuoteGuarantee[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQuoteDetails();
    }
  }, [id]);

  async function fetchQuoteDetails() {
    if (!id) return;

    try {
      setLoading(true);
      
      // 1. Récupération de la cotation principale avec ses jointures
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .select(`
          *,
          clients (first_name, last_name, client_type, company_name, phone, email),
          vehicles (plate_number, brand, model, fiscal_power, fuel_type),
          companies (name, short_name)
        `)
        .eq('id', id)
        .single();

      if (quoteError) throw quoteError;
      setQuote(quoteData as unknown as QuoteDetail);

      // 2. Récupération de la ventilation des garanties
      const { data: guarData, error: guarError } = await supabase
        .from('quote_guarantees')
        .select('*')
        .eq('quote_id', id);

      if (guarError) throw guarError;
      setGuarantees(guarData || []);

    } catch (error) {
      console.error("Erreur lors de la récupération de la cotation:", error);
      alert("Impossible de charger les détails de la cotation.");
    } finally {
      setLoading(false);
    }
  }

  // Permet de faire progresser le statut commercial du dossier
  async function updateQuoteStatus(newStatus: QuoteDetail['status']) {
    if (!quote) return;
    try {
      setUpdatingStatus(true);
      const { error } = await (supabase
        .from('quotes') as any)
        .update({ status: newStatus })
        .eq('id', quote.id);

      if (error) throw error;
      setQuote({ ...quote, status: newStatus });
    } catch (error) {
      console.error("Erreur de mise à jour du statut:", error);
      alert("Erreur lors du changement de statut.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  function formatFCFA(amount: number) {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount).replace('XAF', 'FCFA');
    }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500">Chargement de la proposition...</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-gray-600">Cotation introuvable.</p>
        <Link to="/quotes" className="text-indigo-600 underline text-sm">Retourner à la liste</Link>
      </div>
    );
  }

  const clientName = quote.clients.client_type === 'entreprise'
    ? quote.clients.company_name
    : `${quote.clients.first_name || ''} ${quote.clients.last_name}`;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      
      {/* Barre d'actions supérieure */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/quotes')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold font-mono text-gray-900">{quote.quote_number}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-indigo-50 text-indigo-700 border border-indigo-100">
                {quote.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Créée le {new Date(quote.created_at).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        {/* Boutons d'action sur le Statut */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-sm text-gray-700 font-medium transition-colors"
          >
            <Printer size={16} /> Imprimer
          </button>
          
          {quote.status === 'draft' && (
            <button 
              onClick={() => updateQuoteStatus('sent')}
              disabled={updatingStatus}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Marquer comme Envoyée
            </button>
          )}

          {quote.status === 'draft' && (
            <button 
              onClick={() => navigate('/quotes/new', { state: { quoteId: quote.id } })}
              disabled={updatingStatus}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-sm font-medium transition-colors"
            >
              ⚙️ Modifier le Brouillon
            </button>
          )}

          {(quote.status === 'draft' || quote.status === 'sent') && (
            <>
              <button 
                onClick={() => updateQuoteStatus('accepted')}
                disabled={updatingStatus}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <CheckCircle size={16} /> Accepter l'offre
              </button>
              <button 
                onClick={() => updateQuoteStatus('refused')}
                disabled={updatingStatus}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
              >
                <XCircle size={16} /> Refuser
              </button>
            </>
          )}

          {quote.status === 'accepted' && (
            <button 
              onClick={() => alert("Fonctionnalité de conversion de facture en cours d'implémentation")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all"
            >
              <TrendingUp size={16} /> Émettre la Police (Contrat)
            </button>
          )}
        </div>
      </div>

      {/* Grille principale d'informations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Colonne de Gauche : Détails de la fiche (Client / Objet) */}
        <div className="space-y-6">
          
          {/* Section Client */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <User size={14} className="text-gray-400" /> Preneur d'assurance
            </h3>
            <div className="text-sm font-bold text-gray-900">{clientName}</div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Tél : {quote.clients.phone}</div>
              {quote.clients.email && <div>Email : {quote.clients.email}</div>}
            </div>
          </div>

          {/* Section Véhicule */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Car size={14} className="text-gray-400" /> Véhicule assuré
            </h3>
            {quote.vehicles ? (
              <>
                <div className="text-sm font-bold text-gray-900">{quote.vehicles.brand} {quote.vehicles.model}</div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Immatriculation : <span className="font-mono font-bold bg-slate-100 px-1 rounded text-slate-700">{quote.vehicles.plate_number}</span></div>
                  <div className="capitalize">Énergie : {quote.vehicles.fuel_type}</div>
                  <div>Puissance fiscale : {quote.vehicles.fiscal_power} CV</div>
                  <div>Usage : Catégorie CIMA {quote.category_code}</div>
                  <div>Zone Tarifaire : {quote.zone_code}</div>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400 italic">Aucun véhicule associé</p>
            )}
          </div>

          {/* Section Partenaire */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building size={14} className="text-gray-400" /> Porteur de Risque
            </h3>
            <div className="text-sm font-bold text-gray-900">{quote.companies.name} ({quote.companies.short_name})</div>
            <div className="text-xs text-gray-500">
              Validité du contrat : {quote.duration_days} jours (Du {new Date(quote.start_date).toLocaleDateString('fr-FR')} au {new Date(quote.end_date).toLocaleDateString('fr-FR')})
            </div>
          </div>

        </div>

        {/* Colonne Centrale & Droite : Facture et Garanties */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Tableau de la ventilation des garanties HT */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Shield size={14} className="text-indigo-600" /> Ventilation Technique des Garanties souscrites
              </h3>
            </div>
            <table className="w-full text-left text-sm divide-y divide-gray-100">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 uppercase bg-gray-50/50">
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Libellé de la Garantie</th>
                  <th className="px-6 py-3 text-right">Prime HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {/* Ligne RC Obligatoire */}
                <tr className="font-medium bg-indigo-50/20">
                  <td className="px-6 py-3 font-mono text-xs text-indigo-700 font-bold">RC</td>
                  <td className="px-6 py-3">Responsabilité Civile (Barème de base obligatoire)</td>
                  <td className="px-6 py-3 text-right font-mono font-bold text-indigo-700">{formatFCFA(quote.premium_rc)}</td>
                </tr>
                {/* Autres garanties annexes */}
                {guarantees.filter(g => g.guarantee_code !== 'RC').map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50/40">
                    <td className="px-6 py-3 font-mono text-xs text-gray-500">{g.guarantee_code}</td>
                    <td className="px-6 py-3 text-gray-600">{g.guarantee_label}</td>
                    <td className="px-6 py-3 text-right font-mono font-medium">{formatFCFA(g.premium_ht || 0)}</td>
                  </tr>
                ))}
                {guarantees.filter(g => g.guarantee_code !== 'RC').length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-xs text-gray-400 italic">Aucune garantie optionnelle souscrite (Garantie RC pure)</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Décompte Financier TTC final */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={14} className="text-gray-400" /> Quittance / Décompte Comptable
            </h3>
            
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Cumul Primes nettes HT (RC + Options)</span>
                <span className="font-mono font-semibold text-gray-900">{formatFCFA(quote.premium_net)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Accessoires Compagnie</span>
                <span className="font-mono font-semibold text-gray-900">{formatFCFA(quote.premium_acc)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>TVA Légale (19.25% au Cameroun)</span>
                <span className="font-mono font-semibold text-gray-900">{formatFCFA(quote.tva_amount)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Droit de Timbre Automobile (DTA)</span>
                <span className="font-mono font-semibold text-gray-900">{formatFCFA(quote.dta_amount)}</span>
              </div>
              <div className="flex justify-between text-gray-500 border-b border-dashed pb-3">
                <span>Taxes de Pool (Carte Rose + Fichier Central ASAC)</span>
                <span className="font-mono font-semibold text-gray-900">{formatFCFA(quote.carte_rose + quote.fichier_central)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 text-base font-bold">
                <span className="text-gray-900">NET À PAYER TTC</span>
                <span className="font-mono text-xl text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                  {formatFCFA(quote.premium_ttc)}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}