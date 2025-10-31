import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const SuggestReplies = ({ messageText, onSelect, onClose }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await api.post('/ai/suggest-replies', {
          messageText,
          context: 'chat conversation'
        });

        setSuggestions(response.data.suggestions || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to generate suggestions');
        console.error('Suggest replies error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (messageText) {
      fetchSuggestions();
    }
  }, [messageText]);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-300 text-sm">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Generating suggestions...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-xl border border-gray-200 dark:border-gray-700 min-w-[250px]"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-orange-500" />
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Suggested Replies</span>
      </div>

      <div className="space-y-2">
        {suggestions.map((suggestion, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onSelect?.(suggestion);
              onClose?.();
            }}
            className="w-full text-left px-3 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg text-sm text-gray-800 dark:text-gray-200 transition border border-transparent hover:border-orange-300 dark:hover:border-orange-700"
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default SuggestReplies;






