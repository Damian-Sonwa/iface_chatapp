import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import HamburgerMenu from './HamburgerMenu';

const Navigation = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const navLinks = useMemo(() => ([
    { to: '/dashboard', label: 'Dashboard', tour: 'dashboard-link' },
    { to: '/chat', label: 'Messages', tour: 'messages-link' },
    { to: '/friends', label: 'Groups', tour: 'groups-link' },
    { to: '/settings', label: 'Profile', tour: 'profile-link' }
  ]), []);

  if (!user) return null;

  return (
    <nav className="bg-black/20 backdrop-blur-xl border-b border-white/10 px-4 py-3 relative z-[100] fixed top-0 left-0 right-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Logo/Brand */}
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link to="/dashboard" className="flex items-center gap-2" data-tour="brand">
            <motion.div 
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg shadow-purple-500/30 relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
              <MessageCircle className="w-6 h-6 text-white relative z-10" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">Chaturway</span>
          </Link>
        </motion.div>

        {/* Primary Navigation Links */}
        <div className="hidden md:flex items-center gap-4" data-tour="nav-links">
          {navLinks.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                data-tour={link.tour}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white border border-white/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Hamburger Menu */}
        <HamburgerMenu 
          darkMode={darkMode} 
          onToggleDarkMode={toggleDarkMode}
          user={user}
        />
      </div>
    </nav>
  );
};

export default Navigation;

