import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Circle, Clock, Wifi, WifiOff } from 'lucide-react';
import api from '../utils/api';

/**
 * StatusSelector Component
 * Dropdown to select user status (online, away, offline)
 */
const StatusSelector = ({ currentStatus, onStatusChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus || 'offline');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statusOptions = [
    { value: 'online', label: 'Online', icon: Circle, color: 'text-green-400', bgColor: 'bg-green-400' },
    { value: 'away', label: 'Away', icon: Clock, color: 'text-yellow-400', bgColor: 'bg-yellow-400' },
    { value: 'offline', label: 'Offline', icon: WifiOff, color: 'text-gray-400', bgColor: 'bg-gray-400' },
  ];

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    setIsOpen(false);
    
    try {
      await api.patch('/api/users/profile', { status: newStatus });
      onStatusChange?.(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      // Revert on error
      setStatus(status);
    }
  };

  const currentOption = statusOptions.find(opt => opt.value === status) || statusOptions[2];
  const Icon = currentOption.icon;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-white/5 hover:bg-white/10 backdrop-blur-sm
          border border-white/10 hover:border-white/20
          transition-all text-sm
        `}
      >
        <Icon className={`w-4 h-4 ${currentOption.color}`} />
        <span className="text-white">{currentOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full mt-2 right-0 z-20 min-w-[180px] bg-gradient-to-br from-slate-900/95 via-purple-900/30 to-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
            >
              {statusOptions.map((option) => {
                const OptionIcon = option.icon;
                const isSelected = option.value === status;

                return (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStatusChange(option.value)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-left
                      transition-all
                      ${isSelected
                        ? 'bg-gradient-to-r from-primaryFrom/20 to-primaryTo/20 border-l-2 border-primaryFrom'
                        : 'hover:bg-white/10'
                      }
                    `}
                  >
                    <OptionIcon className={`w-4 h-4 ${option.color}`} />
                    <span className="text-white flex-1">{option.label}</span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-2 h-2 rounded-full ${option.bgColor}`}
                      />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatusSelector;

