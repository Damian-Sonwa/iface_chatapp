import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import SideShell from './components/SideShell';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Chat = lazy(() => import('./pages/Chat'));
const Admin = lazy(() => import('./pages/Admin'));
const Friends = lazy(() => import('./pages/Friends'));
const Settings = lazy(() => import('./pages/Settings'));
const TechSkills = lazy(() => import('./pages/TechSkills'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ClassroomHome = lazy(() => import('./pages/ClassroomHome'));
const ClassroomSkill = lazy(() => import('./pages/ClassroomSkill'));
const ClassroomSession = lazy(() => import('./pages/ClassroomSession'));
const Onboarding = lazy(() => import('./pages/Onboarding'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
  </div>
);

const PrivateRoute = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (!user.hasOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (user.hasOnboarded && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  if (adminOnly && !user.isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  return !user ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <>
      {user?.hasOnboarded && <Navigation />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          } />
          <Route path="/onboarding" element={
            <PrivateRoute>
              <Onboarding />
            </PrivateRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/chat" element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          } />
          <Route path="/friends" element={
            <PrivateRoute>
              <SideShell>
                <Friends />
              </SideShell>
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute>
              <SideShell>
                <Settings />
              </SideShell>
            </PrivateRoute>
          } />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={
            <PrivateRoute adminOnly>
              <SideShell>
                <Admin defaultTab="dashboard" />
              </SideShell>
            </PrivateRoute>
          } />
          <Route path="/admin/violations" element={
            <PrivateRoute adminOnly>
              <SideShell>
                <Admin defaultTab="violations" />
              </SideShell>
            </PrivateRoute>
          } />
          <Route path="/admin/analytics" element={
            <PrivateRoute adminOnly>
              <SideShell>
                <Admin defaultTab="analytics" />
              </SideShell>
            </PrivateRoute>
          } />
          <Route path="/tech-skills" element={
            <PrivateRoute>
              <SideShell>
                <TechSkills />
              </SideShell>
            </PrivateRoute>
          } />
          <Route path="/classroom" element={
            <PrivateRoute onboardingRequired={true}>
              <SideShell>
                <ClassroomHome />
              </SideShell>
            </PrivateRoute>
          } />
          <Route path="/classroom/:skill" element={
            <PrivateRoute onboardingRequired={true}>
              <SideShell>
                <ClassroomSkill />
              </SideShell>
            </PrivateRoute>
          } />
          <Route path="/classroom/:skill/:classId" element={
            <PrivateRoute onboardingRequired={true}>
              <SideShell>
                <ClassroomSession />
              </SideShell>
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

