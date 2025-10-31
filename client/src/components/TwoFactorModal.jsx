import { useState, useEffect } from 'react';
import { Shield, Mail, Phone, X, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';

// TwoFactorModal for login flow - can be used without auth

const TwoFactorModal = ({ isOpen, onClose, onVerify, method, email, phoneNumber }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      onVerify(code);
    } catch (error) {
      setError(error.response?.data?.error || 'Verification failed');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setError('');
    setResending(true);

    try {
      await api.post('/auth/2fa/send-code', { 
        method,
        ...(email && { email }) 
      });
      setCountdown(60);
      setError('');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold">Two-Factor Authentication</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
              {method === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
              <span>
                A 6-digit verification code has been sent to{' '}
                <strong>{method === 'email' ? email : phoneNumber}</strong>
              </span>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                autoFocus
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-gray-100 text-center text-2xl tracking-widest"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Login'
                )}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || resending}
                className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : countdown > 0 ? (
                  `${countdown}s`
                ) : (
                  'Resend'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default TwoFactorModal;

