import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getInitials } from '@/lib/utils'
import {
  LayoutDashboard, Users, Car, FileText, ScrollText,
  Wallet, AlertTriangle, CheckSquare, MessageSquare,
  Archive, Settings, LogOut, ChevronDown,
  Building2, Shield, Menu, X, Bell,
} from 'lucide-react'

const NAV = [
  {
    section: 'Principal',
    items: [
      { to: '/',          icon: LayoutDashboard, label: 'Tableau de bord',  exact: true },
      { to: '/clients',   icon: Users,           label: 'Clients'                       },
      { to: '/vehicles',  icon: Car,             label: 'Véhicules'                     },
    ],
  },
  {
    section: 'Production',
    items: [
      { to: '/quotes',    icon: FileText,        label: 'Cotations'         },
      { to: '/contracts', icon: ScrollText,      label: 'Contrats / Polices'},
      { to: '/stock',     icon: Archive,         label: 'Stock attestations'},
    ],
  },
  {
    section: 'Caisse',
    items: [
      { to: '/caisse',              icon: Wallet,        label: 'Encaissements'    },
      { to: '/caisse/reversements', icon: Building2,     label: 'Reversements'     },
    ],
  },
  {
    section: 'Sinistres',
    items: [
      { to: '/claims', icon: AlertTriangle, label: 'Sinistres' },
    ],
  },
  {
    section: 'Équipe',
    items: [
      { to: '/tasks',    icon: CheckSquare,  label: 'Tâches'   },
      { to: '/messages', icon: MessageSquare,label: 'Messages' },
    ],
  },
]

export default function MainLayout() {
  const { profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="iz-layout">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className={`iz-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm leading-tight">InsureZenFlow</div>
              <div className="text-white/50 text-xs">
                {((import.meta as any)?.env?.VITE_AGENCY_NAME) || 'Plateforme de gestion'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white/50 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav 
          className="flex-1 overflow-y-auto py-2"
          style={{ maxHeight: 'calc(100vh - 140px)', scrollbarWidth: 'thin' }}
        >
          {NAV.map((group) => (
            <div key={group.section}>
              <div className="iz-nav-section">{group.section}</div>
              {group.items.map(({ to, icon: Icon, label, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  className={({ isActive }) =>
                    `iz-nav-item ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}

          {/* Admin */}
          {isAdmin() && (
            <div>
              <div className="iz-nav-section">Administration</div>
              <NavLink
                to="/admin/settings"
                end
                className={({ isActive }) => `iz-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Settings size={15} />
                <span>Configuration Globale</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Profil utilisateur */}
        <div className="border-t border-white/10 p-3">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-white/08 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {profile ? getInitials(profile.full_name) : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate">
                {profile?.full_name ?? 'Chargement...'}
              </div>
              <div className="text-white/40 text-[10px] truncate">
                {profile?.role ?? ''}
              </div>
            </div>
            <ChevronDown size={12} className="text-white/40 flex-shrink-0" />
          </button>

          {userMenuOpen && (
            <div className="mt-1 bg-brand-800 rounded-md overflow-hidden border border-white/10">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/08 text-xs transition-colors"
              >
                <LogOut size={13} />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Contenu principal ─────────────────────────────── */}
      <div className="iz-main">
        {/* Header */}
        <header className="iz-header gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-500 hover:text-gray-700 mr-1"
          >
            <Menu size={18} />
          </button>

          {/* Breadcrumb / titre dynamique via Outlet context si besoin */}
          <div className="flex-1" />

          {/* Actions header */}
          <button className="relative p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <Bell size={16} />
            {/* Badge non lus */}
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="w-px h-5 bg-gray-200" />

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-semibold">
              {profile ? getInitials(profile.full_name) : '?'}
            </div>
            <span className="text-sm text-gray-700 hidden sm:block">
              {profile?.full_name ?? ''}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="iz-content iz-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}