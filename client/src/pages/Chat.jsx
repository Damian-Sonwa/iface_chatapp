import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../utils/socket';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import MessageInput from '../components/MessageInput';
import MessageSearch from '../components/MessageSearch';
import PinnedMessagesBar from '../components/PinnedMessagesBar';
import NotificationBell from '../components/NotificationBell';
import UserProfile from '../components/UserProfile';
import SummarizeModal from '../components/SummarizeModal';
import SuggestReplies from '../components/SuggestReplies';
import { LogOut, Moon, Sun, Search, MoreVertical, User, Sparkles, Languages, Settings, Menu, X } from 'lucide-react';
import { applyTheme, getVibeTheme, vibes } from '../utils/themes';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import StarryBackground from '../components/StarryBackground';
import FloralBackground from '../components/FloralBackground';
import StatusBar from '../components/StatusBar';
import Friends from './Friends';
import Invites from './Invites';
import MomentsBar from '../components/MomentsBar';
import MomentsComposer from '../components/MomentsComposer';
import MomentsViewer from '../components/MomentsViewer';
import AIAssistant from '../components/AIAssistant';
import Moments from './Moments';
import FlippingAvatars from '../components/FlippingAvatars';
import ReactionBurst from '../components/ReactionBurst';
import PollModal from '../components/PollModal';

const Chat = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [activeChat, setActiveChat] = useState(null);
  const [chatType, setChatType] = useState('room'); // 'room' or 'private'
  const [rooms, setRooms] = useState([]);
  const [privateChats, setPrivateChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showSummarize, setShowSummarize] = useState(false);
  const [activePanel, setActivePanel] = useState(null); // 'friends' | 'invites' | null
  const [showMomentsComposer, setShowMomentsComposer] = useState(false);
  const [viewer, setViewer] = useState({ open: false, moments: [], id: null });
  const [initialMomentText, setInitialMomentText] = useState('');
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState({});
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(null);
  const [reactionTrigger, setReactionTrigger] = useState(null);
  const [showPoll, setShowPoll] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const socket = getSocket();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
    
    // Apply user theme
    if (user?.theme) {
      const themeName = user.autoVibe && user.vibe 
        ? getVibeTheme(user.vibe, user.theme, user.autoVibe)
        : (user.theme || 'default');
      applyTheme(themeName, darkMode);
    }
  }, [darkMode, user?.theme, user?.vibe, user?.autoVibe]);

  useEffect(() => {
    if (!socket) return;

    fetchRooms();
    fetchPrivateChats();
    fetchUsers();

    socket.on('message:new', ({ message, chatId }) => {
      setMessages(prev => {
        // Check if message already exists
        const exists = prev.find(m => 
          (m._id && message._id && m._id === message._id) || 
          (m.id && message.id && m.id === message.id)
        );
        if (exists) {
          // Update existing message (replace temp)
          return prev.map(m => 
            (m._id === message._id || m.id === message.id) ? message : m
          );
        }
        // Remove any pending temp messages and add the real one
        const filtered = prev.filter(m => !m.isPending);
        return [...filtered, message];
      });

      if (chatId && activeChat?._id === chatId) {
        markAsRead(message._id || message.id);
      }
    });

    socket.on('message:edited', ({ message }) => {
      setMessages(prev => prev.map(m => 
        (m._id === message._id || m.id === message.id) ? message : m
      ));
    });

    socket.on('message:deleted', ({ messageId }) => {
      setMessages(prev => prev.map(m => {
        if ((m._id === messageId || m.id === messageId)) {
          return { ...m, deleted: true, content: 'This message was deleted' };
        }
        return m;
      }));
    });

    socket.on('message:reacted', ({ message }) => {
      setMessages(prev => prev.map(m => 
        (m._id === message._id || m.id === message.id) ? message : m
      ));
      const lastReaction = (message.reactions || []).slice(-1)[0];
      if (lastReaction) setReactionTrigger({ emoji: lastReaction.emoji, ts: Date.now() });
    });

    socket.on('message:expired', ({ messageId }) => {
      setMessages(prev => prev.map(m => {
        if ((m._id === messageId || m.id === messageId)) {
          return { ...m, deleted: true, content: 'This message has disappeared' };
        }
        return m;
      }));
    });

    socket.on('typing:start', ({ userId, username }) => {
      setTypingUsers(prev => {
        if (prev.find(u => u.userId === userId)) return prev;
        return [...prev, { userId, username }];
      });
    });

    socket.on('typing:stop', ({ userId }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== userId));
    });

    socket.on('user:online', ({ userId }) => {
      updateUserStatus(userId, 'online');
    });

    socket.on('user:offline', ({ userId }) => {
      updateUserStatus(userId, 'offline');
    });

    const moodInterval = setInterval(() => {
      try {
        const recent = messages.slice(-30).map(m => (m.content || '').toLowerCase()).join(' ');
        const positive = ['great','awesome','love','nice','good','cool','🎉','😊'];
        const negative = ['sad','angry','annoyed','bad','hate','tired','😢'];
        let score = 0;
        positive.forEach(w => { if (recent.includes(w)) score++; });
        negative.forEach(w => { if (recent.includes(w)) score--; });
        const isDark = document.documentElement.classList.contains('dark');
        if (score >= 2) {
          applyTheme('sunset', isDark);
        } else if (score <= -2) {
          applyTheme('ocean', isDark);
        }
      } catch {}
    }, 8000);

    return () => {
      socket.off('message:new');
      socket.off('message:edited');
      socket.off('message:deleted');
      socket.off('message:reacted');
      socket.off('message:expired');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('user:online');
      socket.off('user:offline');
      clearInterval(moodInterval);
    };
  }, [socket, activeChat]);

  // Handle navigation from Friends page
  useEffect(() => {
    if (!user || !location.state?.chatId) return;

    const loadChatFromNavigation = async () => {
      try {
        if (location.state.chatType === 'private') {
          const response = await api.get('/private');
          const chats = response.data.chats || [];
          const chat = chats.find(c => c._id === location.state.chatId);
          
          if (chat) {
            handleChatSelect(chat, 'private');
          }
        }
      } catch (error) {
        console.error('Error loading chat from navigation:', error);
      } finally {
        // Clear location state
        navigate(location.pathname, { replace: true, state: {} });
      }
    };

    // Small delay to ensure privateChats are loaded
    const timer = setTimeout(loadChatFromNavigation, 300);
    return () => clearTimeout(timer);
  }, [location.state, user]);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data.rooms);
    } catch (error) {
      console.error('Fetch rooms error:', error);
    }
  };

  const fetchPrivateChats = async () => {
    try {
      const response = await api.get('/private');
      setPrivateChats(response.data.chats);
    } catch (error) {
      console.error('Fetch chats error:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/rooms/users/all');
      setUsers(response.data.users.filter(u => (u.id || u._id) !== (user.id || user._id)));
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  const fetchMessages = async (roomId, chatId) => {
    try {
      let response;
      if (roomId) {
        response = await api.get(`/rooms/${roomId}/messages`);
      } else {
        response = await api.get(`/private/messages/${chatId}`);
      }
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const updateUserStatus = (userId, status) => {
    setUsers(prev => prev.map(u => 
      u.id === userId || u._id === userId ? { ...u, status } : u
    ));
    setRooms(prev => prev.map(room => ({
      ...room,
      members: room.members.map(m => 
        (m._id === userId || m.id === userId) ? { ...m, status } : m
      )
    })));
  };

  const markAsRead = (messageId) => {
    if (!socket || !activeChat) return;
    socket.emit('message:read', { 
      messageId, 
      chatId: chatType === 'private' ? activeChat._id : null 
    });
  };

  const handleChatSelect = async (chat, type) => {
    setActiveChat(chat);
    setChatType(type);
    setTypingUsers([]);
    setReplyingTo(null);

    if (type === 'room') {
      await fetchMessages(chat._id, null);
      socket?.emit('room:join', { roomId: chat._id });
      
      // Fetch pinned messages
      try {
        const response = await api.get(`/messages/room/${chat._id}/pinned`);
        setPinnedMessages(response.data.messages);
      } catch (error) {
        console.error('Error fetching pinned messages:', error);
      }
    } else {
      await fetchMessages(null, chat._id);
      const otherUserId = chat.participants.find(p => (p._id || p.id) !== (user._id || user.id))?._id || chat.participants.find(p => (p._id || p.id) !== (user._id || user.id))?.id;
      socket?.emit('chat:join', { chatId: chat._id, otherUserId });
    }
  };

  const handleSendMessage = (content, messageType = 'text', attachments = [], replyTo = null, disappearingAfter = null) => {
    if (!socket || !activeChat) return;
    if (!content.trim() && attachments.length === 0) return;

    // Optimistically add message to UI immediately
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      sender: {
        _id: user._id || user.id,
        id: user.id || user._id,
        username: user.username
      },
      content: content.trim(),
      messageType,
      attachments,
      replyTo: replyTo ? { _id: replyTo, content: '...', sender: {} } : null,
      disappearingAfter,
      createdAt: new Date().toISOString(),
      readBy: [{ user: user._id || user.id }],
      isPending: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setReplyingTo(null); // Clear reply after sending

    if (chatType === 'room') {
      socket.emit('message:room', {
        roomId: activeChat._id,
        content,
        messageType,
        attachments,
        replyTo,
        disappearingAfter
      });
    } else {
      const recipientId = activeChat.participants.find(p => (p._id || p.id) !== (user._id || user.id))?._id || activeChat.participants.find(p => (p._id || p.id) !== (user._id || user.id))?.id;
      socket.emit('message:private', {
        chatId: activeChat._id,
        content,
        messageType,
        attachments,
        replyTo,
        disappearingAfter,
        recipientId
      });
    }

    // Remove temp message when real one arrives (handled in socket.on('message:new'))
    setTimeout(() => {
      setMessages(prev => prev.filter(m => !m.isPending || m._id !== tempMessage._id));
    }, 5000);
  };

  const handleStartChat = async (userId) => {
    try {
      const response = await api.get(`/private/${userId}`);
      const chat = response.data.chat;
      setPrivateChats(prev => {
        if (prev.find(c => c._id === chat._id)) return prev;
        return [chat, ...prev];
      });
      handleChatSelect(chat, 'private');
    } catch (error) {
      console.error('Start chat error:', error);
    }
  };

  return (
    <div className="flex h-screen relative overflow-hidden">
      {darkMode ? <StarryBackground /> : <FloralBackground />}
      {/* Desktop Sidebar */}
      <Sidebar
        rooms={rooms}
        privateChats={privateChats}
        users={users}
        activeChat={activeChat}
        chatType={chatType}
        onChatSelect={handleChatSelect}
        onStartChat={handleStartChat}
        onCreateRoom={fetchRooms}
        onOpenPanel={setActivePanel}
        activePanel={activePanel}
        friendRequestsCount={0}
        invitesCount={0}
      />
      
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileSidebar(false)} />
          <div className="relative z-10 w-64 border-r border-white/10 bg-gradient-to-b from-[#FFF4E5] to-white dark:from-gray-900 dark:to-gray-900 flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-purple-600 dark:text-purple-400">Chaturway</h2>
              <button onClick={() => setShowMobileSidebar(false)} className="p-2 rounded-lg hover:bg-white/20 text-gray-900 dark:text-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                rooms={rooms}
                privateChats={privateChats}
                users={users}
                activeChat={activeChat}
                chatType={chatType}
                onChatSelect={(chat, type) => {
                  handleChatSelect(chat, type);
                  setShowMobileSidebar(false);
                }}
                onStartChat={handleStartChat}
                onCreateRoom={fetchRooms}
                onOpenPanel={(panel) => {
                  setActivePanel(panel);
                  setShowMobileSidebar(false);
                }}
                activePanel={activePanel}
                friendRequestsCount={0}
                invitesCount={0}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setShowMobileSidebar(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-purple-200 dark:border-purple-700 rounded-xl shadow-lg shadow-purple-500/20 hover:bg-white dark:hover:bg-gray-700 transition"
      >
        <Menu className="w-6 h-6 text-purple-600 dark:text-purple-400" />
      </button>

      <div className="flex-1 flex flex-col relative z-10">
        <MomentsBar onOpenComposer={() => setShowMomentsComposer(true)} onOpenViewer={(moments, id) => setViewer({ open: true, moments, id })} />
        <FlippingAvatars />
        {activePanel === 'moments' ? (
          <div className="p-4 md:p-6">
            <Moments onAdd={() => setShowMomentsComposer(true)} />
          </div>
        ) : activePanel === 'friends' ? (
          <div className="p-4 md:p-6">
            <Friends />
          </div>
        ) : activePanel === 'invites' ? (
          <div className="p-4 md:p-6">
            <Invites />
          </div>
        ) : activePanel === 'assistant' ? (
          <div className="p-4 md:p-6 h-full">
            <AIAssistant />
          </div>
        ) : activeChat ? (
          <>
            {showSearch ? (
              <MessageSearch messages={messages} onClose={() => setShowSearch(false)} />
            ) : (
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl relative z-10"
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-purple-400/30 backdrop-blur-sm border border-purple-400/50 flex items-center justify-center text-purple-200 font-semibold relative overflow-hidden shadow-lg shadow-purple-500/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-purple-300/20 animate-pulse" />
                    <span className="relative z-10">
                      {chatType === 'room' 
                        ? activeChat.name?.charAt(0).toUpperCase()
                        : (() => {
                            const otherUser = activeChat.participants?.find(p => (p._id || p.id) !== (user._id || user.id));
                            return otherUser?.username?.charAt(0).toUpperCase() || 'U';
                          })()
                      }
                    </span>
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {chatType === 'room' 
                        ? activeChat.name
                        : (() => {
                            const otherUser = activeChat.participants?.find(p => (p._id || p.id) !== (user._id || user.id));
                            return otherUser?.username || 'User';
                          })()
                      }
                    </h3>
                    {chatType === 'private' && (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        {(() => {
                          const otherUser = activeChat.participants?.find(p => (p._id || p.id) !== (user._id || user.id));
                          return otherUser?.status === 'online' ? (
                            <>
                              <motion.div 
                                className="w-2 h-2 bg-green-400 rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                              Online
                            </>
                          ) : 'Offline';
                        })()}
                      </p>
                    )}
                  </div>
                </div>
                  <div className="flex items-center gap-2">
                    {/* Summarize button (rooms only) */}
                    {chatType === 'room' && (
                      <motion.button
                        onClick={() => setShowSummarize(true)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2.5 rounded-xl bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-purple-500 transition text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 shadow-lg"
                        title="AI Summarize"
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.button>
                    )}
                    {chatType === 'room' && activeChat && (
                      <motion.button
                        onClick={() => setShowPoll(true)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2.5 rounded-xl bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-purple-500 transition text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 shadow-lg"
                        title="Create Poll"
                      >
                        + Poll
                      </motion.button>
                    )}
                    {/* Auto-translate toggle */}
                    <motion.button
                      onClick={() => {
                        const newState = !autoTranslateEnabled[activeChat?._id] || false;
                        setAutoTranslateEnabled(prev => ({ ...prev, [activeChat._id]: !newState }));
                        api.post('/users/auto-translate', {
                          chatId: activeChat._id,
                          enabled: !newState
                        }).catch(console.error);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-2.5 rounded-xl backdrop-blur-sm border transition shadow-lg ${
                        autoTranslateEnabled[activeChat?._id]
                          ? 'bg-purple-500/30 border-purple-400/50 text-purple-200'
                          : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20 hover:text-white'
                      }`}
                      title="Auto-translate"
                    >
                      <Languages className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => setShowProfile(true)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition text-gray-300 hover:text-white shadow-lg"
                      title="Your profile"
                    >
                      <User className="w-5 h-5" />
                    </motion.button>
                    <NotificationBell />
                    <motion.button
                      onClick={() => setShowSearch(true)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition text-gray-300 hover:text-white shadow-lg"
                      title="Search messages"
                    >
                      <Search className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => setDarkMode(!darkMode)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-2.5 rounded-xl backdrop-blur-sm border shadow-lg transition ${
                        darkMode 
                          ? 'bg-purple-500/20 border-purple-400/50 text-purple-200 hover:bg-purple-500/30' 
                          : 'bg-yellow-500/20 border-yellow-400/50 text-yellow-200 hover:bg-yellow-500/30'
                      }`}
                      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                    >
                      {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </motion.button>
                    {user?.isAdmin && (
                      <motion.button
                        onClick={() => navigate('/admin')}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2.5 rounded-xl bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-purple-500 transition text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 shadow-lg"
                        title="Admin Dashboard"
                      >
                        <Settings className="w-5 h-5" />
                      </motion.button>
                    )}
                    <motion.button
                      onClick={logout}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition text-gray-300 hover:text-white shadow-lg"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

            {/* Pinned messages */}
            {chatType === 'room' && pinnedMessages.length > 0 && (
              <PinnedMessagesBar
                pinnedMessages={pinnedMessages}
                onClose={() => setPinnedMessages([])}
                onMessageClick={(msg) => {
                  const element = document.querySelector(`[data-message-id="${msg._id || msg.id}"]`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('ring-2', 'ring-purple-500');
                    setTimeout(() => {
                      element.classList.remove('ring-2', 'ring-purple-500');
                    }, 2000);
                  }
                }}
              />
            )}

            <ChatArea
              messages={messages}
              typingUsers={typingUsers}
              currentUser={user}
              activeChat={activeChat}
              chatType={chatType}
              onReply={setReplyingTo}
              onSuggestReplies={(message) => setShowSuggestions(message)}
              autoTranslateEnabled={autoTranslateEnabled[activeChat?._id]}
              translatedMessages={translatedMessages}
            />

            <MessageInput
              onSend={handleSendMessage}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              suggestedReply={showSuggestions?.content}
              onShareMomentFromAI={(text) => {
                setInitialMomentText(text || '');
                setShowMomentsComposer(true);
              }}
              onTypingStart={() => {
                if (!socket || !activeChat) return;
                if (chatType === 'room') {
                  socket.emit('typing:start', { roomId: activeChat._id });
                } else {
                  socket.emit('typing:start', { chatId: activeChat._id });
                }
              }}
              onTypingStop={() => {
                if (!socket || !activeChat) return;
                if (chatType === 'room') {
                  socket.emit('typing:stop', { roomId: activeChat._id });
                } else {
                  socket.emit('typing:stop', { chatId: activeChat._id });
                }
              }}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="text-7xl mb-4"
              >
                💬
              </motion.div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-200">Select a chat to start messaging</h2>
              <p className="text-gray-600 dark:text-gray-400">Choose a group or start a private conversation</p>
            </motion.div>
          </div>
        )}
        <MomentsComposer open={showMomentsComposer} onClose={() => setShowMomentsComposer(false)} onPosted={() => setShowMomentsComposer(false)} initialText={initialMomentText} />
        <PollModal open={showPoll} onClose={() => setShowPoll(false)} roomId={chatType==='room'?activeChat?._id:null} onCreated={()=>setShowPoll(false)} />
        <MomentsViewer open={viewer.open} moments={viewer.moments} initialId={viewer.id} onClose={() => setViewer(v => ({ ...v, open: false }))} />
        <ReactionBurst trigger={reactionTrigger} />
      </div>

      {/* User Profile Modal */}
      {showProfile && (
        <UserProfile
          user={user}
          onClose={() => setShowProfile(false)}
          onUpdate={(updatedUser) => {
            // Update user in context/auth if needed
            setShowProfile(false);
          }}
        />
      )}

      {/* Summarize Modal */}
      {showSummarize && (
        <SummarizeModal
          isOpen={showSummarize}
          onClose={() => setShowSummarize(false)}
          roomId={activeChat?._id}
        />
      )}

      {/* Suggested Replies */}
      {showSuggestions && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute bottom-24 right-4 pointer-events-auto">
            <SuggestReplies
              messageText={showSuggestions.content}
              onSelect={(text) => {
                // Insert into message input
                setShowSuggestions({ ...showSuggestions, content: text });
              }}
              onClose={() => setShowSuggestions(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;

