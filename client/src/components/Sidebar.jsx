import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Users, Plus, Search, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AnimatedBadge from './AnimatedBadge';
import SidebarQuickSearch from './SidebarQuickSearch';
import api from '../utils/api';

const Sidebar = ({ rooms, privateChats, users, activeChat, chatType, onChatSelect, onStartChat, onCreateRoom, onOpenPanel, activePanel, friendRequestsCount = 0, invitesCount = 0 }) => {
  const { user: currentUser } = useAuth();
  const [view, setView] = useState('rooms'); // 'rooms', 'private', 'users'
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchDebounceRef = useRef(null);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    try {
      await api.post('/rooms', { name: roomName });
      setRoomName('');
      setShowCreateRoom(false);
      onCreateRoom();
    } catch (error) {
      console.error('Create room error:', error);
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChats = privateChats.filter(chat => {
    const otherUser = chat.participants?.find(p => p._id !== activeChat?.participants?.[0]?._id);
    return otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredUsers = (searchQuery.trim() ? remoteUsers : users).filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Remote search for users when in users view
  useEffect(() => {
    if (view !== 'users') return;
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(async () => {
      const query = searchQuery.trim();
      if (!query) {
        setRemoteUsers([]);
        return;
      }
      setSearchLoading(true);
      try {
        const response = await api.post('/friends/search', { username: query });
        setRemoteUsers(response.data.users || []);
      } catch (e) {
        console.error('User search failed:', e);
        setRemoteUsers([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(searchDebounceRef.current);
  }, [searchQuery, view]);

  return (
    <div className="w-64 border-r border-white/10 bg-gradient-to-b from-[#FFF4E5] to-white dark:from-gray-900 dark:to-gray-900 flex flex-col relative z-10">
      <div className="p-4 border-b border-white/10">
        <div className="flex gap-2 mb-4">
          <motion.button
            onClick={() => setView('rooms')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition backdrop-blur-sm border ${
              view === 'rooms' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400/50 shadow-lg shadow-purple-500/30' 
                : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Groups
          </motion.button>
          <motion.button
            onClick={() => setView('private')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition backdrop-blur-sm border ${
              view === 'private' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400/50 shadow-lg shadow-purple-500/30' 
                : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Chats
          </motion.button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
          />
          {/* Feature quick search results */}
          <div className="absolute left-0 right-0 mt-1">
            <SidebarQuickSearch
              query={searchQuery}
              onSelect={(item) => {
                if (item.action.type === 'panel') {
                  onOpenPanel?.(item.action.value);
                } else if (item.action.type === 'view') {
                  setView(item.action.value);
                } else if (item.action.type === 'create_room') {
                  setShowCreateRoom(true);
                } else if (item.action.type === 'create_poll') {
                  onOpenPanel?.('moments'); // fallback open panel, poll is in chat header for rooms
                } else if (item.action.type === 'route') {
                  window.location.hash = item.action.value; // basic route change
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === 'rooms' && (
          <div>
            <div className="p-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400">GROUPS</span>
              <motion.button
                onClick={() => setShowCreateRoom(!showCreateRoom)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition text-gray-300 hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>
            {showCreateRoom && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateRoom} 
                className="p-2"
              >
                <input
                  type="text"
                  placeholder="Room name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-sm mb-2 transition-all"
                  autoFocus
                />
                <div className="flex gap-2">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition shadow-lg shadow-purple-500/30"
                  >
                    Create
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowCreateRoom(false);
                      setRoomName('');
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-gray-300 text-sm font-medium transition"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.form>
            )}
            {filteredRooms.map(room => (
              <motion.button
                key={room._id}
                onClick={() => onChatSelect(room, 'room')}
                whileHover={{ scale: 1.02, x: 4 }}
                className={`w-full p-3 text-left transition flex items-center gap-3 rounded-xl backdrop-blur-sm border ${
                  activeChat?._id === room._id && chatType === 'room' 
                    ? 'bg-purple-500/20 border-purple-400/50 shadow-lg shadow-purple-500/20' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold relative overflow-hidden ${
                  activeChat?._id === room._id && chatType === 'room'
                    ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-400/50'
                    : 'bg-white/10 border border-white/20'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 animate-pulse" />
                  <span className="relative z-10 text-purple-200">
                    {room.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-gray-100">{room.name}</div>
                  <div className="text-xs text-gray-400 truncate">{room.description || 'No description'}</div>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {view === 'private' && (
          <div>
            <div className="p-2">
              <span className="text-sm font-semibold text-gray-400">DIRECT MESSAGES</span>
            </div>
            {filteredChats.map(chat => {
              const currentUserId = (currentUser?._id || currentUser?.id)?.toString();
              const otherUser = chat.participants?.find(p => 
                (p._id || p.id)?.toString() !== currentUserId
              ) || chat.participants?.[0];
              return (
                <motion.button
                  key={chat._id}
                  onClick={() => onChatSelect(chat, 'private')}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className={`group relative w-full p-3 text-left transition flex items-center gap-3 rounded-xl backdrop-blur-sm border ${
                    activeChat?._id === chat._id && chatType === 'private' 
                      ? 'bg-purple-500/20 border-purple-400/50 shadow-lg shadow-purple-500/20' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold relative overflow-hidden ${
                      activeChat?._id === chat._id && chatType === 'private'
                        ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-400/50'
                        : 'bg-white/10 border border-white/20'
                    }`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 animate-pulse" />
                      <span className="relative z-10 text-purple-200">
                        {otherUser?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    {otherUser?.status === 'online' && (
                      <motion.div 
                        className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 shadow-lg shadow-green-400/50"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-gray-100">{otherUser?.username || 'Unknown User'}</div>
                    <div className="text-xs text-gray-400 truncate">
                      {chat.lastMessage?.content || 'No messages yet'}
                    </div>
                  </div>
                  {/* Mini profile on hover */}
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 0, y: 6 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 p-3 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-xl hidden group-hover:block"
                  >
                    <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">{otherUser?.username}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 capitalize">{otherUser?.status || 'offline'}</div>
                  </motion.div>
                </motion.button>
              );
            })}
          </div>
        )}

        {view === 'users' && (
          <div>
            <div className="p-2">
              <span className="text-sm font-semibold text-gray-400">ALL USERS</span>
            </div>
            {searchLoading && (
              <div className="px-3 py-2 text-xs text-gray-400">Searching...</div>
            )}
            {filteredUsers.map(user => (
              <motion.button
                key={user.id || user._id}
                onClick={() => onStartChat(user.id || user._id)}
                whileHover={{ scale: 1.02, x: 4 }}
                className="group relative w-full p-3 text-left transition flex items-center gap-3 rounded-xl backdrop-blur-sm border bg-white/5 border-white/10 hover:bg-white/10"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-purple-200 font-semibold relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 animate-pulse" />
                    <span className="relative z-10">
                      {user.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {user.status === 'online' && (
                    <motion.div 
                      className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 shadow-lg shadow-green-400/50"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-gray-100">{user.username}</div>
                  <div className="text-xs text-gray-400 truncate capitalize">{user.status}</div>
                </div>
                {/* Mini profile on hover */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 0, y: 6 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 p-3 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-xl hidden group-hover:block"
                >
                  <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">{user.username}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 capitalize">{user.status || 'offline'}</div>
                </motion.div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Community Section */}
      <div className="p-2 border-t border-white/10">
        <div className="px-2 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Community</div>
        <div className="flex flex-col gap-2">
          <motion.button
            onClick={() => onOpenPanel?.('friends')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-2 px-3 rounded-xl text-sm font-medium transition backdrop-blur-sm border flex items-center justify-start gap-2 ${
              activePanel === 'friends'
                ? 'bg-[#FF7A00] text-white border-orange-400/50 shadow-lg shadow-orange-500/30'
                : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
            }`}
          >
            <span>👥</span>
            Friends
            <AnimatedBadge count={friendRequestsCount} />
          </motion.button>
          <motion.button
            onClick={() => onOpenPanel?.('invites')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-2 px-3 rounded-xl text-sm font-medium transition backdrop-blur-sm border flex items-center justify-start gap-2 ${
              activePanel === 'invites'
                ? 'bg-[#FF7A00] text-white border-orange-400/50 shadow-lg shadow-orange-500/30'
                : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
            }`}
          >
            <span>🔗</span>
            Invites
            <AnimatedBadge count={invitesCount} />
          </motion.button>
          <motion.button
            onClick={() => onOpenPanel?.('moments')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-2 px-3 rounded-xl text-sm font-medium transition backdrop-blur-sm border flex items-center justify-start gap-2 ${
              activePanel === 'moments'
                ? 'bg-[#FF7A00] text-white border-orange-400/50 shadow-lg shadow-orange-500/30'
                : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
            }`}
          >
            <span>✨</span>
            Moments
          </motion.button>
        <motion.button
          onClick={() => onOpenPanel?.('assistant')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
            className={`w-full py-2 px-3 rounded-xl text-sm font-medium transition backdrop-blur-sm border flex items-center justify-start gap-2 ${
            activePanel === 'assistant'
              ? 'bg-[#FF7A00] text-white border-orange-400/50 shadow-lg shadow-orange-500/30'
              : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
          }`}
        >
          <span>🤖</span>
          Assistant
        </motion.button>
        </div>
      </div>

              {(view === 'rooms' || view === 'private') && (
                <div className="p-2 border-t border-white/10">
                  <motion.button
                    onClick={() => setView('users')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 px-3 rounded-xl text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition flex items-center gap-2 text-gray-300 hover:text-white shadow-lg"
                  >
                    <Users className="w-4 h-4" />
                    All Users
                  </motion.button>
                </div>
              )}

              {view === 'users' && (
                <div className="p-2 border-t border-white/10">
                  <motion.button
                    onClick={() => setView('rooms')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 px-3 rounded-xl text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition flex items-center gap-2 text-gray-300 hover:text-white shadow-lg"
                  >
                    <Users className="w-4 h-4" />
                    Back to Groups
                  </motion.button>
                </div>
              )}
    </div>
  );
};

export default Sidebar;

