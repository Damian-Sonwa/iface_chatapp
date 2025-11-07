import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ReactionBurst = ({ trigger }) => {
  const [show, setShow] = useState(false);
  const [emoji, setEmoji] = useState('❤️');

  useEffect(() => {
    if (!trigger) return;
    setEmoji(trigger.emoji || '❤️');
    setShow(true);
    const t = setTimeout(() => setShow(false), 1000);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: -10 }}
          exit={{ opacity: 0, scale: 0.6, y: -40 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-none fixed bottom-24 right-8 z-40 text-4xl"
        >
          {emoji}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReactionBurst;









