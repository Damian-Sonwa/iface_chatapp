import { Pin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PinnedMessagesBar = ({ pinnedMessages, onClose, onMessageClick }) => {
  if (!pinnedMessages || pinnedMessages.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-orange-100 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-lg p-3 mb-3"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-semibold text-orange-900 dark:text-orange-100">
              Pinned Messages ({pinnedMessages.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-orange-200 dark:hover:bg-orange-800 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {pinnedMessages.map((msg) => (
            <button
              key={msg._id || msg.id}
              onClick={() => onMessageClick?.(msg)}
              className="w-full text-left p-2 rounded hover:bg-orange-200 dark:hover:bg-orange-800/50 transition text-sm"
            >
              <div className="font-medium text-orange-900 dark:text-orange-100">
                {msg.sender?.username || 'User'}
              </div>
              <div className="text-xs text-orange-700 dark:text-orange-300 truncate">
                {msg.content}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PinnedMessagesBar;






