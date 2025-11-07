import { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, X, Image, File, Loader2, Mic, Square, Reply, X as XIcon, Clock, Bot } from 'lucide-react';
import { EmojiButton } from '@joeattardi/emoji-button';
import { getSocket } from '../utils/socket';
import api from '../utils/api';
import { compressImage } from '../utils/imageCompression';
import { motion, AnimatePresence } from 'framer-motion';

const MessageInput = ({ onSend, onTypingStart, onTypingStop, replyingTo, onCancelReply, suggestedReply, onShareMomentFromAI }) => {
  const [message, setMessage] = useState('');
  
  // Handle suggested reply insertion
  useEffect(() => {
    if (suggestedReply) {
      setMessage(suggestedReply);
      // Clear suggestion after using it
      if (onCancelReply) {
        setTimeout(() => onCancelReply(), 100);
      }
    }
  }, [suggestedReply]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [disappearingAfter, setDisappearingAfter] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggested, setAiSuggested] = useState(false);
  const [dictating, setDictating] = useState(false);
  const recognitionRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const pickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingTimeRef = useRef(0);

  useEffect(() => {
    if (emojiButtonRef.current && !pickerRef.current) {
      pickerRef.current = new EmojiButton({
        position: 'top-start',
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      });

      pickerRef.current.on('emoji', (selection) => {
        setMessage(prev => prev + selection.emoji);
        if (pickerRef.current) {
          pickerRef.current.hidePicker();
        }
        setShowEmojiPicker(false);
      });
    }

    return () => {
      if (pickerRef.current) {
        try {
          if (typeof pickerRef.current.hidePicker === 'function') {
            pickerRef.current.hidePicker();
          }
          if (typeof pickerRef.current.destroy === 'function') {
            pickerRef.current.destroy();
          }
        } catch (error) {
          console.warn('Emoji picker cleanup error:', error);
        }
        pickerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      if (pickerRef.current && typeof pickerRef.current.setTheme === 'function') {
        try {
          const isDark = document.documentElement.classList.contains('dark');
          pickerRef.current.setTheme(isDark ? 'dark' : 'light');
        } catch (error) {
          console.warn('Failed to set emoji picker theme:', error);
        }
      }
    };

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      audioRecorderRef.current = mediaRecorder;
      setRecording(true);
      setRecordingTime(0);

      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      recordingTimerRef.current = timer;
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (audioRecorderRef.current && recording) {
      audioRecorderRef.current.stop();
      setRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
    }
    setRecording(false);
    setAudioBlob(null);
    setRecordingTime(0);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    const now = Date.now();
    if (now - lastTypingTimeRef.current > 2000) {
      onTypingStart?.();
      lastTypingTimeRef.current = now;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop?.();
    }, 1000);
  };

  const askAI = async () => {
    const prompt = message.trim() || 'Suggest a helpful reply for a friendly chat.';
    setAiLoading(true);
    try {
      const res = await api.post('/ai', { prompt });
      const text = res.data?.text || '';
      if (text) {
        setMessage(text);
        setAiSuggested(true);
      }
    } catch (e) {
      alert('AI request failed');
    } finally {
      setAiLoading(false);
    }
  };

  // Voice typing using Web Speech API
  const toggleDictation = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Voice typing is not supported in this browser.');
        return;
      }
      if (!recognitionRef.current) {
        const rec = new SpeechRecognition();
        rec.lang = 'en-US';
        rec.interimResults = true;
        rec.continuous = true;
        rec.onresult = (e) => {
          let transcript = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            transcript += e.results[i][0].transcript;
          }
          setMessage(prev => (prev ? prev + ' ' : '') + transcript.trim());
        };
        rec.onend = () => setDictating(false);
        recognitionRef.current = rec;
      }
      if (dictating) {
        recognitionRef.current.stop();
        setDictating(false);
      } else {
        recognitionRef.current.start();
        setDictating(true);
      }
    } catch (err) {
      console.warn('Dictation error:', err);
      setDictating(false);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const otherFiles = files.filter(file => !file.type.startsWith('image/'));

    // Compress images before adding
    const compressedImages = await Promise.all(
      imageFiles.map(async (file) => {
        try {
          const compressed = await compressImage(file);
          return { file: compressed, original: file };
        } catch (error) {
          console.warn('Compression failed, using original:', error);
          return { file, original: file };
        }
      })
    );

    const allFiles = [
      ...compressedImages.map(item => item.file),
      ...otherFiles
    ].slice(0, 5 - selectedFiles.length);

    const newFiles = allFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      uploading: false,
      uploaded: false
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (id) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0 && !audioBlob) return [];

    setUploading(true);
    const uploadPromises = [];

    // Upload regular files
    selectedFiles.forEach(async (fileObj) => {
      const formData = new FormData();
      formData.append('file', fileObj.file);

      uploadPromises.push(
        api.post('/upload/file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }).then(response => {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const baseUrl = API_URL.replace('/api', '');
          return {
            url: `${baseUrl}${response.data.file.url}`,
            filename: response.data.file.filename,
            mimetype: response.data.file.mimetype
          };
        }).catch(() => null)
      );
    });

    // Upload audio
    if (audioBlob) {
      const audioFormData = new FormData();
      const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
      audioFormData.append('file', audioFile);

      uploadPromises.push(
        api.post('/upload/file', audioFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }).then(response => {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const baseUrl = API_URL.replace('/api', '');
          return {
            url: `${baseUrl}${response.data.file.url}`,
            filename: response.data.file.filename,
            mimetype: 'audio/webm'
          };
        }).catch(() => null)
      );
    }

    const uploadedFiles = await Promise.all(uploadPromises);
    setUploading(false);
    return uploadedFiles.filter(f => f !== null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && selectedFiles.length === 0 && !audioBlob) return;
    try {
      setUploading(true);
      const attachments = await uploadFiles();
      let messageType = 'text';
      if (attachments.length > 0) {
        if (attachments[0].mimetype.startsWith('image/')) {
          messageType = 'image';
        } else if (attachments[0].mimetype.startsWith('audio/')) {
          messageType = 'audio';
        } else {
          messageType = 'file';
        }
      }
      const replyToId = replyingTo?._id || replyingTo?.id || null;
      onSend(
        message.trim() || (audioBlob ? '🎤 Voice message' : '📎 Shared file'),
        messageType,
        attachments,
        replyToId,
        disappearingAfter
      );
      setMessage('');
      setSelectedFiles([]);
      setAudioBlob(null);
      setDisappearingAfter(null);
      onCancelReply?.();
      onTypingStop?.();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (err) {
      console.error('Send failed:', err);
      alert('Failed to send message.');
    } finally {
      setUploading(false);
    }
  };

  const toggleEmojiPicker = () => {
    if (!pickerRef.current || !emojiButtonRef.current) return;
    
    try {
      if (showEmojiPicker) {
        if (typeof pickerRef.current.hidePicker === 'function') {
          pickerRef.current.hidePicker();
        }
      } else {
        if (typeof pickerRef.current.showPicker === 'function') {
          pickerRef.current.showPicker(emojiButtonRef.current);
        }
      }
      setShowEmojiPicker(!showEmojiPicker);
    } catch (error) {
      console.warn('Emoji picker error:', error);
    }
  };

  return (
    <div className="relative z-10 border-t border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 backdrop-blur-xl safe-area-inset-bottom">
      {/* Reply preview */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pt-2 pb-1 bg-purple-500/10 backdrop-blur-sm border-b border-purple-500/20 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Reply className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-purple-300">
                  Replying to {replyingTo.sender?.username || 'User'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
                  {replyingTo.content?.substring(0, 50)}...
                </div>
              </div>
            </div>
            <button
              onClick={onCancelReply}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition flex-shrink-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording UI */}
      <AnimatePresence>
        {recording && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 bg-red-500/20 backdrop-blur-sm border-b border-red-500/30 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-3 h-3 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-sm font-medium text-red-300">
                Recording: {formatRecordingTime(recordingTime)}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={cancelRecording}
                className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 backdrop-blur-sm border border-gray-200 dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={stopRecording}
                className="px-3 py-1 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/50"
              >
                Stop
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio preview */}
      {audioBlob && !recording && (
        <div className="px-4 pt-2 pb-1 bg-blue-500/10 backdrop-blur-sm border-b border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">Voice message ready</span>
          </div>
          <button
            onClick={() => setAudioBlob(null)}
            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* File previews */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 flex gap-2 overflow-x-auto"
          >
            {selectedFiles.map((fileObj) => (
              <motion.div
                key={fileObj.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative flex-shrink-0"
              >
                {fileObj.preview ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                    <img
                      src={fileObj.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFile(fileObj.id)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="relative w-20 h-20 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex flex-col items-center justify-center p-2">
                    <File className="w-6 h-6 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-center">
                      {fileObj.file.name.length > 8 ? fileObj.file.name.substring(0, 8) + '...' : fileObj.file.name}
                    </p>
                    <button
                      onClick={() => removeFile(fileObj.id)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-2 sm:p-4 pb-safe">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {/* Main input row - always visible */}
          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <motion.button
              type="button"
              onClick={toggleEmojiPicker}
              ref={emojiButtonRef}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 sm:p-3 rounded-xl bg-gray-100 dark:bg-gray-700 backdrop-blur-sm border border-gray-200 dark:border-gray-600 hover:border-purple-500 transition text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 shadow-lg flex-shrink-0"
            >
              <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            <div className="flex-1 relative min-w-0">
              <textarea
                value={message}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={replyingTo ? `Reply to ${replyingTo.sender?.username}...` : "Type a message..."}
                rows={1}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none max-h-32 overflow-y-auto transition-all shadow-lg text-sm sm:text-base"
                style={{ minHeight: '44px' }}
                disabled={uploading || recording}
              />
            </div>

            {/* Send button - always visible on mobile */}
            <motion.button
              type="submit"
              disabled={(!message.trim() && selectedFiles.length === 0 && !audioBlob) || uploading || recording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-400 hover:to-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50 relative overflow-hidden group flex-shrink-0"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin relative z-10" />
              ) : (
                <Send className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
              )}
            </motion.button>
          </div>

          {/* Toolbar row - scrollable on mobile, compact */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-hide">
            <button
              type="button"
              onClick={askAI}
              disabled={aiLoading}
              className="p-2 sm:p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition text-gray-300 hover:text-white disabled:opacity-50 shadow-lg flex items-center gap-1 flex-shrink-0"
              title="Ask AI"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            
            {/* Disappearing message toggle */}
            <motion.div 
              className="relative group flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                type="button"
                onClick={() => setDisappearingAfter(disappearingAfter ? null : 24)}
                className={`p-2 sm:p-3 rounded-xl backdrop-blur-sm border transition ${
                  disappearingAfter
                    ? 'bg-purple-500/30 border-purple-400/50 text-purple-700 dark:text-purple-200 shadow-lg shadow-purple-500/30'
                    : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-500'
                }`}
                title="Disappearing message (24h)"
              >
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              {disappearingAfter && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-purple-400/50 hidden sm:block">
                  24h
                </span>
              )}
            </motion.div>

            {/* Voice note button */}
            {!recording ? (
              <motion.button
                type="button"
                onClick={startRecording}
                disabled={uploading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 sm:p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition text-gray-300 hover:text-white disabled:opacity-50 shadow-lg flex-shrink-0"
                title="Record voice message"
              >
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={stopRecording}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 sm:p-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition shadow-lg shadow-red-500/50 flex-shrink-0"
                title="Stop recording"
              >
                <Square className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            )}

            <motion.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || selectedFiles.length >= 5}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 sm:p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition text-gray-300 hover:text-white disabled:opacity-50 shadow-lg flex-shrink-0"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            {/* Voice typing (speech-to-text) - hide on very small screens */}
            <motion.button
              type="button"
              onClick={toggleDictation}
              disabled={uploading || recording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`hidden xs:flex p-2 sm:p-3 rounded-xl ${dictating ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300 hover:text-white'} backdrop-blur-sm border border-white/20 hover:bg-white/20 transition disabled:opacity-50 shadow-lg flex-shrink-0`}
              title="Voice typing"
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            {aiSuggested && (
              <motion.button
                type="button"
                onClick={() => onShareMomentFromAI?.(message)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-2 sm:px-3 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 text-xs shadow-lg flex-shrink-0 whitespace-nowrap"
              >
                Share as Moment
              </motion.button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
