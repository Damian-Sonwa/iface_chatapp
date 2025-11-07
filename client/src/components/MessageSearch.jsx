import { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowUp, ArrowDown, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const MessageSearch = ({ activeChat, chatType, onClose, onSelectMessage }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setError('');
      return;
    }

    if (!activeChat?._id) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError('');
        const params = { q: query.trim(), limit: 50 };
        if (chatType === 'room') {
          params.roomId = activeChat._id;
        } else if (chatType === 'private') {
          params.chatId = activeChat._id;
        }

        const response = await api.get('/messages/search', {
          params,
          signal: controller.signal
        });

        const fetched = response.data.messages || [];
        setResults(fetched);
        setSelectedIndex(fetched.length > 0 ? 0 : -1);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('Message search error:', err);
          setError(err.response?.data?.error || 'Failed to search messages');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, chatType, activeChat?._id]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      const message = results[selectedIndex >= 0 ? selectedIndex : 0];
      onSelectMessage?.(message);
    } else if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp' && results.length > 0) {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : results.length - 1);
    }
  };

  const handleSelectMessage = (message, index) => {
    setSelectedIndex(index);
    onSelectMessage?.(message);
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
              {loading && (
                <div className="flex items-center justify-center py-6 text-sm text-gray-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                </div>
              )}

              {!loading && error && (
                <div className="flex items-center justify-center py-4 text-sm text-red-400 gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {!loading && !error && results.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-sm">
                  No messages found matching "{query}"
                </div>
              )}

              {!loading && !error && results.length > 0 && (
                <>
                  <div className="text-xs text-gray-400 mb-2 px-2">
                    Found {results.length} {results.length === 1 ? 'message' : 'messages'}
                  </div>
                  {results.map((message, index) => {
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







