import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Shield, Eye, EyeOff } from 'lucide-react'



export default function LoginPage() {
  const { signIn, user } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Déjà connecté
  if (user) {
    navigate('/', { replace: true })
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(email.trim(), password)
    setLoading(false)

    if (error) {
      setError('Email ou mot de passe incorrect.')
    } else {
      navigate('/', { replace: true })
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Veuillez saisir votre adresse email d'abord.");
      return;
    }
  
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) throw error;

      alert("Un lien de réinitialisation a été envoyé sur votre adresse email !");
    } catch (error: any) {
      alert("Erreur : " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0B1F3A 0%, #1A3A6E 100%)' }}>
      {/* Panneau gauche — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div>
            <div className="font-semibold text-lg">InsureZenFlow</div>
              <div className="text-white/50 text-xs">
                {((import.meta as any)?.env?.VITE_AGENCY_NAME) || 'Plateforme de gestion'}
              </div>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Gérez vos polices,<br />
            vos clients et vos<br />
            encaissements.
          </h1>
          <p className="text-white/60 text-base max-w-sm">
            Plateforme digitale de gestion d'assurance, conforme au Code CIMA,
            conçue pour les agents et courtiers camerounais.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { value: '4',     label: 'Compagnies partenaires' },
            { value: 'CIMA',  label: 'Conforme réglementation' },
            { value: '100%',  label: 'Traçabilité garantie' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white/08 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-300 mb-1">{value}</div>
              <div className="text-white/50 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white lg:rounded-l-3xl">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-semibold text-gray-900">InsureZenFlow</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Connexion</h2>
          <p className="text-gray-500 text-sm mb-6">
            Entrez vos identifiants pour accéder à votre espace.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="iz-alert-danger text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="iz-label iz-label-required">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="agent@lescoralis.cm"
                required
                autoComplete="email"
                className="iz-input"
              />
            </div>

            <div>
              <label className="iz-label iz-label-required">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="iz-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="iz-btn iz-btn-primary w-full iz-btn-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connexion...
                </span>
              ) : 'Se connecter'}
            </button>
            <div className="flex justify-end my-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-emerald-600 hover:text-emerald-500 hover:underline bg-transparent border-none cursor-pointer"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            Problème de connexion ? Contactez votre administrateur.
          </p>
        </div>
      </div>
    </div>
  )
}