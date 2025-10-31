import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const PollModal = ({ open, onClose, roomId, onCreated }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  const create = async () => {
    if (!question.trim() || options.filter(o => o.trim()).length < 2) return;
    setLoading(true);
    try {
      const res = await api.post('/polls', { roomId, question, options });
      onCreated?.(res.data.poll);
      onClose?.();
    } catch {
      alert('Failed to create poll');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-4" onClick={(e)=>e.stopPropagation()}>
        <div className="text-lg font-semibold mb-3">Create Poll</div>
        <input value={question} onChange={(e)=>setQuestion(e.target.value)} placeholder="Question" className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-2" />
        {options.map((opt, i) => (
          <input key={i} value={opt} onChange={(e)=>{
            const arr=[...options]; arr[i]=e.target.value; setOptions(arr);
          }} placeholder={`Option ${i+1}`} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-2" />
        ))}
        <div className="flex gap-2 mt-2">
          <button onClick={()=>setOptions([...options,''])} className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">Add option</button>
          <button onClick={create} disabled={loading} className="ml-auto px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600">{loading?'Creating...':'Create'}</button>
        </div>
      </motion.div>
    </div>
  );
};

export default PollModal;




