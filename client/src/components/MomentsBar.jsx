import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const MomentsBar = ({ onOpenComposer, onOpenViewer }) => {
  const [moments, setMoments] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/moments/feed');
        setMoments(res.data.moments || []);
      } catch (e) {
        console.error('Load moments error:', e);
      }
    })();
  }, []);

  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl relative">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
        {moments.map(m => (
          <motion.button
            key={m._id}
            onClick={() => onOpenViewer(moments, m._id)}
            whileHover={{ rotate: 1, scale: 1.02 }}
            className="flex-shrink-0 w-40 h-24 rounded-xl border border-orange-300/60 bg-gradient-to-br from-white/60 to-orange-50/40 dark:from-gray-700/50 dark:to-orange-900/10 shadow-sm overflow-hidden relative"
          >
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ boxShadow: '0 0 0 2px rgba(255,122,0,0.3) inset' }}
            />
            {m.type === 'text' ? (
              <div className="w-full h-full flex items-center justify-center p-3 text-center text-sm font-medium text-gray-800 dark:text-gray-100">
                {m.text}
              </div>
            ) : (
              <img src={m.media?.url} alt={m.user?.username} className="w-full h-full object-cover" />
            )}
            <div className="absolute bottom-1 left-1 right-1 text-[10px] text-gray-700 dark:text-gray-200 truncate">{m.user?.username}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MomentsBar;


