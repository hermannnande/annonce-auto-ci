import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileNav } from './components/MobileNav';
import { HomePage } from './pages/HomePage';
import { ListingsPage } from './pages/ListingsPage';
import { VehicleDetailPage } from './pages/VehicleDetailPage';
import { PublishPage } from './pages/PublishPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AuthCallback } from './pages/AuthCallback';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { CGUPage } from './pages/CGUPage';
import { ConfidentialitePage } from './pages/ConfidentialitePage';
import { AProposPage } from './pages/AProposPage';
import { DashboardSelector } from './pages/DashboardSelector';
import { DashboardRedirect } from './pages/DashboardRedirect';
import ThankYouPage from './pages/ThankYouPage';
import { PayfonteCallback } from './pages/PayfonteCallback';
// Dashboard Vendor
import { VendorDashboard } from './pages/dashboard/VendorDashboard';
import { VendorListings } from './pages/dashboard/VendorListings';
import { VendorRecharge } from './pages/dashboard/VendorRechargePayfonte';
import { VendorBooster } from './pages/dashboard/VendorBooster';
import { VendorStats } from './pages/dashboard/VendorStats';
import { VendorSettings } from './pages/dashboard/VendorSettings';
import { VendorPublish } from './pages/dashboard/VendorPublish';
import { VendorEditListing } from './pages/dashboard/VendorEditListing';
import { VendorMessages } from './pages/dashboard/VendorMessages';
import { VendorFavorites } from './pages/dashboard/VendorFavorites';
import { NotificationsPage } from './pages/dashboard/NotificationsPage';
import { ListingStatsPage } from './pages/dashboard/ListingStatsPage';
// Dashboard Admin
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { AdminModeration } from './pages/dashboard/AdminModeration';
import { AdminUsers } from './pages/dashboard/AdminUsers';
import { AdminCredits } from './pages/dashboard/AdminCredits';
import { AdminPayments } from './pages/dashboard/AdminPayments';
import { AdminAnalytics } from './pages/dashboard/AdminAnalytics';
import { AdminMessages } from './pages/dashboard/AdminMessages';
import { AdminSettings } from './pages/dashboard/AdminSettings';
// 🆕 Context et Hooks
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useBoostChecker } from './hooks/useBoostChecker';
// import { useAnalytics } from './hooks/useAnalytics'; // DÉSACTIVÉ TEMPORAIREMENT
// 🆕 Toast notifications
import { Toaster } from 'sonner';

function AppContent() {
  // 🆕 Vérifier et désactiver les boosts expirés au démarrage
  useBoostChecker();
  
  // 🆕 Initialiser le tracking analytics (DÉSACTIVÉ TEMPORAIREMENT - cause useLocation error)
  // useAnalytics();

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public routes with Header/Footer */}
        <Route path="/" element={
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <HomePage />
            </main>
            <Footer />
            <MobileNav />
          </div>
        } />
        <Route path="/annonces" element={
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <ListingsPage />
            </main>
            <Footer />
            <MobileNav />
          </div>
        } />
        <Route path="/annonces/:id" element={
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <VehicleDetailPage />
            </main>
            <Footer />
            <MobileNav />
          </div>
        } />
        <Route path="/publier" element={
          <ProtectedRoute>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <PublishPage />
              </main>
              <Footer />
              <MobileNav />
            </div>
          </ProtectedRoute>
        } />
        
        {/* Legal pages (with header/footer) */}
        <Route path="/cgu" element={
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <CGUPage />
            </main>
            <Footer />
            <MobileNav />
          </div>
        } />
        <Route path="/confidentialite" element={
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <ConfidentialitePage />
            </main>
            <Footer />
            <MobileNav />
          </div>
        } />
        <Route path="/a-propos" element={
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <AProposPage />
            </main>
            <Footer />
            <MobileNav />
          </div>
        } />
        
        {/* Auth routes (no header/footer) */}
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/inscription" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
        
        {/* Dashboard Selector route (no header/footer) - Redirects based on user type */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        } />
        
        {/* Vendor Dashboard routes (no header/footer, DashboardLayout handles nav) */}
        <Route path="/dashboard/vendeur" element={
          <ProtectedRoute requiredUserType="vendor">
            <VendorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vendeur/annonces" element={
          <ProtectedRoute requiredUserType="vendor">
            <VendorListings />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vendeur/annonces/nouvelle" element={
          <ProtectedRoute requiredUserType="vendor">
            <VendorPublish />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vendeur/annonces/modifier/:id" element={
          <ProtectedRoute requiredUserType="vendor">
            <VendorEditListing />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vendeur/annonces/:listingId/stats" element={
          <ProtectedRoute requiredUserType="vendor">
            <ListingStatsPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vendeur/recharge" element={
          <ProtectedRoute requiredUserType="vendor">
            <VendorRecharge />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vendeur/booster" element={
          <ProtectedRoute requiredUserType="vendor">
            <VendorBooster />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vendeur/stats" element={
          <ProtectedRoute requiredUserType="vendor">
            <VendorStats />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vendeur/settings" element={
          <ProtectedRoute requiredUserType="vendor">
            <VendorSettings />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vendeur/publier" element={
          <ProtectedRoute requiredUserType="vendor">
            <VendorPublish />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vendeur/messages" element={
          <ProtectedRoute requiredUserType="vendor">
            <VendorMessages />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vendeur/favoris" element={
          <ProtectedRoute requiredUserType="vendor">
            <VendorFavorites />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vendeur/notifications" element={
          <ProtectedRoute requiredUserType="vendor">
            <NotificationsPage />
          </ProtectedRoute>
        } />
        
        {/* Admin Dashboard routes (no header/footer, DashboardLayout handles nav) */}
        <Route path="/dashboard/admin" element={
          <ProtectedRoute requiredUserType="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/moderation" element={
          <ProtectedRoute requiredUserType="admin">
            <AdminModeration />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/users" element={
          <ProtectedRoute requiredUserType="admin">
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/utilisateurs" element={
          <ProtectedRoute requiredUserType="admin">
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/credits" element={
          <ProtectedRoute requiredUserType="admin">
            <AdminCredits />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/payments" element={
          <ProtectedRoute requiredUserType="admin">
            <AdminPayments />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/paiements" element={
          <ProtectedRoute requiredUserType="admin">
            <AdminPayments />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/analytics" element={
          <ProtectedRoute requiredUserType="admin">
            <AdminAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/messages" element={
          <ProtectedRoute requiredUserType="admin">
            <AdminMessages />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/settings" element={
          <ProtectedRoute requiredUserType="admin">
            <AdminSettings />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/notifications" element={
          <ProtectedRoute requiredUserType="admin">
            <NotificationsPage />
          </ProtectedRoute>
        } />
        
        {/* Shared notifications route */}
        <Route path="/dashboard/notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } />
        
        {/* Thank You Page route (no header/footer) */}
        <Route path="/merci" element={<ThankYouPage />} />
        
        {/* Payfonte Callback route (no header/footer) */}
        <Route path="/payfonte/callback" element={<PayfonteCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}