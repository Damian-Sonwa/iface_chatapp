import { useEffect, useRef, useState } from 'react';
import { X, Image, Video, FileIcon, Type, Music, Upload, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const gradients = [
  'linear-gradient(135deg,#8B5CF6,#E9D5FF)',
  'linear-gradient(135deg,#ff9a9e,#fad0c4)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#f6d365,#fda085)'
];

const MomentsComposer = ({ open, onClose, onPosted, initialText = '' }) => {
  const [tab, setTab] = useState('text'); // text | upload | capture
  const [text, setText] = useState(initialText || '');
  const [gradient, setGradient] = useState(gradients[0]);
  const [file, setFile] = useState(null);
  const [posting, setPosting] = useState(false);
  const [privacy, setPrivacy] = useState('friends');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (open && tab === 'capture') {
      (async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
          streamRef.current = stream;
        } catch (e) {
          alert('Camera permission needed');
        }
      })();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [open, tab]);

  const postText = async () => {
    setPosting(true);
    try {
      const res = await api.post('/moments', { type: 'text', text, gradient, privacy });
      onPosted?.(res.data.moment);
      onClose?.();
    } catch (e) {
      alert('Failed to post');
    } finally { setPosting(false); }
  };

  const postFile = async () => {
    if (!file) return;
    setPosting(true);
    try {
      const form = new FormData();
      form.append('media', file);
      form.append('type', file.type.startsWith('image/') ? 'photo' : file.type.startsWith('video/') ? 'video' : 'file');
      form.append('privacy', privacy);
      const res = await api.post('/moments', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      onPosted?.(res.data.moment);
      onClose?.();
    } catch (e) { alert('Failed to upload'); } finally { setPosting(false); }
  };

  const captureAndPost = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const fileObj = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      setFile(fileObj);
      await postFile();
    }, 'image/jpeg', 0.9);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl w-full md:max-w-xl md:overflow-hidden max-h-[85vh] md:max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="font-semibold">Create Moment</div>
          <div className="flex items-center gap-2">
            <motion.button onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">Cancel</motion.button>
          </div>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto">
          <div className="flex gap-2">
            <button onClick={() => setTab('text')} className={`px-3 py-1.5 rounded-lg border ${tab==='text'?'bg-purple-500 text-white border-purple-600':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'}`}><Type className="w-4 h-4 inline mr-1" /> Text</button>
            <button onClick={() => setTab('upload')} className={`px-3 py-1.5 rounded-lg border ${tab==='upload'?'bg-purple-500 text-white border-purple-600':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'}`}><Upload className="w-4 h-4 inline mr-1" /> Upload</button>
            <button onClick={() => setTab('capture')} className={`px-3 py-1.5 rounded-lg border ${tab==='capture'?'bg-purple-500 text-white border-purple-600':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'}`}><Camera className="w-4 h-4 inline mr-1" /> Capture</button>
          </div>

          {tab === 'text' && (
            <div className="space-y-3">
              <div className="h-48 rounded-xl flex items-center justify-center text-xl font-semibold text-gray-900 dark:text-gray-100" style={{ background: gradient }}>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="What's on your mind?" className="bg-transparent text-center outline-none w-5/6" />
              </div>
              <div className="flex gap-2">
                {gradients.map(g => (
                  <button key={g} onClick={() => setGradient(g)} className={`w-10 h-10 rounded-lg border ${gradient===g?'border-purple-600':'border-gray-300 dark:border-gray-700'}`} style={{ background: g }} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-300">Visibility:</label>
                <select value={privacy} onChange={(e)=>setPrivacy(e.target.value)} className="px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm">
                  <option value="public">Public</option>
                  <option value="friends">Friends</option>
                  <option value="private">Only Me</option>
                </select>
              </div>
              <motion.button onClick={postText} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={posting || !text.trim()} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-60">Post</motion.button>
            </div>
          )}

          {tab === 'upload' && (
            <div className="space-y-3">
              <input type="file" accept="image/*,video/*,.pdf,.doc,.docx,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-300">Visibility:</label>
                <select value={privacy} onChange={(e)=>setPrivacy(e.target.value)} className="px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm">
                  <option value="public">Public</option>
                  <option value="friends">Friends</option>
                  <option value="private">Only Me</option>
                </select>
              </div>
              <motion.button onClick={postFile} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={posting || !file} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-60">Upload</motion.button>
            </div>
          )}

          {tab === 'capture' && (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden bg-black">
                <video ref={videoRef} className="w-full h-80 object-cover" playsInline muted />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-300">Visibility:</label>
                <select value={privacy} onChange={(e)=>setPrivacy(e.target.value)} className="px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm">
                  <option value="public">Public</option>
                  <option value="friends">Friends</option>
                  <option value="private">Only Me</option>
                </select>
              </div>
              <motion.button onClick={captureAndPost} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={posting} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-60">Capture & Post</motion.button>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900 z-10 flex justify-end gap-2">
          <motion.button onClick={onClose} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">Close</motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default MomentsComposer;


