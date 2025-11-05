import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * ParticleEffect Component
 * Creates particle animation on message send
 */
const ParticleEffect = ({ trigger, position, onComplete }) => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    angle: (Math.PI * 2 * i) / 20,
    distance: Math.random() * 100 + 50,
  }));

  useEffect(() => {
    if (trigger) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!trigger) return null;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: position?.x || '50%',
        top: position?.y || '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {particles.map((particle) => {
        const x = Math.cos(particle.angle) * particle.distance;
        const y = Math.sin(particle.angle) * particle.distance;

        return (
          <motion.div
            key={particle.id}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              x,
              y,
              opacity: [1, 0.8, 0],
              scale: [1, 1.5, 0],
            }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
            }}
            className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-primaryFrom to-primaryTo"
            style={{
              boxShadow: '0 0 10px rgba(99, 102, 241, 0.8)',
            }}
          />
        );
      })}
    </div>
  );
};

export default ParticleEffect;

