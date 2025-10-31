import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const reactions = ['👍','🔥','😍','😂','👏','😮'];

const MomentsViewer = ({ open, moments, initialId, onClose }) => {
  const idx0 = useMemo(() => Math.max(0, (moments || []).findIndex(m => m._id === initialId)), [moments, initialId]);
  const [index, setIndex] = useState(idx0);
  const current = moments?.[index];

  useEffect(() => { setIndex(idx0); }, [idx0]);

  useEffect(() => {
    if (current) api.post(`/moments/${current._id}/view`).catch(()=>{});
  }, [current]);

  if (!open || !current) return null;

  const next = () => setIndex(i => Math.min(moments.length - 1, i + 1));
  const prev = () => setIndex(i => Math.max(0, i - 1));

  const react = async (emoji) => {
    try { await api.post(`/moments/${current._id}/react`, { emoji }); } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative w-full max-w-3xl h-[70vh] bg-gradient-to-br from-white/10 to-gray-900/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20" onClick={(e)=>e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-white/10 rounded-lg border border-white/20 text-white"><X className="w-5 h-5" /></button>
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/30">
          <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 5 }} className="h-full bg-purple-500" />
        </div>
        <div className="w-full h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={current._id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full h-full flex items-center justify-center">
              {current.type === 'text' ? (
                <div className="w-full h-full flex items-center justify-center p-8 text-2xl font-semibold text-white" style={{ background: current.gradient || 'linear-gradient(135deg,#8B5CF6,#E9D5FF)' }}>
                  {current.text}
                </div>
              ) : (
                <img src={current.media?.url} alt={current.user?.username} className="max-h-full object-contain" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="text-white text-sm">{current.user?.username}</div>
          <div className="flex gap-2">
            {reactions.map(e => (
              <button key={e} onClick={() => react(e)} className="px-3 py-1.5 rounded-full bg-white/20 text-white hover:bg-white/30">{e}</button>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-between">
          <button onClick={prev} className="h-full w-1/4" />
          <button onClick={next} className="h-full w-1/4" />
        </div>
      </div>
    </div>
  );
};

export default MomentsViewer;







