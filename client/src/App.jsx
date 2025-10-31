import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Chat from './pages/Chat';
import Admin from './pages/Admin';
import Friends from './pages/Friends';
import Settings from './pages/Settings';
import Navigation from './components/Navigation';
import SideShell from './components/SideShell';

const PrivateRoute = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/chat" />;
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
  return !user ? children : <Navigate to="/chat" />;
};

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <>
      {user && <Navigation />}
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
        <Route path="/admin" element={
          <PrivateRoute adminOnly>
            <SideShell>
              <Admin />
            </SideShell>
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
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

