import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageCircle, Users, Pin, Archive, Plus } from 'lucide-react';
import api from '../utils/api';
import PresenceAvatar from './PresenceAvatar';

/**
 * ConversationList Component
 * Displays list of conversations (DMs and Groups) using the new Conversation model
 */
const ConversationList = ({ onSelectConversation, activeConversationId, user }) => {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    // Filter conversations based on search
    if (!searchQuery) {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv => {
        if (conv.type === 'dm') {
          const otherUser = conv.participants.find(p => p._id !== user?._id);
          return otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase());
        } else {
          return conv.title?.toLowerCase().includes(searchQuery.toLowerCase());
        }
      });
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations, user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/conversations');
      const sorted = response.data.sort((a, b) => {
        // Sort by pinned first, then by lastMessageAt
        const aPinned = a.pinnedBy?.includes(user?._id);
        const bPinned = b.pinnedBy?.includes(user?._id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        const aTime = new Date(a.lastMessageAt || a.createdAt);
        const bTime = new Date(b.lastMessageAt || b.createdAt);
        return bTime - aTime;
      });
      setConversations(sorted);
      setFilteredConversations(sorted);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastMessage = (conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    const message = conversation.lastMessage;
    if (message.content) {
      return message.content.length > 50 
        ? message.content.substring(0, 50) + '...'
        : message.content;
    }
    if (message.attachments?.length > 0) {
      return '📎 Attachment';
    }
    return 'Message';
  };

  const getConversationTitle = (conversation) => {
    if (conversation.type === 'group') {
      return conversation.title || 'Group Chat';
    } else {
      // DM - get other participant's name
      const otherUser = conversation.participants.find(p => p._id !== user?._id);
      return otherUser?.username || 'Unknown User';
    }
  };

  const getConversationAvatar = (conversation) => {
    if (conversation.type === 'group') {
      return null; // Group avatar placeholder
    } else {
      const otherUser = conversation.participants.find(p => p._id !== user?._id);
      return otherUser?.avatarUrl || otherUser?.avatar;
    }
  };

  const isPinned = (conversation) => {
    return conversation.pinnedBy?.includes(user?._id);
  };

  const isArchived = (conversation) => {
    return conversation.archivedBy?.includes(user?._id);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryFrom"></div>
      </div>
    );
  }

  // Separate pinned and unpinned
  const pinned = filteredConversations.filter(c => isPinned(c) && !isArchived(c));
  const unpinned = filteredConversations.filter(c => !isPinned(c) && !isArchived(c));

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900/50 via-purple-900/20 to-slate-900/50 backdrop-blur-md border-r border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primaryFrom to-primaryTo bg-clip-text text-transparent">
            Conversations
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-gradient-to-r from-primaryFrom/20 to-primaryTo/20 backdrop-blur-sm border border-primaryFrom/30 hover:border-primaryFrom/50 transition-all"
          >
            <Plus className="w-5 h-5 text-primaryFrom" />
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-primaryFrom/50 focus:ring-1 focus:ring-primaryFrom/30 transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {/* Pinned Conversations */}
        {pinned.length > 0 && (
          <div className="px-2 pt-2">
            <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Pinned
            </div>
            {pinned.map((conversation) => (
              <ConversationItem
                key={conversation._id}
                conversation={conversation}
                isActive={activeConversationId === conversation._id}
                onClick={() => onSelectConversation(conversation)}
                getTitle={getConversationTitle}
                getAvatar={getConversationAvatar}
                formatLastMessage={formatLastMessage}
                user={user}
              />
            ))}
          </div>
        )}

        {/* Unpinned Conversations */}
        {unpinned.length > 0 && (
          <div className="px-2 pt-2">
            {pinned.length > 0 && (
              <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                All Conversations
              </div>
            )}
            {unpinned.map((conversation) => (
              <ConversationItem
                key={conversation._id}
                conversation={conversation}
                isActive={activeConversationId === conversation._id}
                onClick={() => onSelectConversation(conversation)}
                getTitle={getConversationTitle}
                getAvatar={getConversationAvatar}
                formatLastMessage={formatLastMessage}
                user={user}
              />
            ))}
          </div>
        )}

        {filteredConversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-sm">Start a new conversation to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ConversationItem = ({ conversation, isActive, onClick, getTitle, getAvatar, formatLastMessage, user }) => {
  const title = getTitle(conversation);
  const avatar = getAvatar(conversation);
  const lastMessage = formatLastMessage(conversation);
  const isPinned = conversation.pinnedBy?.includes(user?._id);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative p-3 rounded-xl mb-2 cursor-pointer transition-all duration-200
        ${isActive 
          ? 'bg-gradient-to-r from-primaryFrom/30 to-primaryTo/30 border border-primaryFrom/50 shadow-lg shadow-primaryFrom/20' 
          : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
        }
        backdrop-blur-sm
      `}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {conversation.type === 'group' ? (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondaryFrom to-secondaryTo flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          ) : (
            <PresenceAvatar
              src={avatar}
              username={title}
              status={conversation.participants.find(p => p._id !== user?._id)?.status || 'offline'}
              size={48}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-white truncate">{title}</h3>
            {isPinned && (
              <Pin className="w-4 h-4 text-primaryFrom flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-400 truncate">{lastMessage}</p>
        </div>
      </div>

      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primaryFrom to-primaryTo rounded-r-full"
        />
      )}
    </motion.div>
  );
};

export default ConversationList;

