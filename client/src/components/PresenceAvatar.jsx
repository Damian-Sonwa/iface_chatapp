import { motion } from 'framer-motion';

/**
 * PresenceAvatar Component
 * Displays user avatar with online/offline/away status indicator
 */
const PresenceAvatar = ({ src, username, status = 'offline', size = 40, className = '' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
      default:
        return 'bg-gray-500';
    }
  };

  const getInitials = () => {
    if (!username) return '?';
    return username
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      {/* Avatar */}
      <div
        className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-primaryFrom to-primaryTo flex items-center justify-center text-white font-semibold"
        style={{ fontSize: size * 0.4 }}
      >
        {src ? (
          <img
            src={src}
            alt={username || 'User'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className={src ? 'hidden' : 'flex items-center justify-center w-full h-full'}
          style={{ fontSize: size * 0.4 }}
        >
          {getInitials()}
        </div>
      </div>

      {/* Status Indicator */}
      <motion.div
        initial={false}
        animate={{
          scale: status === 'online' ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: status === 'online' ? Infinity : 0,
          ease: 'easeInOut',
        }}
        className={`
          absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-900
          ${getStatusColor()}
        `}
        style={{
          width: size * 0.3,
          height: size * 0.3,
          minWidth: 12,
          minHeight: 12,
        }}
      />
    </div>
  );
};

export default PresenceAvatar;

