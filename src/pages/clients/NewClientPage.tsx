import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface ClientFormData {
  client_type: 'particulier' | 'entreprise';
  company_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  id_card_number: string;
  address: string;
  profession: string;
}

export default function NewClientPage() {
  const navigate = useNavigate();
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<ClientFormData>({
    client_type: 'particulier',
    company_name: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id_card_number: '',
    address: '',
    profession: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🧪 SIMULATION OCR - Analyse Intelligente Awa OCR
  const handleFileUploadSimulated = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsExtracting(true);

    setTimeout(() => {
      setFormData({
        client_type: 'particulier',
        company_name: '',
        first_name: 'Samuel-Roger',
        last_name: 'Mouangue',
        email: 'samuel.mouangue@gmail.com',
        phone: '+237699887766',
        id_card_number: 'CE123456789',
        address: 'Akwa, Rue Joffre, Douala',
        profession: 'Transporteur / Logistique',
      });
      setIsExtracting(false);
    }, 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      const clientToInsert = {
        client_type: formData.client_type,
        company_name: formData.client_type === 'entreprise' ? formData.company_name : null,
        first_name: formData.client_type === 'particulier' ? (formData.first_name || null) : null,
        last_name: formData.client_type === 'particulier' ? (formData.last_name || 'Inconnu') : formData.company_name, 
        phone: formData.phone,
        email: formData.email || null,
        address: formData.address || null,
        profession: formData.client_type === 'particulier' ? (formData.profession || null) : 'Entreprise / Flotte',
        id_type: formData.client_type === 'particulier' ? 'cni' : 'niu',
        id_number: formData.id_card_number || null,
        created_by: user?.id || null,
      };

      const { error } = await (supabase.from('clients') as any).insert([clientToInsert]).select();

      if (error) throw error;
      navigate('/clients');
    } catch (error: any) {
      console.error("Erreur d'insertion :", error);
      alert(`Erreur (${error.code || 'SQL'}): ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Nouveau Client</h1>
        <p className="text-sm text-slate-500">Créez des profils individuels ou des structures flottes pour vos tarifications.</p>
      </div>

      {/* Zone de Scan IA */}
      <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <h2 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-1">
          ✨ Saisie Express par IA (Awa OCR)
        </h2>
        <p className="text-xs text-emerald-700 mb-4">
          Déposez le scan de la CNI, du Registre du Commerce ou de la Carte Grise pour automatiser la saisie.
        </p>
        
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-emerald-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-emerald-50/50 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isExtracting ? (
                <div className="flex items-center space-x-2 text-emerald-600">
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium">Awa analyse le document...</span>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-500"><span className="font-semibold text-emerald-600">Cliquez pour uploader</span> ou glissez-déposez</p>
                  <p className="text-[10px] text-slate-400">PNG, JPG ou PDF (CNI / Contrat / Statuts)</p>
                </>
              )}
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*,application/pdf"
              onChange={handleFileUploadSimulated}
              disabled={isExtracting}
            />
          </label>
        </div>
      </div>

      {/* Formulaire Principal */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
        
        {/* Toggle Structure Juridique */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-600 uppercase mb-3">Structure de l'assuré *</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input 
                type="radio" 
                name="client_type" 
                value="particulier" 
                checked={formData.client_type === 'particulier'} 
                onChange={() => setFormData({ ...formData, client_type: 'particulier' })}
                className="text-emerald-600 focus:ring-emerald-500" 
              />
              👤 Personne Physique (Particulier)
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input 
                type="radio" 
                name="client_type" 
                value="entreprise" 
                checked={formData.client_type === 'entreprise'} 
                onChange={() => setFormData({ ...formData, client_type: 'entreprise' })}
                className="text-emerald-600 focus:ring-emerald-500" 
              />
              🏢 Personne Morale (Flotte / Entreprise)
            </label>
          </div>
        </div>

        {/* Bloc Nominatif Conditionnel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.client_type === 'entreprise' ? (
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Raison Sociale de l'Entreprise *</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                placeholder="Ex: Les Établissements Mouangue & Fils"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Prénom(s) *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nom *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Téléphone (+237...) *</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Ex: +237699887766"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {formData.client_type === 'particulier' ? "N° de CNI / Passeport" : "N° d'Identifiant Unique (NIU)"}
            </label>
            <input
              type="text"
              name="id_card_number"
              value={formData.id_card_number}
              onChange={handleChange}
              placeholder={formData.client_type === 'entreprise' ? "Ex: M012345678901X" : ""}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Profession / Secteur d'activité</label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Adresse Locale (Ville, Quartier, Rue)</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Ex: Akwa, Rue Joffre, Douala"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Actions boutons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSaving || isExtracting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 text-white rounded-lg text-xs font-semibold transition shadow-sm"
          >
            {isSaving ? 'Enregistrement...' : 'Créer la fiche client'}
          </button>
        </div>
      </form>
    </div>
  );
}