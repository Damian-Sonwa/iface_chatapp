import { useMemo } from 'react';
import { motion } from 'framer-motion';

const StarryBackground = ({ starCount = 60 }) => {
  const stars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < starCount; i++) {
      arr.push({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 3
      });
    }
    return arr;
  }, [starCount]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-gray-900 via-gray-900/95 to-black">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0.3, y: 0 }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.6)]"
          style={{ top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size }}
        />
      ))}
    </div>
  );
};

export default StarryBackground;








