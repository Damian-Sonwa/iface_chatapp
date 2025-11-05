import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Loader2, Moon, Sun } from 'lucide-react';
import api from '../utils/api';
import FlippingAuthBackground from '../components/FlippingAuthBackground';
import AuthHeader from '../components/AuthHeader';
import { motion } from 'framer-motion';

const SignUp = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register', { username, email, password });
      // Show welcome message and navigate to login
      alert(response.data.message || 'Account created successfully!');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <FlippingAuthBackground />
      {/* Auth Header */}
      <AuthHeader />
      {/* Dark Mode Toggle */}
      <motion.button
        onClick={() => setDarkMode(!darkMode)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-8 right-8 z-30 p-3 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-2xl transition-all hover:bg-white/20 dark:hover:bg-black/30"
        title="Toggle theme"
      >
        {darkMode ? <Sun className="w-6 h-6 text-yellow-300" /> : <Moon className="w-6 h-6 text-white" />}
      </motion.button>
      {/* Developer Footer */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center">
        <p className="text-white/40 text-xs font-light tracking-wider italic" style={{ fontFamily: 'serif' }}>
          Developed by <span className="font-medium not-italic">damiancorecode</span>
        </p>
      </div>
      <div className="w-full max-w-md rounded-2xl p-6 bg-white/10 dark:bg-gray-900/20 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/20 ring-1 ring-white/10">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Create account</h1>
        {error && (
          <div className="mb-3 text-red-200 bg-red-900/40 border border-red-800 rounded px-3 py-2 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Username</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={username} onChange={(e)=>setUsername(e.target.value)} className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/80 dark:bg-gray-700/70 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400" placeholder="Your name" />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/80 dark:bg-gray-700/70 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/80 dark:bg-gray-700/70 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Sign Up'}
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          Already have an account? <Link to="/login" className="text-purple-500 hover:text-purple-600">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;


