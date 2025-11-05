import { motion } from 'framer-motion';

/**
 * SkeletonLoader Component
 * Shimmer loading states for various UI elements
 */
const SkeletonLoader = ({ type = 'message', count = 1, className = '' }) => {
  const shimmer = (
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      animate={{
        x: ['-100%', '100%'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );

  if (type === 'message') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`flex gap-3 mb-4 ${className}`}>
            <div className="relative w-10 h-10 rounded-full bg-white/10 overflow-hidden">
              {shimmer}
            </div>
            <div className="flex-1">
              <div className="relative h-4 w-24 bg-white/10 rounded mb-2 overflow-hidden">
                {shimmer}
              </div>
              <div className="relative h-16 w-3/4 bg-white/10 rounded-xl overflow-hidden">
                {shimmer}
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === 'conversation') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`flex gap-3 p-3 mb-2 ${className}`}>
            <div className="relative w-12 h-12 rounded-full bg-white/10 overflow-hidden">
              {shimmer}
            </div>
            <div className="flex-1">
              <div className="relative h-4 w-32 bg-white/10 rounded mb-2 overflow-hidden">
                {shimmer}
              </div>
              <div className="relative h-3 w-full bg-white/10 rounded overflow-hidden">
                {shimmer}
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === 'avatar') {
    return (
      <div className={`relative w-10 h-10 rounded-full bg-white/10 overflow-hidden ${className}`}>
        {shimmer}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`relative h-4 bg-white/10 rounded overflow-hidden mb-2 ${className}`} style={{ width: `${Math.random() * 40 + 60}%` }}>
            {shimmer}
          </div>
        ))}
      </>
    );
  }

  // Default skeleton
  return (
    <div className={`relative bg-white/10 rounded overflow-hidden ${className}`}>
      {shimmer}
    </div>
  );
};

export default SkeletonLoader;

