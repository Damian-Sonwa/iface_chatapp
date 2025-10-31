import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IMAGES = [
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494707924465-e1426acb48cb?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1485217988980-11786ced9454?q=80&w=1600&auto=format&fit=crop'
];

const FlippingAuthBackground = ({ intervalMs = 5000 }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % IMAGES.length), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={IMAGES[index]}
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: -90 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url('${IMAGES[index]}')` }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
};

export default FlippingAuthBackground;




