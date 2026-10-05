import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@lib/supabase'; // À ajuster selon ton arborescence
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Clock 
} from 'lucide-react';

interface QuoteListItem {
  id: string;
  quote_number: string;
  start_date: string;
  end_date: string;
  premium_ttc: number;
  status: 'draft' | 'sent' | 'accepted' | 'refused' | 'expired' | 'converted';
  created_at: string;
  clients: {
    first_name: string | null;
    last_name: string;
    client_type: 'particulier' | 'entreprise';
    company_name: string | null;
  };
  companies: {
    short_name: string;
    name: string;
  };
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchQuotes();
  }, []);

  async function fetchQuotes() {
    try {
      setLoading(true);
      // Jointure Supabase automatique grâce aux clés étrangères
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id,
          quote_number,
          start_date,
          end_date,
          premium_ttc,
          status,
          created_at,
          clients (first_name, last_name, client_type, company_name),
          companies (short_name, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data as unknown as QuoteListItem[]);
    } catch (error) {
      console.error('Erreur lors de la récupération des cotations:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filtrage côté client pour une meilleure réactivité
  const filteredQuotes = quotes.filter(quote => {
    const clientName = quote.clients.client_type === 'entreprise'
      ? quote.clients.company_name?.toLowerCase() || ''
      : `${quote.clients.first_name || ''} ${quote.clients.last_name}`.toLowerCase();
    
    const matchesSearch = 
      quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.includes(searchTerm.toLowerCase()) ||
      quote.companies.short_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Helper pour formater les montants en FCFA
  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount).replace('XAF', 'FCFA');
  };

  // Helper pour les badges de statut
  const getStatusBadge = (status: QuoteListItem['status']) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      sent: 'bg-blue-100 text-blue-800 border-blue-200',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      refused: 'bg-red-100 text-red-800 border-red-200',
      expired: 'bg-amber-100 text-amber-800 border-amber-200',
      converted: 'bg-purple-100 text-purple-800 border-purple-200',
    };

    const labels = {
      draft: 'Brouillon',
      sent: 'Envoyée',
      accepted: 'Acceptée',
      refused: 'Refusée',
      expired: 'Expirée',
      converted: 'Convertie en Police',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cotations & Propositions</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez et tarifez les offres IARD / Automobile de vos prospects.</p>
        </div>
        <Link
          to="/quotes/new" // Redirection vers le formulaire de création
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-colors text-sm"
        >
          <Plus size={18} />
          Nouvelle Cotation
        </Link>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par N° de cotation, client, compagnie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="sent">Envoyée</option>
            <option value="accepted">Acceptée</option>
            <option value="refused">Refusée</option>
            <option value="expired">Expirée</option>
            <option value="converted">Convertie</option>
          </select>
        </div>
      </div>

      {/* Contenu principal / Tableau */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500">Chargement des cotations...</p>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="text-center p-12 space-y-3">
            <div className="mx-auto w-12 h-12 bg-gray-50 flex items-center justify-center rounded-xl text-gray-400">
              <FileText size={24} />
            </div>
            <p className="text-gray-900 font-medium">Aucune cotation trouvée</p>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'all' 
                ? "Modifiez vos filtres ou votre recherche pour trouver d'autres résultats."
                : "Commencez par générer votre première cotation automobile personnalisée."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Référence</th>
                  <th className="px-6 py-3.5">Client / Assuré</th>
                  <th className="px-6 py-3.5">Compagnie</th>
                  <th className="px-6 py-3.5">Période</th>
                  <th className="px-6 py-3.5">Prime Totale TTC</th>
                  <th className="px-6 py-3.5">Statut</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredQuotes.map((quote) => {
                  const clientLabel = quote.clients.client_type === 'entreprise'
                    ? quote.clients.company_name
                    : `${quote.clients.first_name || ''} ${quote.clients.last_name}`;

                  return (
                    <tr key={quote.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">
                        {quote.quote_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{clientLabel}</div>
                        <div className="text-xs text-gray-400 capitalize">{quote.clients.client_type}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold px-2 py-1 bg-slate-100 rounded text-xs text-slate-700">
                          {quote.companies.short_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        Du {new Date(quote.start_date).toLocaleDateString('fr-FR')} <br />
                        Au {new Date(quote.end_date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {formatFCFA(quote.premium_ttc)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(quote.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/quotes/${quote.id}`} // Lien vers la vue détaillée
                          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-indigo-600 font-medium px-2.5 py-1.5 rounded-md hover:bg-gray-100 transition-all text-xs"
                        >
                          <Eye size={14} />
                          Consulter
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}