import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const AuthHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute top-8 left-0 right-0 z-20 flex flex-col items-center"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="flex items-center gap-3 mb-2"
      >
        {/* Logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-500/50 relative overflow-hidden">
            {/* Animated shine effect */}
            <motion.div
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
            {/* Icon */}
            <MessageCircle className="w-8 h-8 text-white relative z-10" strokeWidth={2.5} />
          </div>
          {/* Glow effect */}
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-600 blur-xl -z-10"
          />
        </div>
        
        {/* Name */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent tracking-tight">
            Chaturway
          </h1>
          <p className="text-sm font-medium text-white/90 tracking-wide">
            Connect • Chat • Create
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthHeader;

