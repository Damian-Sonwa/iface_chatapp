import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  MessageCircle,
  Users,
  UserPlus,
  Settings,
  LogOut,
  Moon,
  Sun,
  Bell,
  Archive,
  Ban,
  Shield,
  Sparkles,
  FileText,
  Heart,
  Camera,
  Search,
  Plus,
  ChevronRight,
  Languages,
  Bot,
  BarChart2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusSelector from './StatusSelector';
import UserSearchDropdown from './UserSearchDropdown';
import TechSkillsMenu from './TechSkillsMenu';
import api from '../utils/api';

/**
 * HamburgerMenu Component
 * Organized menu for all app features with glassmorphism design
 */
const HamburgerMenu = ({ darkMode, onToggleDarkMode, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showTechSkills, setShowTechSkills] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuSections = [
    {
      id: 'chat',
      title: 'Chat',
      icon: MessageCircle,
      items: [
        { id: 'new-dm', label: 'New Direct Message', icon: UserPlus, action: () => setShowUserSearch(true) },
        { id: 'archived', label: 'Archived Chats', icon: Archive, action: () => navigate('/chat?filter=archived') },
        { id: 'search', label: 'Search Messages', icon: Search, action: () => navigate('/chat?action=search') },
      ]
    },
    {
      id: 'community',
      title: 'Community',
      icon: Users,
      items: [
        { id: 'new-group', label: 'New Group', icon: Plus, action: null },
        { id: 'invite-user', label: 'Invite User', icon: UserPlus, action: () => navigate('/invites') },
      ]
    },
    {
      id: 'groups',
      title: 'Tech Groups',
      icon: Users,
      items: [
        { id: 'tech-skills', label: 'Join Tech Groups', icon: Sparkles, action: () => setShowTechSkills(true) },
      ]
    },
    {
      id: 'social',
      title: 'Social',
      icon: Heart,
      items: [
        { id: 'moments', label: 'Moments', icon: Camera, action: () => navigate('/moments') },
        { id: 'blocked', label: 'Blocked Users', icon: Ban, action: () => navigate('/chat?filter=blocked') },
      ]
    },
    {
      id: 'features',
      title: 'Features',
      icon: Sparkles,
      items: [
        { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, action: () => navigate('/chat?panel=assistant') },
        { id: 'polls', label: 'Polls', icon: BarChart2, action: () => navigate('/chat?action=poll') },
        { id: 'summarize', label: 'Summarize Chat', icon: FileText, action: () => navigate('/chat?action=summarize') },
        { id: 'translate', label: 'Translation', icon: Languages, action: () => navigate('/chat?action=translate') },
      ]
    },
    {
      id: 'account',
      title: 'Account',
      icon: Settings,
      items: [
        { id: 'profile', label: 'My Profile', icon: Users, action: () => navigate('/settings?tab=profile') },
        { id: 'settings', label: 'Settings', icon: Settings, action: () => navigate('/settings') },
        { id: 'notifications', label: 'Notifications', icon: Bell, action: () => navigate('/settings?tab=notifications') },
        { id: 'admin', label: 'Admin Panel', icon: Shield, action: () => navigate('/admin'), adminOnly: true },
      ].filter(item => !item.adminOnly || user?.isAdmin)
    }
  ];

  const handleMenuClick = async (item) => {
    if (item.action) {
      item.action();
    } else if (item.id === 'new-group') {
      // Create new group - prompt for name
      const groupName = prompt('Enter group name:');
      if (groupName && groupName.trim()) {
        try {
          const response = await api.post('/rooms', { name: groupName.trim() });
          navigate('/chat', { state: { chatId: response.data.room._id, chatType: 'room' } });
        } catch (error) {
          console.error('Create group error:', error);
          alert('Failed to create group');
        }
      }
    } else if (item.id === 'groups') {
      // Navigate to chat and filter to show groups
      navigate('/chat?view=groups');
    }
    setIsOpen(false);
    setActiveSubmenu(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-[10001] p-2 rounded-lg bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/30 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/30 transition-all"
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

              {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            />

            {/* Menu Panel */}
            <motion.div
              ref={menuRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] z-[10000] bg-gradient-to-br from-slate-900/95 via-purple-900/30 to-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primaryFrom to-primaryTo bg-clip-text text-transparent">
                    Menu
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primaryFrom to-primaryTo flex items-center justify-center text-white font-semibold">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{user?.username || 'User'}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>

                {/* Status Selector */}
                <div className="mt-4">
                  <StatusSelector
                    currentStatus={user?.status || 'offline'}
                    onStatusChange={(status) => {
                      // Status updated via StatusSelector component
                    }}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Menu Sections - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {menuSections.map((section, sectionIndex) => {
                  const SectionIcon = section.icon;
                  return (
                    <div key={section.id} className="mb-4">
                      {/* Section Header */}
                      <div className="flex items-center gap-2 px-3 py-2 mb-2">
                        <SectionIcon className="w-4 h-4 text-primaryFrom" />
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          {section.title}
                        </h3>
                      </div>

                      {/* Section Items */}
                      {section.items.map((item, itemIndex) => {
                        const ItemIcon = item.icon;
                        return (
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: sectionIndex * 0.1 + itemIndex * 0.05 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleMenuClick(item)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-primaryFrom/30 transition-all group mb-2"
                          >
                            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primaryFrom/20 transition-colors">
                              <ItemIcon className="w-5 h-5 text-gray-300 group-hover:text-primaryFrom transition-colors" />
                            </div>
                            <span className="flex-1 text-left text-white font-medium">{item.label}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primaryFrom transition-colors" />
                          </motion.button>
                        );
                      })}
                    </div>
                  );
                })}

              </div>

              {/* Fixed Bottom Section */}
              <div className="p-4 border-t border-white/10 bg-gradient-to-br from-slate-900/95 via-purple-900/30 to-slate-900/95">
                {/* Theme Toggle */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onToggleDarkMode}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-primaryFrom/30 transition-all mb-2"
                >
                  <div className="p-2 rounded-lg bg-white/5">
                    {darkMode ? (
                      <Sun className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <Moon className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <span className="flex-1 text-left text-white font-medium">
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </motion.button>

                {/* Logout */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 backdrop-blur-sm border border-red-500/30 hover:border-red-500/50 transition-all"
                >
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <LogOut className="w-5 h-5 text-red-400" />
                  </div>
                  <span className="flex-1 text-left text-white font-medium">Logout</span>
                </motion.button>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-center text-gray-400">
                    Chaturway v1.0
                  </p>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* User Search Dropdown - Higher z-index to appear above menu */}
      {showUserSearch && (
        <UserSearchDropdown
          onSelectUser={(selectedUser) => {
            // Handle user selection - start conversation
            setShowUserSearch(false);
            setIsOpen(false);
            // Emit custom event that Chat.jsx can listen to
            window.dispatchEvent(new CustomEvent('startConversation', { 
              detail: { user: selectedUser } 
            }));
          }}
          onClose={() => setShowUserSearch(false)}
          currentUserId={user?._id || user?.id}
        />
      )}

      {/* Tech Skills Menu - Overlay when showing tech skills */}
      {showTechSkills && (
        <TechSkillsMenu
          onClose={() => {
            setShowTechSkills(false);
          }}
          onJoinSuccess={() => {
            setShowTechSkills(false);
            setIsOpen(false);
            // Navigate to chat to see the new group
            navigate('/chat');
          }}
        />
      )}
    </>
  );
};

export default HamburgerMenu;

