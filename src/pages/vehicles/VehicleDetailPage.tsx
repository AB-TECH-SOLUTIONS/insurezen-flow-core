// src/pages/vehicles/VehicleDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Car, User, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';

interface Vehicle {
  id: string;
  client_id: string;
  plate_number: string;
  brand: string;
  model?: string;
  fuel_type: string;
  fiscal_power: number;
  category_code: string;
  clients: {
    first_name?: string;
    last_name: string;
    client_type: string;
    company_name?: string;
  };
}

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicleData() {
      if (!id) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('vehicles')
          .select('*, clients(first_name, last_name, client_type, company_name)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setVehicle(data as any);
      } catch (error) {
        console.error("Erreur chargement véhicule :", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicleData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-20 bg-white border rounded-2xl">
        <ShieldAlert className="text-red-500 mx-auto mb-2" size={40} />
        <p className="text-sm text-gray-500">Véhicule introuvable.</p>
      </div>
    );
  }

  const ownerName = vehicle.clients.client_type === 'entreprise' 
    ? vehicle.clients.company_name 
    : `${vehicle.clients.first_name || ''} ${vehicle.clients.last_name}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
        <ArrowLeft size={16} /> Retour
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-900 text-white rounded-xl"><Car size={24} /></div>
          <div>
            <span className="font-mono text-xs font-bold bg-gray-900 text-white px-2 py-0.5 rounded tracking-wide shadow-sm">
              {vehicle.plate_number}
            </span>
            <h1 className="text-lg font-bold text-gray-800 mt-1">{vehicle.brand} {vehicle.model || ''}</h1>
          </div>
        </div>

        <Link to={`/clients/${vehicle.client_id}`} className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 p-3 rounded-xl border border-gray-100 transition-all">
          <User size={16} className="text-gray-400" />
          <div className="text-left">
            <span className="block text-[9px] font-bold text-gray-400 uppercase">Propriétaire</span>
            <span className="text-xs font-bold text-indigo-600">{ownerName}</span>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 shadow-sm">
        <h3 className="text-xs font-bold uppercase text-gray-400">Spécifications Techniques</h3>
        <p className="text-sm text-gray-700"><strong>Catégorie CIMA :</strong> {vehicle.category_code}</p>
        <p className="text-sm text-gray-700"><strong>Énergie :</strong> <span className="uppercase">{vehicle.fuel_type}</span></p>
        <p className="text-sm text-gray-700"><strong>Puissance Fiscale :</strong> {vehicle.fiscal_power} CV</p>
      </div>
    </div>
  );
}