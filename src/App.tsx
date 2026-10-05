import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import MainLayout from './components/layout/MainLayout'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import AdminSettings from '@/pages/admin/Settings/AdminSettings'
// Context et Composants IA (Awa)
import { AwaProvider } from './context/AwaContext';
import { AwaChat } from './components/AwaChat';

// Pages Auth
import LoginPage from '@/pages/auth/LoginPage'

// Pages principales
import DashboardPage      from '@/pages/DashboardPage'
import ClientsPage        from '@/pages/clients/ClientsPage'
import ClientDetailPage   from './pages/clients/ClientDetailPage';
import VehicleDetailPage  from './pages/vehicles/VehicleDetailPage';
import NewClientPage      from '@/pages/clients/NewClientPage'
import VehiclesPage       from '@/pages/vehicles/VehiclesPage'
import QuotesPage         from '@/pages/quotes/QuotesPage'
import NewQuotePage       from '@/pages/quotes/NewQuotePage'
import QuoteDetailPage    from '@/pages/quotes/QuoteDetailPage'
import ContractsPage      from '@/pages/contracts/ContractsPage'
import ContractDetailPage from '@/pages/contracts/ContractDetailPage'
import PaymentsPage       from '@/pages/caisse/PaymentsPage'
import NewPaymentPage     from '@/pages/caisse/NewPaymentPage'
import ReversementsPage   from '@/pages/caisse/ReversementsPage'
import ClaimsPage         from '@/pages/claims/ClaimsPage'
import NewClaimPage       from '@/pages/claims/NewClaimPage'
import ClaimDetailPage    from '@/pages/claims/ClaimDetailPage'
import TasksPage          from '@/pages/tasks/TasksPage'
import MessagesPage       from '@/pages/messages/MessagesPage'
import StockPage          from '@/pages/stock/StockPage'

// Pages Admin
import AdminDashboard     from '@/pages/admin/AdminDashboard'
import AdminTariffs       from '@/pages/admin/AdminTariffs'
import AdminCommissions   from '@/pages/admin/AdminCommissions'
import AdminFiscal        from '@/pages/admin/AdminFiscal'
import AdminCompanies     from '@/pages/admin/AdminCompanies'
import AdminUsers         from '@/pages/admin/AdminUsers'

// Page 404
import NotFoundPage from '@/pages/NotFoundPage'

/* ── Guard authentification ─────────────────────────────── */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

/* ── Guard admin ────────────────────────────────────────── */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()

  if (loading) return null
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AwaProvider>
        <div className="min-h-screen bg-slate-50">
          <Routes>
            {/* ── Public ────────────────────────────── */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/update-password" element={<ResetPasswordPage />} />
            
            {/* ── App principale ────────────────────── */}
            <Route path="/" element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }>
              <Route index element={<DashboardPage />} />

              {/* Clients */}
              <Route path="clients" element={<ClientsPage />} />
              <Route path="clients/new" element={<NewClientPage />} />
              <Route path="clients/:id" element={<ClientDetailPage />} />

              {/* Véhicules - FIX: Correction du chemin relatif sans slash initial */}
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="vehicles/:id" element={<VehicleDetailPage />} />

              {/* Cotations */}
              <Route path="quotes" element={<QuotesPage />} />
              <Route path="quotes/new" element={<NewQuotePage />} />
              <Route path="quotes/:id" element={<QuoteDetailPage />} />

              {/* Contrats */}
              <Route path="contracts" element={<ContractsPage />} />
              <Route path="contracts/:id" element={<ContractDetailPage />} />

              {/* Caisse */}
              <Route path="caisse" element={<PaymentsPage />} />
              <Route path="caisse/new" element={<NewPaymentPage />} />
              <Route path="caisse/reversements" element={<ReversementsPage />} />

              {/* Sinistres */}
              <Route path="claims" element={<ClaimsPage />} />
              <Route path="claims/new" element={<NewClaimPage />} />
              <Route path="claims/:id" element={<ClaimDetailPage />} />

              {/* Tâches & Messages */}
              <Route path="tasks" element={<TasksPage />} />
              <Route path="messages" element={<MessagesPage />} />

              {/* Stock attestations */}
              <Route path="stock" element={<StockPage />} />

              {/* Administration */}
              <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
              <Route path="admin/tariffs" element={<AdminRoute><AdminTariffs /></AdminRoute>} />
              <Route path="admin/commissions" element={<AdminRoute><AdminCommissions /></AdminRoute>} />
              <Route path="admin/fiscal" element={<AdminRoute><AdminFiscal /></AdminRoute>} />
              <Route path="admin/companies" element={<AdminRoute><AdminCompanies /></AdminRoute>} />
              <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>

          {/* Interface d'Awa disponible partout au-dessus des pages */}
          <AwaChat />
        </div>
      </AwaProvider>
    </BrowserRouter>
  )
}