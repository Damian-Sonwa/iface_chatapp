import { useState } from 'react';
import { MoreVertical, Edit, Trash2, Pin, Reply, Copy, Languages, Sparkles, Archive, ArchiveRestore } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MessageOptions = ({
  message,
  isOwnMessage,
  onEdit,
  onDelete,
  onReply,
  onPin,
  onUnpin,
  onTranslate,
  onSuggestReplies,
  onArchive,
  onUnarchive
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute right-0 top-0 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]"
            >
              <button
                onClick={() => {
                  navigator.clipboard.writeText(message.content);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy text
              </button>

              {onReply && (
                <button
                  onClick={() => {
                    onReply(message);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
              )}

              {onSuggestReplies && !isOwnMessage && (
                <button
                  onClick={() => {
                    onSuggestReplies(message);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Suggest Replies
                </button>
              )}

              {onTranslate && (
                <button
                  onClick={() => {
                    onTranslate(message);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Languages className="w-4 h-4" />
                  Translate
                </button>
              )}

              {isOwnMessage && onEdit && (
                <button
                  onClick={() => {
                    onEdit(message);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}

              {onArchive && !message.isArchived && (
                <button
                  onClick={() => {
                    onArchive(message);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Archive className="w-4 h-4" />
                  Archive
                </button>
              )}

              {onUnarchive && message.isArchived && (
                <button
                  onClick={() => {
                    onUnarchive(message);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <ArchiveRestore className="w-4 h-4" />
                  Unarchive
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => {
                    onDelete(message);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}

              {onUnpin && message.pinned && (
                <button
                  onClick={() => {
                    onUnpin(message);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Pin className="w-4 h-4" />
                  Unpin
                </button>
              )}

              {onPin && !message.pinned && (
                <button
                  onClick={() => {
                    onPin(message);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Pin className="w-4 h-4" />
                  Pin message
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageOptions;

