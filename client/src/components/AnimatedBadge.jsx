import { motion } from 'framer-motion';

const AnimatedBadge = ({ count }) => {
  if (!count) return null;
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="ml-2 bg-[#FF7A00] text-white text-xs px-2 py-0.5 rounded-full"
    >
      {count}
    </motion.span>
  );
};

export default AnimatedBadge;







