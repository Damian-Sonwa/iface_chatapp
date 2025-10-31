import { motion } from 'framer-motion';

const AVATARS = [
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1547425260-6573a0bcc4b4?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1527980965255-8fdfa4c10f90?q=80&w=200&auto=format&fit=crop'
];

const FlippingAvatars = () => {
  return (
    <div className="px-4 py-2 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-3" style={{ perspective: 800 }}>
        {AVATARS.map((src, idx) => (
          <motion.div
            key={src+idx}
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 shadow-md bg-white/10"
            animate={{ rotateY: [0, 180, 360] }}
            transition={{ duration: 6 + idx, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img src={src} alt="online user" className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FlippingAvatars;





