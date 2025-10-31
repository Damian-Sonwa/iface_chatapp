import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Copy, Link as LinkIcon, Check } from 'lucide-react';
import api from '../utils/api';

const Invites = () => {
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviter, setInviter] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/invite/create');
      setLink(res.data.link);
      setInviter(res.data.inviter);
      setCopied(false);
    } catch (e) {
      console.error('Invite create failed:', e);
      alert('Failed to create invite link.');
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert('Copy failed.');
    }
  };

  return (
    <div className="rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white via-orange-50/40 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex items-center gap-3 mb-4">
        <LinkIcon className="w-5 h-5 text-purple-500" />
        <h2 className="text-xl font-semibold">Invite Friends</h2>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Generate a unique link and share it. New users will see you as their inviter.</p>

      <motion.button
        onClick={generate}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-60"
      >
        {loading ? 'Generating…' : 'Generate Invite Link'}
      </motion.button>

      {link && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your invite link</div>
          <div className="flex items-center gap-2">
            <input readOnly value={link} className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100" />
            <motion.button onClick={copy} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`px-3 py-2 rounded-lg border ${copied ? 'bg-green-500 text-white border-green-600' : 'bg-white/10 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200'}`}>
              {copied ? <><Check className="w-4 h-4 inline" /> Copied</> : <><Copy className="w-4 h-4 inline" /> Copy</>}
            </motion.button>
          </div>
          <div className="mt-2 text-xs text-gray-500">Inviter: {inviter}</div>
        </motion.div>
      )}
    </div>
  );
};

export default Invites;







