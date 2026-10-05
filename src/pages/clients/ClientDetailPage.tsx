// src/pages/clients/ClientDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { User, Building2, Phone, Mail, MapPin, ShieldAlert, Car, ArrowLeft, Loader2, Edit3 } from 'lucide-react';

interface Client {
  id: string;
  client_type: 'particulier' | 'entreprise';
  title?: string;
  first_name?: string;
  last_name: string;
  company_name?: string;
  phone: string;
  phone2?: string;
  email?: string;
  address?: string;
  city?: string;
  zone_code?: string;
  id_type?: string;
  id_number?: string;
  id_expiry?: string;
  niu?: string;
  profession?: string;
  notes?: string;
  created_at: string;
}

interface Vehicle {
  id: string;
  plate_number: string;
  brand: string;
  model?: string;
  fiscal_power: number;
  category_code: string;
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClientData() {
      if (!id) return;
      try {
        setLoading(true);
        
        // 1. Récupérer le client
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .single();

        if (clientError) throw clientError;
        setClient(clientData);

        // 2. Récupérer ses véhicules rattachés
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('id, plate_number, brand, model, fiscal_power, category_code')
          .eq('client_id', id);

        if (vehicleError) throw vehicleError;
        setVehicles(vehicleData || []);

      } catch (error) {
        console.error("Erreur dossier client :", error);
      } finally {
        setLoading(false);
      }
    }

    fetchClientData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <Loader2 className="animate-spin text-indigo-600 mx-auto" size={32} />
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <ShieldAlert className="text-red-500 mx-auto mb-2" size={40} />
        <h2 className="text-md font-bold text-gray-900">Client introuvable</h2>
        <button onClick={() => navigate('/clients')} className="mt-4 bg-gray-900 text-white text-xs px-4 py-2 rounded-lg">
          Retour
        </button>
      </div>
    );
  }

  const isEntreprise = client.client_type === 'entreprise';

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/clients')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
          <ArrowLeft size={16} /> Liste des clients
        </button>
        
        {/* FIX : Le bouton redirige maintenant vers la vraie page d'édition de ton projet */}
        <button 
          onClick={() => navigate(`/clients/${client.id}/edit`)} 
          className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
        >
          <Edit3 size={14} /> Modifier la fiche client
        </button>
      </div>

      {/* Carte d'identité du client */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-xl ${isEntreprise ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
            {isEntreprise ? <Building2 size={28} /> : <User size={28} />}
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isEntreprise ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'}`}>
              {client.client_type}
            </span>
            <h1 className="text-xl font-bold text-gray-900 mt-1">
              {isEntreprise ? client.company_name : `${client.title || ''} ${client.first_name || ''} ${client.last_name}`}
            </h1>
            <p className="text-xs text-gray-400">Zone Tarifaire : {client.zone_code || 'Non spécifiée'}</p>
          </div>
        </div>
      </div>

      {/* Grille Infos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase text-gray-400">Contacts</h3>
          <p className="text-sm text-gray-700"><strong>Téléphone :</strong> {client.phone} {client.phone2 && `/ ${client.phone2}`}</p>
          <p className="text-sm text-gray-700"><strong>Email :</strong> {client.email || 'Non renseigné'}</p>
          <p className="text-sm text-gray-700"><strong>Ville :</strong> {client.city || 'Non renseignée'}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase text-gray-400">Administratif</h3>
          {isEntreprise ? (
            <p className="text-sm text-gray-700"><strong>NIU :</strong> <span className="font-mono bg-gray-50 px-2 py-0.5 border rounded">{client.niu || 'En attente'}</span></p>
          ) : (
            <>
              <p className="text-sm text-gray-700"><strong>{client.id_type?.toUpperCase() || 'CNI'} :</strong> {client.id_number || 'Non renseigné'}</p>
              <p className="text-sm text-gray-700"><strong>Profession :</strong> {client.profession || 'Non renseignée'}</p>
            </>
          )}
        </div>
      </div>

      {/* Liste des Véhicules rattachés */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
            <Car size={16} className="text-indigo-600" /> Véhicules enregistrés ({vehicles.length})
          </h2>
          {/* FIX : Ce bouton envoie vers la page de création de véhicule en lui passant l'ID du client en paramètre URL */}
          <Link 
            to={`/vehicles/new?client_id=${client.id}`} 
            className="bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
          >
            + Associer un véhicule
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            Aucun véhicule pour ce client. Cliquez sur le bouton pour en ajouter un.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {vehicles.map((v) => (
              <div key={v.id} className="p-4 flex justify-between items-center hover:bg-gray-50/50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-gray-900 text-white px-2 py-0.5 rounded">
                      {v.plate_number}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {v.brand} {v.model || ''}
                    </span>
                  </div>
                </div>
                {/* FIX : Ce bouton envoie maintenant vers la page de détails du véhicule */}
                <Link to={`/vehicles/${v.id}`} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold uppercase">
                  Ouvrir le dossier →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}