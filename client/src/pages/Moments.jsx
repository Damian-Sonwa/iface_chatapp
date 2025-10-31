import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import api from '../utils/api';

const Moments = ({ onAdd }) => {
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
    <div className="rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl relative min-h-[60vh]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Moments</h2>
        <motion.button
          onClick={onAdd}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="px-3 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Moment
        </motion.button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {moments.map((m) => (
          <motion.div key={m._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl overflow-hidden border border-orange-300/50 bg-white dark:bg-gray-800">
            {m.type === 'text' ? (
              <div className="h-40 flex items-center justify-center text-center p-4 text-gray-900 dark:text-gray-100" style={{ background: m.gradient || 'linear-gradient(135deg,#FF7A00,#FFF4E5)' }}>
                {m.text}
              </div>
            ) : (
              <img src={m.media?.url} alt={m.user?.username} className="w-full h-40 object-cover" />
            )}
            <div className="p-3 text-sm text-gray-600 dark:text-gray-300">{m.user?.username}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Moments;







