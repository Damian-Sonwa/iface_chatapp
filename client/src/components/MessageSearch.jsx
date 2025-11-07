import { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MessageSearch = ({ messages, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Filter messages: exclude deleted messages and filter by content
  const filteredMessages = messages.filter(msg => {
    // Skip deleted messages
    if (msg.deleted || msg.deletedAt) return false;
    
    // Skip messages without content
    if (!msg.content || msg.content.trim() === '') return false;
    
    // Search in content
    if (query.trim()) {
      return msg.content.toLowerCase().includes(query.toLowerCase());
    }
    
    return false;
  });

  const scrollToMessage = (message) => {
    const msgId = message._id || message.id;
    if (!msgId) return;
    
    // Try to find the message element
    const element = document.querySelector(`[data-message-id="${msgId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the message
      element.classList.add('ring-2', 'ring-purple-500', 'ring-offset-2');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-purple-500', 'ring-offset-2');
      }, 3000);
    } else {
      // If element not found, try scrolling the chat area
      const chatArea = document.querySelector('[class*="overflow-y-auto"]');
      if (chatArea) {
        chatArea.scrollTo({ top: 0, behavior: 'smooth' });
        // Retry after a short delay
        setTimeout(() => {
          const retryElement = document.querySelector(`[data-message-id="${msgId}"]`);
          if (retryElement) {
            retryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            retryElement.classList.add('ring-2', 'ring-purple-500', 'ring-offset-2');
            setTimeout(() => {
              retryElement.classList.remove('ring-2', 'ring-purple-500', 'ring-offset-2');
            }, 3000);
          }
        }, 500);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && filteredMessages.length > 0) {
      e.preventDefault();
      const message = filteredMessages[selectedIndex >= 0 ? selectedIndex : 0];
      scrollToMessage(message);
    } else if (e.key === 'ArrowDown' && filteredMessages.length > 0) {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredMessages.length);
    } else if (e.key === 'ArrowUp' && filteredMessages.length > 0) {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : filteredMessages.length - 1);
    }
  };

  const handleSelectMessage = (message, index) => {
    setSelectedIndex(index);
    scrollToMessage(message);
  };

  const formatMessagePreview = (content, maxLength = 60) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border-b border-white/10 shadow-lg"
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search messages in this chat..."
              className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {query && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-sm">
                  No messages found matching "{query}"
                </div>
              ) : (
                <>
                  <div className="text-xs text-gray-400 mb-2 px-2">
                    Found {filteredMessages.length} {filteredMessages.length === 1 ? 'message' : 'messages'}
                  </div>
                  {filteredMessages.map((message, index) => {
                    const sender = message.sender?.username || 'Unknown';
                    const isSelected = selectedIndex === index;
                    const messageId = message._id || message.id;
                    
                    return (
                      <motion.div
                        key={messageId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSelectMessage(message, index)}
                        className={`p-3 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-purple-500/20 border border-purple-500/50'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-purple-400">{sender}</span>
                              <span className="text-xs text-gray-500">
                                {formatTime(message.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-200 line-clamp-2">
                              {formatMessagePreview(message.content)}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="flex items-center gap-1 text-xs text-purple-400">
                              <ArrowUp className="w-3 h-3" />
                              <ArrowDown className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </>
              )}
            </div>
          )}
          
          {!query && (
            <div className="text-center py-4 text-gray-400 text-sm">
              Start typing to search messages...
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MessageSearch;







