import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Settings, User, LogOut, Home, Users, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const Navigation = () => {
  const { user, logout } = useAuth();
  
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

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

        {/* Navigation Links */}
        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/chat"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm border transition ${
                isActive('/chat')
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400/50 shadow-lg shadow-purple-500/30'
                  : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">Chat</span>
            </Link>
          </motion.div>

          {/* Friends link removed from header; available in sidebar Community section */}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/settings"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm border transition ${
                isActive('/settings')
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400/50 shadow-lg shadow-purple-500/30'
                  : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Settings</span>
            </Link>
          </motion.div>

          {user.isAdmin && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm border transition ${
                  isActive('/admin')
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400/50 shadow-lg shadow-purple-500/30'
                    : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            </motion.div>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div 
              className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-sm border border-purple-400/50 flex items-center justify-center text-purple-200 font-semibold text-sm relative overflow-hidden shadow-lg shadow-purple-500/20"
              whileHover={{ scale: 1.1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 animate-pulse" />
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover relative z-10" />
              ) : (
                <span className="relative z-10">{user.username?.charAt(0).toUpperCase() || 'U'}</span>
              )}
            </motion.div>
            <span className="hidden md:inline text-sm font-medium text-gray-200">
              {user.username}
            </span>
          </motion.div>
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition text-gray-300 hover:text-white shadow-lg"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

