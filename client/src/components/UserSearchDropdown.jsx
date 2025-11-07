import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, X } from 'lucide-react';
import api from '../utils/api';
import PresenceAvatar from './PresenceAvatar';

/**
 * UserSearchDropdown Component
 * Search users with dropdown results, used for starting conversations
 */
const UserSearchDropdown = ({ onSelectUser, onClose, currentUserId, excludeUserIds = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get('/users', {
          params: { search: searchQuery }
        });
        
        // Filter out excluded users and current user
        const filtered = response.data.filter(user => 
          user._id !== currentUserId && 
          !excludeUserIds.includes(user._id)
        );
        setUsers(filtered);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error searching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentUserId, excludeUserIds]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (users.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < users.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleSelectUser(users[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [users, selectedIndex]);

  const handleSelectUser = (user) => {
    onSelectUser(user);
    setSearchQuery('');
    setUsers([]);
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        ref={dropdownRef}
        className="w-full max-w-md bg-gradient-to-br from-slate-900/95 via-purple-900/30 to-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-primaryFrom to-primaryTo bg-clip-text text-transparent">
              Search Users
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-primaryFrom/50 focus:ring-2 focus:ring-primaryFrom/20 transition-all"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center text-gray-400">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primaryFrom"></div>
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          )}

          {!loading && searchQuery && users.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No users found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}

          {!loading && !searchQuery && (
            <div className="p-8 text-center text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Start typing to search users</p>
            </div>
          )}

          <AnimatePresence>
            {users.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-2"
              >
                {users.map((user, index) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectUser(user)}
                    className={`
                      p-3 rounded-xl mb-2 cursor-pointer transition-all
                      ${selectedIndex === index
                        ? 'bg-gradient-to-r from-primaryFrom/30 to-primaryTo/30 border border-primaryFrom/50'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                      }
                      backdrop-blur-sm
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <PresenceAvatar
                        src={user.avatarUrl || user.avatar}
                        username={user.username}
                        status={user.status}
                        size={48}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate">
                          {user.username}
                        </h4>
                        {user.bio && (
                          <p className="text-sm text-gray-400 truncate">
                            {user.bio}
                          </p>
                        )}
                        {user.status === 'online' && (
                          <p className="text-xs text-green-400 mt-1">Online</p>
                        )}
                        {user.status === 'away' && (
                          <p className="text-xs text-yellow-400 mt-1">Away</p>
                        )}
                        {user.status === 'offline' && user.lastSeen && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last seen {formatLastSeen(user.lastSeen)}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Hint */}
        <div className="p-3 border-t border-white/10 text-xs text-gray-400 text-center">
          Press <kbd className="px-2 py-1 bg-white/5 rounded">Enter</kbd> to select, <kbd className="px-2 py-1 bg-white/5 rounded">Esc</kbd> to close
        </div>
      </motion.div>
    </div>
  );
};

const formatLastSeen = (date) => {
  const now = new Date();
  const lastSeen = new Date(date);
  const diffMs = now - lastSeen;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return lastSeen.toLocaleDateString();
};

export default UserSearchDropdown;

