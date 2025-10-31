import { useState } from 'react';
import { X, Loader2, Sparkles, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const SummarizeModal = ({ isOpen, onClose, roomId }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messageCount, setMessageCount] = useState(50);

  const handleSummarize = async () => {
    if (!roomId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/ai/summarize/${roomId}`, {
        messageCount: parseInt(messageCount)
      });

      setSummary(response.data.summary);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate summary');
      console.error('Summarize error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Sparkles className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold">AI Summary</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!summary ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Number of messages to summarize
              </label>
              <input
                type="number"
                min="10"
                max="200"
                value={messageCount}
                onChange={(e) => setMessageCount(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSummarize}
              disabled={loading}
              className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating summary...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Summary
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              This will analyze the last {messageCount} messages and create a concise summary.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {summary}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSummary('');
                  setError(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition"
              >
                New Summary
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(summary);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Copy
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SummarizeModal;






