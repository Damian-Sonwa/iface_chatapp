import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import HamburgerMenu from './HamburgerMenu';

const Navigation = () => {
  const { user } = useAuth();
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

  if (!user) return null;

  return (
    <nav className="bg-black/20 backdrop-blur-xl border-b border-white/10 px-4 py-3 relative z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo/Brand */}
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link to="/chat" className="flex items-center gap-2">
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

