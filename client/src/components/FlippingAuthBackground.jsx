import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IMAGES = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop', // Team collaboration
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600&auto=format&fit=crop', // Business networking
  'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop', // Video call
  'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1600&auto=format&fit=crop', // People connecting
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1600&auto=format&fit=crop' // Social interaction
];

const FlippingAuthBackground = ({ intervalMs = 5000 }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % IMAGES.length), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`bg-${index}`}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url('${IMAGES[index]}')` }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/85" />
    </div>
  );
};

export default FlippingAuthBackground;




