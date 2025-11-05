import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreVertical,
  Sparkles,
  Languages,
  Pin,
  Archive,
  Trash2,
  User,
  Settings,
  Search,
  X
} from 'lucide-react';

/**
 * ChatHeaderMenu Component
 * Dropdown menu for chat-specific actions (pin, archive, delete, etc.)
 */
const ChatHeaderMenu = ({ 
  conversation, 
  onPin, 
  onArchive, 
  onDelete, 
  onSearch, 
  onShowProfile,
  onShowSettings,
  onSummarize,
  onToggleTranslate,
  translateEnabled,
  user
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const menuItems = [
    {
      id: 'search',
      label: 'Search Messages',
      icon: Search,
      action: () => {
        onSearch?.();
        setIsOpen(false);
      }
    },
    {
      id: 'pin',
      label: conversation?.pinnedBy?.includes(user?._id) ? 'Unpin Conversation' : 'Pin Conversation',
      icon: Pin,
      action: () => {
        onPin?.();
        setIsOpen(false);
      }
    },
    {
      id: 'archive',
      label: conversation?.archivedBy?.includes(user?._id) ? 'Unarchive Conversation' : 'Archive Conversation',
      icon: Archive,
      action: () => {
        onArchive?.();
        setIsOpen(false);
      }
    },
    {
      id: 'translate',
      label: translateEnabled ? 'Disable Auto-Translate' : 'Enable Auto-Translate',
      icon: Languages,
      action: () => {
        onToggleTranslate?.();
        setIsOpen(false);
      }
    },
    {
      id: 'summarize',
      label: 'AI Summarize',
      icon: Sparkles,
      action: () => {
        onSummarize?.();
        setIsOpen(false);
      },
      show: conversation?.type === 'group'
    },
    {
      id: 'profile',
      label: 'View Profile',
      icon: User,
      action: () => {
        onShowProfile?.();
        setIsOpen(false);
      }
    },
    {
      id: 'settings',
      label: 'Chat Settings',
      icon: Settings,
      action: () => {
        onShowSettings?.();
        setIsOpen(false);
      }
    },
    {
      id: 'delete',
      label: 'Delete Conversation',
      icon: Trash2,
      action: () => {
        if (window.confirm('Are you sure you want to delete this conversation?')) {
          onDelete?.();
        }
        setIsOpen(false);
      },
      danger: true
    }
  ].filter(item => item.show !== false);

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition text-gray-300 hover:text-white shadow-lg"
        title="More options"
      >
        <MoreVertical className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 z-20 min-w-[220px] bg-gradient-to-br from-slate-900/95 via-purple-900/30 to-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
            >
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={item.action}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-left
                      transition-all
                      ${item.danger
                        ? 'hover:bg-red-500/20 text-red-400'
                        : 'hover:bg-white/10 text-white'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${item.danger ? 'text-red-400' : 'text-gray-300'}`} />
                    <span className="flex-1">{item.label}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatHeaderMenu;

