import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/components/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';

// Pages
import Index from '@/pages/Index';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import HealthDashboard from '@/pages/HealthDashboard';
import VitalsPage from '@/pages/VitalsPage';
import MedicationsPage from '@/pages/MedicationsPage';
import MedicationRequestPage from '@/pages/MedicationRequestPage';
import AppointmentsPage from '@/pages/AppointmentsPage';
import CarePlansPage from '@/pages/CarePlansPage';
import CaregiversPage from '@/pages/CaregiversPage';
import DevicesPage from '@/pages/DevicesPage';
import EducationPage from '@/pages/EducationPage';
import GamificationPage from '@/pages/GamificationPage';
import ProfilePage from '@/pages/ProfilePage';
import ProfileOnboarding from '@/pages/ProfileOnboarding';
import SettingsPage from '@/pages/SettingsPage';
import TelehealthPage from '@/pages/TelehealthPage';
import UpgradePage from '@/pages/UpgradePage';
import NotFound from '@/pages/NotFound';

// Subscription pages
import SuccessPage from '@/pages/subscription/success';
import CancelPage from '@/pages/subscription/cancel';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/health-dashboard" element={<HealthDashboard />} />
            <Route path="/vitals" element={<VitalsPage />} />
            <Route path="/medications" element={<MedicationsPage />} />
            <Route path="/medication-requests" element={<MedicationRequestPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/care-plans" element={<CarePlansPage />} />
            <Route path="/caregivers" element={<CaregiversPage />} />
            <Route path="/devices" element={<DevicesPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/gamification" element={<GamificationPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/onboarding" element={<ProfileOnboarding />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/telehealth" element={<TelehealthPage />} />
            <Route path="/upgrade" element={<UpgradePage />} />
            <Route path="/subscription/success" element={<SuccessPage />} />
            <Route path="/subscription/cancel" element={<CancelPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

