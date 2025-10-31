import { useEffect, useRef, useState } from 'react';
import { Check, CheckCheck, Download, Pin, Reply as ReplyIcon, Edit2, Trash2, Link as LinkIcon, Clock } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import MessageOptions from './MessageOptions';
import api from '../utils/api';
import { getSocket } from '../utils/socket';
import { highlightMentions, MentionText } from './MentionHighlight';

const ChatArea = ({ messages, typingUsers, currentUser, activeChat, chatType, onReply, onSuggestReplies, autoTranslateEnabled, translatedMessages }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [reactingToMessage, setReactingToMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const socket = getSocket();

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isOwnMessage = (message) => {
    const senderId = message.sender?._id || message.sender?.id;
    const userId = currentUser?._id || currentUser?.id;
    return senderId?.toString() === userId?.toString();
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}h`;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('video/')) return '🎥';
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('word')) return '📝';
    if (mimetype.includes('zip') || mimetype.includes('archive')) return '📦';
    if (mimetype.includes('audio')) return '🎵';
    return '📎';
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto relative"
      style={{
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(15, 23, 42, 0.98) 100%)'
      }}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 20%, rgba(147, 51, 234, 0.05) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)',
          ]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      <div className="relative z-10 p-4 md:p-6 space-y-3 min-h-full">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center h-full min-h-[60vh]"
          >
            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="text-7xl mb-4"
              >
                💬
              </motion.div>
              <p className="text-gray-400 text-lg font-light">No messages yet. Start the conversation!</p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => {
            const own = isOwnMessage(message);
            const showAvatar = index === 0 || 
              messages[index - 1]?.sender?._id !== message.sender?._id ||
              messages[index - 1]?.sender?.id !== message.sender?.id;

            if (message.deleted && !message.content?.includes('deleted')) {
              return null;
            }

            return (
              <motion.div
                key={message._id || message.id || index}
                data-message-id={message._id || message.id}
                initial={{ 
                  opacity: 0, 
                  y: 20,
                  scale: 0.95,
                  filter: 'blur(4px)'
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: 1,
                  filter: 'blur(0px)'
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.9,
                  y: -10,
                  transition: { duration: 0.2 }
                }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                  delay: index === messages.length - 1 ? 0 : 0
                }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className={`flex gap-3 ${own ? 'flex-row-reverse' : 'flex-row'} items-end group`}
                layout
              >
                {/* Avatar */}
                {!own && showAvatar && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 backdrop-blur-sm border border-purple-300 dark:border-purple-700 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold text-sm flex-shrink-0 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-200/50 to-purple-300/50 dark:from-purple-800/20 dark:to-purple-700/20 animate-pulse" />
                    <span className="relative z-10">
                      {message.sender?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </motion.div>
                )}
                {!own && !showAvatar && <div className="w-9 flex-shrink-0" />}

                <div className={`flex flex-col ${own ? 'items-end' : 'items-start'} max-w-[75%] md:max-w-[60%]`}>
                  {/* Sender name */}
                  {!own && showAvatar && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 px-1 font-medium"
                    >
                      {message.sender?.username || 'Unknown'}
                    </motion.span>
                  )}

                  {/* Reply preview */}
                  {message.replyTo && (
                    <motion.div
                      initial={{ opacity: 0, x: own ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mb-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 backdrop-blur-sm border-l-2 border-purple-500/50 max-w-full"
                    >
                      <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-0.5">
                        <ReplyIcon className="w-3 h-3" />
                        {message.replyTo.sender?.username || 'User'}
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 truncate">
                        {message.replyTo.content?.substring(0, 50)}...
                      </div>
                    </motion.div>
                  )}

                  {/* Message bubble */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`relative rounded-2xl px-4 py-2.5 shadow-xl transition-all duration-300 ${
                      own
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-sm border border-gray-200 dark:border-gray-600'
                    } ${message.isPending ? 'opacity-60' : ''} ${message.deleted ? 'opacity-40' : ''}`}
                    style={{
                      boxShadow: own 
                        ? '0 8px 32px rgba(139, 92, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                        : '0 4px 16px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05) inset'
                    }}
                  >
                    {/* Subtle glow effect */}
                    <div className={`absolute -inset-0.5 rounded-2xl blur-xl opacity-20 -z-10 ${
                      own ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-white/10'
                    }`} />

                    {/* Link preview */}
                    {message.linkPreview && (
                      <a
                        href={message.linkPreview.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mb-2 rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {message.linkPreview.image && (
                          <img
                            src={message.linkPreview.image}
                            alt={message.linkPreview.title}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="p-3 bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center gap-2 mb-1">
                            <LinkIcon className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{message.linkPreview.siteName}</span>
                          </div>
                          <h4 className={`font-semibold text-sm mb-1 line-clamp-1 ${own ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                            {message.linkPreview.title}
                          </h4>
                          {message.linkPreview.description && (
                            <p className={`text-xs line-clamp-2 ${own ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>
                              {message.linkPreview.description}
                            </p>
                          )}
                        </div>
                      </a>
                    )}

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mb-2 space-y-2">
                        {message.attachments.map((attachment, idx) => (
                          <div key={idx} className="rounded-lg overflow-hidden">
                            {attachment.mimetype?.startsWith('image/') ? (
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block group"
                              >
                                <motion.img
                                  whileHover={{ scale: 1.02 }}
                                  src={attachment.url}
                                  alt={attachment.filename}
                                  className="max-w-full h-auto max-h-64 rounded-lg cursor-pointer transition"
                                />
                              </a>
                            ) : attachment.mimetype?.startsWith('audio/') ? (
                              <audio controls className="w-full">
                                <source src={attachment.url} type={attachment.mimetype} />
                              </audio>
                            ) : (
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-3 p-3 rounded-lg backdrop-blur-sm border border-white/10 hover:border-white/20 transition ${
                                  own ? 'bg-white/10' : 'bg-white/5'
                                }`}
                              >
                                <span className="text-2xl">{getFileIcon(attachment.mimetype)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${own ? 'text-white' : 'text-gray-200'}`}>
                                    {attachment.filename}
                                  </p>
                                  <p className={`text-xs ${own ? 'text-white/70' : 'text-gray-400'}`}>
                                    Click to download
                                  </p>
                                </div>
                                <Download className={`w-4 h-4 ${own ? 'text-white/70' : 'text-gray-400'}`} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message content */}
                    {message.content && (
                      <div className={`text-sm break-words whitespace-pre-wrap leading-relaxed ${
                        own ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        <MentionText parts={highlightMentions(message.content, currentUser?.username)} />
                      </div>
                    )}

                    {/* Edited indicator */}
                    {message.edited && (
                      <span className={`text-xs opacity-60 italic ml-1 ${own ? 'text-white/70' : 'text-gray-400'}`}>
                        (edited)
                      </span>
                    )}

                    {/* Timestamp and read receipts */}
                      <div className={`flex items-center gap-1.5 mt-1.5 text-xs ${
                        own ? 'justify-end text-white/60' : 'justify-start text-gray-500 dark:text-gray-400'
                      }`}>
                      <span>{formatTime(message.createdAt)}</span>
                      {own && (
                        <span>
                          {message.readBy?.length > 1 ? (
                            <CheckCheck className="w-3.5 h-3.5 inline" />
                          ) : (
                            <Check className="w-3.5 h-3.5 inline" />
                          )}
                        </span>
                      )}
                    </div>

                    {/* Reactions */}
                    {message.reactions?.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {message.reactions.map((reaction, idx) => (
                          <motion.span
                            key={idx}
                            whileHover={{ scale: 1.2 }}
                            className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm border ${
                              own 
                                ? 'bg-white/20 border-white/30 text-white' 
                                : 'bg-gray-50 dark:bg-gray-600 border-gray-200 dark:border-gray-500 text-gray-700 dark:text-gray-200'
                            }`}
                          >
                            {reaction.emoji} {reaction.users?.length || 0}
                          </motion.span>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  {/* Message Options */}
                  <MessageOptions
                    message={message}
                    isOwnMessage={own}
                    onReact={(emoji) => {
                      const socket = getSocket();
                      if (!socket || !activeChat) return;
                      socket.emit('message:react', {
                        messageId: message._id || message.id,
                        emoji,
                        chatId: chatType === 'private' ? activeChat._id : null,
                        roomId: chatType === 'room' ? activeChat._id : null,
                      });
                    }}
                    onEdit={() => setEditingMessage(message)}
                    onDelete={() => {
                      const socket = getSocket();
                      if (!socket || !activeChat) return;
                      if (window.confirm('Delete this message?')) {
                        socket.emit('message:delete', {
                          messageId: message._id || message.id,
                          chatId: chatType === 'private' ? activeChat._id : null,
                          roomId: chatType === 'room' ? activeChat._id : null,
                        });
                      }
                    }}
                    onReply={() => onReply(message)}
                    onPin={async () => {
                      try {
                        await api.post(`/messages/${message._id || message.id}/pin`, { roomId: activeChat._id });
                      } catch (error) {
                        console.error('Pin error:', error);
                      }
                    }}
                    currentUser={currentUser}
                    chatType={chatType}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white dark:bg-gray-700 backdrop-blur-md rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-200 dark:border-gray-600 shadow-lg">
              <div className="flex gap-1.5 mb-1">
                {[0, 150, 300].map((delay) => (
                  <motion.div
                    key={delay}
                    className="w-2 h-2 bg-purple-500 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: delay / 1000,
                      ease: 'easeInOut'
                    }}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-400">
                {typingUsers.map(u => u.username).join(', ')} typing...
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatArea;
