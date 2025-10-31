import { motion } from 'framer-motion';

const FEATURES = [
  { key: 'friends', label: 'Friends', action: { type: 'panel', value: 'friends' } },
  { key: 'invites', label: 'Invites', action: { type: 'panel', value: 'invites' } },
  { key: 'moments', label: 'Moments', action: { type: 'panel', value: 'moments' } },
  { key: 'assistant', label: 'AI Assistant', action: { type: 'panel', value: 'assistant' } },
  { key: 'all-users', label: 'All Users', action: { type: 'view', value: 'users' } },
  { key: 'groups', label: 'Groups', action: { type: 'view', value: 'rooms' } },
  { key: 'create-group', label: 'Create Group', action: { type: 'create_room' } },
  { key: 'create-poll', label: 'Create Poll', action: { type: 'create_poll' } },
  { key: 'settings', label: 'Settings', action: { type: 'route', value: '/settings' } },
];

const SidebarQuickSearch = ({ query, onSelect }) => {
  if (!query) return null;
  const q = query.toLowerCase();
  const results = FEATURES.filter(f => f.label.toLowerCase().includes(q));
  if (results.length === 0) return null;
  return (
    <div className="mt-2 bg-white/80 dark:bg-gray-800/80 border border-white/20 rounded-xl overflow-hidden shadow-xl">
      {results.map(item => (
        <motion.button
          key={item.key}
          onClick={() => onSelect?.(item)}
          whileHover={{ backgroundColor: 'rgba(255,122,0,0.08)' }}
          className="w-full text-left px-3 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-purple-500/10"
        >
          {item.label}
        </motion.button>
      ))}
    </div>
  );
};

export default SidebarQuickSearch;





