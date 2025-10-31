import { useEffect, useRef, useState } from 'react';
import { X, Camera, RefreshCw, Upload, Type } from 'lucide-react';
import api from '../utils/api';

const CameraStatus = ({ open, onClose, onUpdated }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    const startCamera = async () => {
      if (!open) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        streamRef.current = stream;
      } catch (err) {
        console.error('Camera access error:', err);
        alert('Could not access camera. Please allow camera permission.');
        onClose?.();
      }
    };
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [open]);

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedDataUrl(dataUrl);
  };

  const retake = () => {
    setCapturedDataUrl(null);
  };

  const upload = async () => {
    if (!capturedDataUrl) return;
    setUploading(true);
    try {
      // Convert dataURL to Blob
      const res = await fetch(capturedDataUrl);
      const blob = await res.blob();
      const form = new FormData();
      form.append('status', blob, 'status.jpg');
      const uploadRes = await api.post('/upload/status', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (statusText && statusText.trim()) {
        await api.patch('/users/status-text', { statusText });
      }
      onUpdated?.(uploadRes.data);
      onClose?.();
    } catch (e) {
      console.error('Status upload failed:', e);
      alert('Failed to upload status.');
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
          <div className="font-semibold">Update Status</div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="relative rounded-lg overflow-hidden bg-black">
            {!capturedDataUrl ? (
              <video ref={videoRef} className="w-full h-64 object-cover" playsInline muted />
            ) : (
              <img src={capturedDataUrl} alt="Captured" className="w-full h-64 object-cover" />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <input
            type="text"
            placeholder="Say something about your status (optional)"
            value={statusText}
            onChange={(e) => setStatusText(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          />
          <div className="flex gap-2">
            {!capturedDataUrl ? (
              <button onClick={capture} className="flex-1 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 flex items-center justify-center gap-2"><Camera className="w-4 h-4" />Capture</button>
            ) : (
              <>
                <button onClick={retake} className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" />Retake</button>
                <button onClick={upload} disabled={uploading} className="flex-1 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-60 flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />{uploading ? 'Uploading...' : 'Post Status'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraStatus;







