import { useMemo, useState } from 'react';
import { X } from 'lucide-react';

const StatusBar = ({ users = [] }) => {
  const [viewer, setViewer] = useState(null);

  const statuses = useMemo(() => {
    return users
      .filter(u => (u.statusPhoto && typeof u.statusPhoto === 'string') || (u.statusText && u.statusText.trim()))
      .map(u => ({
        id: u._id || u.id,
        username: u.username,
        avatar: u.avatar,
        photo: u.statusPhoto || null,
        text: u.statusText || '',
        updatedAt: u.statusUpdatedAt || null
      }));
  }, [users]);

  if (statuses.length === 0) return null;

  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
        {statuses.map(s => (
          <button
            key={s.id}
            onClick={() => setViewer(s)}
            className="flex-shrink-0 flex flex-col items-center gap-2 group"
            title={s.username}
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full ring-2 ring-orange-400/70 ring-offset-2 ring-offset-transparent overflow-hidden">
                {s.photo ? (
                  <img src={s.photo} alt={s.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold">
                    {s.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-700 dark:text-gray-300 max-w-[70px] truncate">
              {s.username}
            </div>
          </button>
        ))}
      </div>

      {viewer && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setViewer(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
              <div className="font-semibold">{viewer.username}</div>
              <button onClick={() => setViewer(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-2">
              {viewer.photo ? (
                <img src={viewer.photo} alt={viewer.username} className="w-full h-80 object-cover rounded-lg" />
              ) : null}
              {viewer.text ? (
                <div className="text-sm text-gray-700 dark:text-gray-300">{viewer.text}</div>
              ) : null}
              {viewer.updatedAt ? (
                <div className="text-xs text-gray-400">Updated {new Date(viewer.updatedAt).toLocaleString()}</div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusBar;







