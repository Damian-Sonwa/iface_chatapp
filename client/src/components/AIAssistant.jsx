import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot } from 'lucide-react';
import api from '../utils/api';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are a helpful assistant embedded in a chat app.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/ai/assistant', { messages: next });
      if (res.data?.reply) {
        setMessages(prev => [...prev, res.data.reply]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had an issue responding.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-5 h-5 text-orange-500" />
        <h2 className="text-xl font-semibold">AI Assistant</h2>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.filter(m => m.role !== 'system').map((m, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`max-w-[80%] px-4 py-2 rounded-xl ${m.role==='user' ? 'ml-auto bg-orange-500 text-white rounded-tr-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-sm'}`}> 
            {m.content}
          </motion.div>
        ))}
        {loading && (
          <div className="text-sm text-gray-500">Thinking…</div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') send(); }} placeholder="Ask me anything…" className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
        <motion.button onClick={send} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={loading || !input.trim()} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-60 flex items-center gap-2">
          <Send className="w-4 h-4" />
          Send
        </motion.button>
      </div>
    </div>
  );
};

export default AIAssistant;






