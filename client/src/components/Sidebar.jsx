import { useState } from 'react';
import { Users, Search, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AnimatedBadge from './AnimatedBadge';
import SidebarQuickSearch from './SidebarQuickSearch';

const Sidebar = ({
  rooms,
  privateChats,
  activeChat,
  chatType,
  onChatSelect,
  onOpenPanel,
  activePanel,
  friendRequestsCount = 0,
  onTechSkillJoin,
  isOverlay = false
}) => {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter rooms to only show groups the user is a member of
  const currentUserId = (currentUser?._id || currentUser?.id)?.toString();
  
  const userRooms = rooms.filter(room => {
    // Check if user is a member
    const isMember = room.members?.some(m => {
      const memberId = (m._id?.toString() || m.id?.toString() || m?.toString());
      return memberId === currentUserId;
    });
    
    // Only show rooms where user is a member
    // Exclude main tech skill groups (they're accessed via Tech Groups card)
    // But include General Info rooms and Classrooms if user is a member
    if (!isMember) return false;
    
    // Exclude main tech skill groups (roomType === 'main' with techSkillId)
    if (room.techSkillId && room.roomType === 'main') {
      return false; // Main tech groups accessed via Tech Groups card
    }
    
    return true; // Include all other rooms where user is a member
  });

  // Combine user's rooms and privateChats into a unified conversation list
  const allConversations = [
    ...userRooms.map(room => ({ ...room, conversationType: 'room' })),
    ...privateChats.map(chat => ({ ...chat, conversationType: 'private' }))
  ].sort((a, b) => {
    // Sort by lastMessageAt (most recent first)
    const aTime = new Date(a.lastMessageAt || a.updatedAt || a.createdAt || 0);
    const bTime = new Date(b.lastMessageAt || b.updatedAt || b.createdAt || 0);
    return bTime - aTime;
  });

  // Filter conversations based on search query
  const filteredConversations = allConversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    
    if (conv.conversationType === 'room') {
      return conv.name?.toLowerCase().includes(query) || 
             conv.description?.toLowerCase().includes(query);
    } else {
      // For private chats, search by participant username
      const currentUserId = (currentUser?._id || currentUser?.id)?.toString();
      const otherUser = conv.participants?.find(p => 
        (p._id || p.id)?.toString() !== currentUserId
      );
      return otherUser?.username?.toLowerCase().includes(query);
    }
  });

  const containerClasses = isOverlay
    ? 'flex flex-col w-full bg-gradient-to-br from-gray-900/95 via-slate-900/90 to-black/90 border border-white/10 rounded-3xl shadow-xl backdrop-blur-xl p-4 space-y-4'
    : 'hidden md:flex flex-col w-80 xl:w-[22rem] ml-6 my-6 bg-gradient-to-br from-gray-900/95 via-purple-900/40 to-slate-900/95 border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(8,7,15,0.55)] backdrop-blur-2xl p-6 space-y-6 relative z-10';

  return (
    <div className={containerClasses}>
      <div className="pb-5 border-b border-white/10">
        {/* Header with Friends button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white tracking-tight">Chats</h2>
          <motion.button
            onClick={() => onOpenPanel?.('friends')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-2xl backdrop-blur-md border transition relative ${
              activePanel === 'friends'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400/50 shadow-lg shadow-purple-500/30'
                : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
            }`}
            title="Friends"
          >
            <Heart className="w-5 h-5" />
            {friendRequestsCount > 0 && (
              <AnimatedBadge count={friendRequestsCount} className="absolute -top-1 -right-1" />
            )}
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
          />
          {/* Feature quick search results */}
          <div className="absolute left-0 right-0 mt-1">
            <SidebarQuickSearch
              query={searchQuery}
              onSelect={(item) => {
                if (item.action.type === 'panel') {
                  onOpenPanel?.(item.action.value);
                } else if (item.action.type === 'create_room') {
                  // Create room via hamburger menu now
                  onOpenPanel?.('friends');
                } else if (item.action.type === 'route') {
                  window.location.hash = item.action.value;
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          filteredConversations.map(conv => {
            const isActive = activeChat?._id === conv._id && chatType === conv.conversationType;
            
            // For private chats, get the other user
            if (conv.conversationType === 'private') {
              const currentUserId = (currentUser?._id || currentUser?.id)?.toString();
              const otherUser = conv.participants?.find(p => 
                (p._id || p.id)?.toString() !== currentUserId
              ) || conv.participants?.[0];
              
              return (
                <motion.button
                  key={conv._id}
                  onClick={() => onChatSelect(conv, 'private')}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className={`group relative w-full p-4 text-left transition flex items-center gap-3 rounded-2xl backdrop-blur-sm border ${
                    isActive
                      ? 'bg-purple-500/20 border-purple-400/50 shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-400/50'
                        : 'bg-white/10 border border-white/20'
                    }`}>
                      {otherUser?.avatarUrl || otherUser?.avatar ? (
                        <img
                          src={otherUser.avatarUrl || otherUser.avatar}
                          alt={otherUser.username}
                          className="w-full h-full rounded-full object-cover relative z-10"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 animate-pulse" />
                          <span className="relative z-10 text-purple-200">
                            {otherUser?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </>
                      )}
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
                      {conv.lastMessage?.content || 'No messages yet'}
                    </div>
                  </div>
                </motion.button>
              );
            } else {
              // For rooms/groups
              const isTechSkillGroup = conv.techSkillId || conv.requiresApproval;
              const isGeneralInfo = conv.roomType === 'general-info';
              const isClassroom = conv.roomType === 'classroom';
              const currentUserId = (currentUser?._id || currentUser?.id)?.toString();
              const isMember = conv.members?.some(m => 
                (m._id?.toString() || m.id?.toString() || m?.toString()) === currentUserId
              );
              
              // Check if user needs to verify (tech skill group and not a member)
              const needsVerification = isTechSkillGroup && !isMember;

              const handleClick = () => {
                if (needsVerification && onTechSkillJoin) {
                  // Show verification/join form
                  onTechSkillJoin(conv);
                } else {
                  // Open chat normally
                  onChatSelect(conv, 'room');
                }
              };

              // Get icon based on room type
              const getRoomIcon = () => {
                if (isClassroom) {
                  return <span className="text-indigo-300 relative z-10">🎓</span>;
                } else if (isGeneralInfo) {
                  return <span className="text-blue-300 relative z-10">ℹ️</span>;
                }
                return <Users className="w-5 h-5 text-purple-200 relative z-10" />;
              };

              // Get room name
              const getRoomName = () => {
                if (isClassroom) {
                  return conv.name || 'Classroom';
                } else if (isGeneralInfo) {
                  return conv.name || `${conv.techSkillId?.name || ''} - General Info`;
                } else if (conv.techSkillId?.name) {
                  return `${conv.techSkillId.name} Group`;
                }
                return conv.name || 'Group Chat';
              };

              return (
                <motion.button
                  key={conv._id}
                  onClick={handleClick}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className={`w-full p-4 text-left transition flex items-center gap-3 rounded-2xl backdrop-blur-sm border ${
                    isActive
                      ? isClassroom
                        ? 'bg-indigo-500/20 border-indigo-400/50 shadow-lg shadow-indigo-500/20'
                        : isGeneralInfo
                        ? 'bg-blue-500/20 border-blue-400/50 shadow-lg shadow-blue-500/20'
                        : 'bg-purple-500/20 border-purple-400/50 shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold relative overflow-hidden ${
                    isActive
                      ? isClassroom
                        ? 'bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-400/50'
                        : isGeneralInfo
                        ? 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-400/50'
                        : 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-400/50'
                      : 'bg-white/10 border border-white/20'
                  }`}>
                    <div className={`absolute inset-0 animate-pulse ${
                      isClassroom
                        ? 'bg-gradient-to-br from-indigo-400/20 to-purple-400/20'
                        : isGeneralInfo
                        ? 'bg-gradient-to-br from-blue-400/20 to-cyan-400/20'
                        : 'bg-gradient-to-br from-purple-400/20 to-pink-400/20'
                    }`} />
                    {getRoomIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-gray-100">
                      {getRoomName()}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {conv.lastMessage?.content || conv.description || conv.techSkillId?.description || 'No messages yet'}
                    </div>
                  </div>
                </motion.button>
              );
            }
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;

