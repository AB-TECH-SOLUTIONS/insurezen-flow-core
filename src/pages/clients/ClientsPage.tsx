import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@lib/supabase'; // Aligne le chemin selon tes besoins

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  id_number: string;
  created_at: string;
  client_type?: 'particulier' | 'entreprise';
  company_name?: string;
  niu?: string;
}

export default function ClientsPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les clients depuis Supabase au montage de la page
  useEffect(() => {
    async function fetchClients() {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setClients(data);
      } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Barre d'action supérieure */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Fichier Unique des Clients</h1>
          <p className="text-xs text-slate-500">Gérez les profils centralisés de vos assurés.</p>
        </div>
        <button
          onClick={() => navigate('/clients/new')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm transition"
        >
          + Nouveau Client
        </button>
      </div>

      {/* Affichage des données */}
      {loading ? (
        <div className="text-center py-10 text-sm text-slate-500">Chargement des dossiers clients...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 p-6">
          <p className="text-sm text-slate-500 font-medium">Aucun client enregistré pour le moment.</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Utilisez la saisie express par IA pour créer votre premier profil.</p>
          <button
            onClick={() => navigate('/clients/new')}
            className="text-emerald-600 hover:text-emerald-500 text-xs font-semibold underline"
          >
            Créer un client maintenant
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] tracking-wider font-semibold">
                <th className="p-3">Assuré</th>
                <th className="p-3">Téléphone</th>
                <th className="p-3">Email</th>
                <th className="p-3">N° CNI / Passeport</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-3 font-medium text-slate-900">
                    {client.client_type === 'entreprise' ? (
                      <span className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase">Pro</span>
                        {client.company_name}
                      </span>
                    ) : (
                      `${client.first_name || ''} ${client.last_name}`
                    )}
                  </td>
                  <td className="p-3 text-xs">{client.phone}</td>
                  <td className="p-3 text-xs text-slate-500">{client.email || '—'}</td>
                  <td className="p-3 text-xs font-mono">
                    {client.client_type === 'entreprise' ? client.niu || '—' : client.id_number || '—'}
                  </td>
                  
                  <td className="p-3 text-right">
                    <button
                      onClick={() => navigate(`/clients/${client.id}`)}
                      className="text-blue-600 hover:text-blue-500 text-xs font-medium"
                    >
                      Ouvrir le dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}