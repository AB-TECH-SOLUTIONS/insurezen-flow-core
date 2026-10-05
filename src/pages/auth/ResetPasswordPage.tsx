import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@lib/supabase'; // Vérifie le chemin relatif selon ton arborescence

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Supabase récupère automatiquement le token de session depuis l'URL de redirection
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Votre mot de passe a été mis à jour avec succès ! Redirection...' });
      
      // Redirection vers le login après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Une erreur est survenue.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">Nouveau mot de passe</h2>
          <p className="text-xs text-slate-500 mt-1">Saisissez votre nouveau mot de passe pour sécuriser votre accès.</p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-xs font-medium ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nouveau mot de passe *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Confirmer le mot de passe *</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 text-white font-medium py-2 rounded-lg text-sm transition"
          >
            {loading ? 'Mise à jour...' : 'Enregistrer le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}