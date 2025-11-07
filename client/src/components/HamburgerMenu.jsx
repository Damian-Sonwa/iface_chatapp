import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  MessageCircle,
  Compass,
  Users,
  Star,
  Layers,
  GraduationCap,
  Megaphone,
  Settings,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  ChevronDown,
  Shield,
  Ban,
  BarChart2
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusSelector from './StatusSelector';
import api from '../utils/api';

const slugify = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const getLevelBadge = (skillLevel) => {
  if (!skillLevel) return { label: 'Member', color: 'bg-gray-500/20 text-gray-200 border-gray-400/40' };
  switch (skillLevel) {
    case 'Beginner':
      return { label: 'Beginner', color: 'bg-green-500/10 text-green-300 border-green-400/40' };
    case 'Intermediate':
      return { label: 'Intermediate', color: 'bg-amber-500/10 text-amber-300 border-amber-400/40' };
    case 'Professional':
      return { label: 'Professional', color: 'bg-purple-500/10 text-purple-300 border-purple-400/40' };
    default:
      return { label: skillLevel, color: 'bg-gray-500/20 text-gray-200 border-gray-400/40' };
  }
};

const HamburgerMenu = ({ darkMode, onToggleDarkMode, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTechExpanded, setIsTechExpanded] = useState(true);
  const [techSkills, setTechSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (event.target.closest('[data-hamburger-button]')) return;
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchTechSkills = async () => {
      try {
        setLoadingSkills(true);
        const response = await api.get('/tech-skills');
        setTechSkills(response.data.skills || []);
      } catch (err) {
        console.error('Tech skills menu load error:', err);
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchTechSkills();
  }, []);

  const closeAfterNavigation = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    closeAfterNavigation();
  };

  const profileBadge = getLevelBadge(user?.skillLevel);

  const mainNavigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, onClick: () => handleNavigate('/dashboard'), pathMatch: '/dashboard' },
    { id: 'messages', label: 'Messages / Chats', icon: MessageCircle, onClick: () => handleNavigate('/chat'), pathMatch: '/chat' },
    { id: 'explore', label: 'Explore Tech Skills', icon: Compass, onClick: () => handleNavigate('/tech-skills') },
    { id: 'my-groups', label: 'My Groups', icon: Users, onClick: () => handleNavigate('/friends?tab=groups'), pathMatch: '/friends' },
    { id: 'suggested', label: 'Suggested Groups', icon: Star, onClick: () => handleNavigate('/friends?tab=suggested'), pathMatch: '/friends' }
  ];

  const communityNavigation = [
    { id: 'classroom', label: 'Classroom', icon: GraduationCap, onClick: () => handleNavigate('/classroom'), pathMatch: '/classroom' },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, onClick: () => handleNavigate('/announcements'), pathMatch: '/announcements' },
    { id: 'settings', label: 'Settings', icon: Settings, onClick: () => handleNavigate('/settings'), pathMatch: '/settings' },
    { id: 'help', label: 'Help / Support', icon: HelpCircle, onClick: () => handleNavigate('/help'), pathMatch: '/help' }
  ];

  const adminNavigation = [
    { id: 'admin-dashboard', label: 'Admin Dashboard', icon: Shield, onClick: () => handleNavigate('/admin/dashboard'), pathMatch: '/admin/dashboard' },
    { id: 'violations', label: 'User Violations', icon: Ban, onClick: () => handleNavigate('/admin/violations'), pathMatch: '/admin/violations' },
    { id: 'analytics', label: 'Analytics / Logs', icon: BarChart2, onClick: () => handleNavigate('/admin/analytics'), pathMatch: '/admin/analytics' }
  ];

  return (
    <>
      <motion.button
        data-hamburger-button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-[10001] p-2 sm:p-3 rounded-lg bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/30 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/30 transition-all"
        aria-label="Menu"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10008]"
            />

            <motion.div
              ref={menuRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] z-[10009] bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900 backdrop-blur-xl border-l border-white/20 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Navigation</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold overflow-hidden">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user?.username?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{user?.username || 'User'}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    <span className={`inline-flex items-center mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border rounded-full ${profileBadge.color}`}>
                      {profileBadge.label}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <StatusSelector
                    currentStatus={user?.status || 'offline'}
                    onStatusChange={() => {}}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-6">
                <nav className="space-y-1">
                  <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Main Navigation</p>
                  {mainNavigation.map(item => {
                    const Icon = item.icon;
                    const isActive = item.pathMatch ? location.pathname.startsWith(item.pathMatch) : false;
                    return (
                      <button
                        key={item.id}
                        onClick={item.onClick}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                          isActive ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/40 text-white' : 'bg-white/5 hover:bg-white/10 border border-white/5 text-gray-200'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    );
                  })}
                </nav>

                <div>
                  <button
                    onClick={() => setIsTechExpanded(prev => !prev)}
                    className="w-full flex items-center justify-between px-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    <span>Tech Skills</span>
                    {isTechExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <AnimatePresence initial={false}>
                    {isTechExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-2 space-y-1"
                      >
                        {loadingSkills && (
                          <div className="px-4 py-2 text-xs text-gray-400">Loading...</div>
                        )}
                        {!loadingSkills && techSkills.length === 0 && (
                          <div className="px-4 py-2 text-xs text-gray-500">No skills available yet.</div>
                        )}
                        {!loadingSkills && techSkills.map(skill => {
                          const path = `/classroom/${slugify(skill.name)}`;
                          return (
                            <button
                              key={skill._id}
                              onClick={() => handleNavigate(path)}
                              className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition ${
                                location.pathname.startsWith(path)
                                  ? 'bg-indigo-500/20 text-white border border-indigo-400/40'
                                  : 'bg-white/5 hover:bg-white/10 text-gray-200 border border-white/5'
                              }`}
                            >
                              <Layers className="w-4 h-4" />
                              <span className="flex-1 text-left">{skill.name}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <nav className="space-y-1">
                  <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Community & Learning</p>
                  {communityNavigation.map(item => {
                    const Icon = item.icon;
                    const isActive = item.pathMatch ? location.pathname.startsWith(item.pathMatch) : false;
                    return (
                      <button
                        key={item.id}
                        onClick={item.onClick}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                          isActive ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/40 text-white' : 'bg-white/5 hover:bg-white/10 border border-white/5 text-gray-200'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    );
                  })}
                </nav>

                {isAdmin && (
                  <nav className="space-y-1">
                    <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Admin</p>
                    {adminNavigation.map(item => {
                      const Icon = item.icon;
                      const isActive = item.pathMatch ? location.pathname.startsWith(item.pathMatch) : false;
                      return (
                        <button
                          key={item.id}
                          onClick={item.onClick}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                            isActive ? 'bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/40 text-white' : 'bg-white/5 hover:bg-white/10 border border-white/5 text-gray-200'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      );
                    })}
                  </nav>
                )}
              </div>

              <div className="p-4 border-t border-white/20 space-y-2 bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onToggleDarkMode}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white"
                >
                  <div className="p-2 rounded-lg bg-white/10">
                    {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-300" />}
                  </div>
                  <span className="flex-1 text-left text-sm font-medium">
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    logout();
                    closeAfterNavigation();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300"
                >
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="flex-1 text-left text-sm font-semibold">Logout</span>
                </motion.button>

                <p className="text-[10px] text-center text-gray-500 mt-3">Chaturway · Learn. Build. Collaborate.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default HamburgerMenu;

