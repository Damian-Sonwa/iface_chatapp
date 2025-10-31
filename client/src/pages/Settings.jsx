import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Phone, Check, X, Key, Loader2, AlertCircle, User, Bell, Eye, Palette, Globe, Info, Save, Edit2, Camera, Lock, Settings as SettingsIcon, ChevronRight, Moon, Sun, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import UserProfile from '../components/UserProfile';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [twoFactorMethod, setTwoFactorMethod] = useState('email');
  const [verificationCode, setVerificationCode] = useState('');
  const [setupStep, setSetupStep] = useState('none');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [fontFamily, setFontFamily] = useState('Poppins');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    soundEnabled: true,
    messageAnimations: true,
    notificationsEnabled: true
  });
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Key },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    { id: 'about', label: 'About', icon: Info },
  ];

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await api.get('/users/preferences');
        if (response.data.preferences) {
          setPreferences(prev => ({
            soundEnabled: true,
            messageAnimations: true,
            notificationsEnabled: true,
            ...response.data.preferences
          }));
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };
    loadPreferences();
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
      setDarkMode(false);
    }
  };

  const handleFontChange = (font) => {
    setFontFamily(font);
    document.documentElement.style.setProperty('--font-primary', font);
    localStorage.setItem('fontFamily', font);
  };

  const handleEnable2FA = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const method = twoFactorMethod === 'phone' ? 'phone' : 'email';
      const response = await api.post('/auth/2fa/setup', { method });

      setMessage(
        twoFactorMethod === 'email'
          ? `Verification code sent to ${user?.email}. Please check your email.`
          : `Verification code sent to ${user?.phoneNumber || 'your phone'}. Please check your messages.`
      );
      setSetupStep('verify');
      setCountdown(60);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to enable 2FA');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/2fa/verify', {
        code: verificationCode,
        method: twoFactorMethod
      });

      setTwoFactorEnabled(true);
      setSetupStep('enabled');
      setMessage('Two-factor authentication enabled successfully!');
      setVerificationCode('');
      window.location.reload();
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      await api.post('/auth/2fa/disable', {
        code: verificationCode || undefined
      });

      if (!verificationCode) {
        const method = twoFactorMethod;
        await api.post('/auth/2fa/send-code', { method });
        setMessage(
          method === 'email'
            ? `Verification code sent to ${user?.email}. Enter it to disable 2FA.`
            : `Verification code sent to ${user?.phoneNumber || 'your phone'}. Enter it to disable 2FA.`
        );
        setCountdown(60);
        setLoading(false);
        return;
      }

      setTwoFactorEnabled(false);
      setSetupStep('none');
      setMessage('Two-factor authentication disabled successfully');
      setVerificationCode('');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to disable 2FA');
      if (error.response?.data?.requiresCode && !verificationCode) {
        setMessage('Please enter verification code to disable 2FA');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setError('');
    setLoading(true);

    try {
      const method = twoFactorMethod;
      await api.post('/auth/2fa/send-code', { method });
      setMessage(
        method === 'email'
          ? `New verification code sent to ${user?.email}`
          : `New verification code sent to ${user?.phoneNumber || 'your phone'}`
      );
      setCountdown(60);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSetup = () => {
    if (!user?.email && !user?.phoneNumber) {
      setError('Please add an email or phone number to your account first');
      return;
    }

    if (twoFactorMethod === 'phone' && !user?.phoneNumber) {
      setError('Please add a phone number to your account to use SMS 2FA');
      return;
    }

    setError('');
    setMessage('');
    setSetupStep('setup');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900" style={{ fontFamily: fontFamily === 'Poppins' ? "'Poppins', sans-serif" : "'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100"
          style={{ fontWeight: 700 }}
        >
          Settings
        </motion.h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-64 flex-shrink-0"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium" style={{ fontWeight: isActive ? 600 : 500 }}>
                      {section.label}
                    </span>
                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${isActive ? 'rotate-90' : ''}`} />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8"
              >
                {/* Profile Section */}
                {activeSection === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100" style={{ fontWeight: 600, color: '#FF7A00' }}>
                        Profile Settings
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400">Manage your profile information</p>
                    </div>

                    <div className="flex items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold text-3xl relative overflow-hidden group">
                          {user?.avatar ? (
                            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            user?.username?.charAt(0).toUpperCase() || 'U'
                          )}
                          <button
                            onClick={() => setShowProfileEdit(true)}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition"
                          >
                            <Camera className="w-6 h-6 text-white" />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1" style={{ fontWeight: 600 }}>
                          {user?.username || 'User'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-3">{user?.email}</p>
                        <motion.button
                          onClick={() => setShowProfileEdit(true)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition shadow-lg shadow-orange-500/30 flex items-center gap-2"
                          style={{ fontWeight: 500 }}
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </motion.button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block" style={{ fontWeight: 500 }}>
                          Bio
                        </label>
                        <p className="text-gray-600 dark:text-gray-400">{user?.bio || 'No bio set'}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block" style={{ fontWeight: 500 }}>
                            Phone Number
                          </label>
                          <p className="text-gray-600 dark:text-gray-400">{user?.phoneNumber || 'Not set'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block" style={{ fontWeight: 500 }}>
                            Status
                          </label>
                          <p className="text-gray-600 dark:text-gray-400 capitalize">{user?.status || 'offline'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Section */}
                {activeSection === 'account' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100" style={{ fontWeight: 600, color: '#FF7A00' }}>
                        Account Security
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400">Manage your account security settings</p>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100" style={{ fontWeight: 600 }}>
                              Two-Factor Authentication
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {twoFactorEnabled ? (
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
                              <Check className="w-4 h-4 inline mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium">
                              <X className="w-4 h-4 inline mr-1" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400"
                        >
                          <AlertCircle className="w-5 h-5" />
                          <span>{error}</span>
                        </motion.div>
                      )}

                      {message && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400"
                        >
                          {message}
                        </motion.div>
                      )}

                      {setupStep === 'none' && !twoFactorEnabled && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block" style={{ fontWeight: 500 }}>
                              Choose verification method:
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                              <motion.button
                                onClick={() => setTwoFactorMethod('email')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={!user?.email}
                                className={`p-4 rounded-xl border-2 transition ${
                                  twoFactorMethod === 'email'
                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                                } ${!user?.email ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <Mail className="w-6 h-6 mb-2 mx-auto text-orange-500" />
                                <div className="font-medium text-gray-900 dark:text-gray-100" style={{ fontWeight: 500 }}>
                                  Email
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {user?.email || 'Email not set'}
                                </div>
                              </motion.button>

                              <motion.button
                                onClick={() => setTwoFactorMethod('phone')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={!user?.phoneNumber}
                                className={`p-4 rounded-xl border-2 transition ${
                                  twoFactorMethod === 'phone'
                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                                } ${!user?.phoneNumber ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <Phone className="w-6 h-6 mb-2 mx-auto text-orange-500" />
                                <div className="font-medium text-gray-900 dark:text-gray-100" style={{ fontWeight: 500 }}>
                                  Phone
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {user?.phoneNumber || 'Phone not set'}
                                </div>
                              </motion.button>
                            </div>
                          </div>

                          <motion.button
                            onClick={handleStartSetup}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading || (!user?.email && !user?.phoneNumber) || (twoFactorMethod === 'phone' && !user?.phoneNumber)}
                            className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg shadow-orange-500/30"
                            style={{ fontWeight: 600 }}
                          >
                            <Shield className="w-5 h-5" />
                            Enable Two-Factor Authentication
                          </motion.button>
                        </div>
                      )}

                      {(setupStep === 'setup' || setupStep === 'verify') && !twoFactorEnabled && (
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                              {twoFactorMethod === 'email'
                                ? `We've sent a 6-digit verification code to ${user?.email}. Please enter it below.`
                                : `We've sent a 6-digit verification code to ${user?.phoneNumber || 'your phone'}. Please enter it below.`}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block" style={{ fontWeight: 500 }}>
                              Verification Code
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                              placeholder="000000"
                              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-gray-100 text-center text-2xl tracking-widest"
                            />
                          </div>

                          <div className="flex gap-2">
                            <motion.button
                              onClick={handleVerifyCode}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              disabled={loading || verificationCode.length !== 6}
                              className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg shadow-orange-500/30"
                              style={{ fontWeight: 600 }}
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <Check className="w-5 h-5" />
                                  Verify & Enable
                                </>
                              )}
                            </motion.button>
                            <motion.button
                              onClick={handleResendCode}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              disabled={countdown > 0 || loading}
                              className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ fontWeight: 500 }}
                            >
                              {countdown > 0 ? `Resend (${countdown}s)` : 'Resend'}
                            </motion.button>
                            <motion.button
                              onClick={() => {
                                setSetupStep('none');
                                setVerificationCode('');
                                setError('');
                                setMessage('');
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                              style={{ fontWeight: 500 }}
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </div>
                      )}

                      {twoFactorEnabled && setupStep === 'enabled' && (
                        <div className="space-y-4">
                          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                              Two-factor authentication is protecting your account. You'll need to verify your identity to disable it.
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block" style={{ fontWeight: 500 }}>
                              Verification Code (to disable)
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                              placeholder="Enter code to disable"
                              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-gray-100 text-center text-2xl tracking-widest"
                            />
                          </div>

                          <motion.button
                            onClick={handleDisable2FA}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                            style={{ fontWeight: 600 }}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <X className="w-5 h-5" />
                                Disable Two-Factor Authentication
                              </>
                            )}
                          </motion.button>
                        </div>
                      )}
                    </div>

                    {/* Change Password */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                      <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100" style={{ fontWeight: 600 }}>
                        Change Password
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Update your password to keep your account secure.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition shadow-lg shadow-orange-500/30 flex items-center gap-2"
                        style={{ fontWeight: 500 }}
                      >
                        <Lock className="w-4 h-4" />
                        Change Password
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Appearance Section */}
                {activeSection === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100" style={{ fontWeight: 600, color: '#FF7A00' }}>
                        Appearance
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400">Customize how the app looks and feels</p>
                    </div>

                    {/* Theme Selection */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                      <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100" style={{ fontWeight: 600 }}>
                        Theme
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'light', icon: Sun, label: 'Light' },
                          { value: 'dark', icon: Moon, label: 'Dark' },
                          { value: 'system', icon: Monitor, label: 'System' },
                        ].map((option) => {
                          const Icon = option.icon;
                          const isActive = theme === option.value;
                          return (
                            <motion.button
                              key={option.value}
                              onClick={() => handleThemeChange(option.value)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`p-4 rounded-xl border-2 transition ${
                                isActive
                                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                              }`}
                            >
                              <Icon className="w-6 h-6 mb-2 mx-auto text-orange-500" />
                              <div className="font-medium text-gray-900 dark:text-gray-100" style={{ fontWeight: 500 }}>
                                {option.label}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Font Selection */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                      <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100" style={{ fontWeight: 600 }}>
                        Font Family
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {['Poppins', 'Inter'].map((font) => {
                          const isActive = fontFamily === font;
                          return (
                            <motion.button
                              key={font}
                              onClick={() => handleFontChange(font)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-4 rounded-xl border-2 transition text-left ${
                                isActive
                                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                              }`}
                              style={{ fontFamily: font === 'Poppins' ? "'Poppins', sans-serif" : "'Inter', sans-serif" }}
                            >
                              <div className="font-medium text-gray-900 dark:text-gray-100 mb-2" style={{ fontWeight: 500 }}>
                                {font}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {font === 'Poppins' ? 'Modern and friendly' : 'Crisp and readable'}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Theme Preview */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                      <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100" style={{ fontWeight: 600 }}>
                        Preview
                      </h3>
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
                            U
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100" style={{ fontWeight: 600 }}>
                              Username
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Online</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="bg-orange-500 text-white rounded-lg rounded-tr-sm px-4 py-2 max-w-[80%] ml-auto shadow-lg shadow-orange-500/30">
                            <p style={{ fontWeight: 400 }}>Your message here</p>
                          </div>
                          <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg rounded-tl-sm px-4 py-2 max-w-[80%] shadow-lg">
                            <p style={{ fontWeight: 400 }}>Friend's message</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Section */}
                {activeSection === 'preferences' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100" style={{ fontWeight: 600, color: '#FF7A00' }}>
                        App Preferences
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400">Customize your app experience</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: 'Sound Notifications', icon: Bell, enabled: true },
                        { label: 'Message Animations', icon: Eye, enabled: true },
                        { label: 'Enable Notifications', icon: Bell, enabled: true },
                      ].map((pref) => {
                        // Convert old format to new format
                        const prefKey = pref.label === 'Sound Notifications' ? 'soundEnabled' 
                                      : pref.label === 'Message Animations' ? 'messageAnimations'
                                      : pref.label === 'Enable Notifications' ? 'notificationsEnabled' : null;
                        
                        if (!prefKey) return null; // Skip if not a valid preference
                        
                        const Icon = pref.icon;
                        const handleToggle = async () => {
                          const newValue = !preferences[prefKey];
                          setPreferences(prev => ({ ...prev, [prefKey]: newValue }));
                          
                          try {
                            setPreferencesLoading(true);
                            await api.patch('/users/preferences', { [prefKey]: newValue });
                          } catch (error) {
                            console.error('Failed to update preference:', error);
                            // Revert on error
                            setPreferences(prev => ({ ...prev, [prefKey]: !newValue }));
                            alert('Failed to update preference. Please try again.');
                          } finally {
                            setPreferencesLoading(false);
                          }
                        };
                        
                        return (
                          <div key={pref.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-orange-500" />
                              <span className="font-medium text-gray-900 dark:text-gray-100" style={{ fontWeight: 500 }}>
                                {pref.label}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleToggle}
                              disabled={preferencesLoading}
                              className={`relative w-12 h-6 rounded-full transition ${
                                preferences[prefKey] ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                              } ${preferencesLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <motion.div
                                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg"
                                animate={{ x: preferences[prefKey] ? 24 : 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                      <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100" style={{ fontWeight: 600 }}>
                        Reset to Defaults
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Reset all preferences to their default values.
                      </p>
                      <motion.button
                        onClick={async () => {
                          if (!window.confirm('Are you sure you want to reset all preferences to defaults?')) {
                            return;
                          }
                          
                          try {
                            setPreferencesLoading(true);
                            const response = await api.post('/users/preferences/reset');
                            setPreferences({
                              soundEnabled: true,
                              messageAnimations: true,
                              notificationsEnabled: true,
                              ...(response.data.preferences || {})
                            });
                            alert('Preferences reset successfully!');
                          } catch (error) {
                            console.error('Failed to reset preferences:', error);
                            alert('Failed to reset preferences. Please try again.');
                          } finally {
                            setPreferencesLoading(false);
                          }
                        }}
                        disabled={preferencesLoading}
                        whileHover={{ scale: preferencesLoading ? 1 : 1.02 }}
                        whileTap={{ scale: preferencesLoading ? 1 : 0.98 }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        style={{ fontWeight: 500 }}
                      >
                        {preferencesLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          'Reset All Preferences'
                        )}
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* About Section */}
                {activeSection === 'about' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100" style={{ fontWeight: 600, color: '#FF7A00' }}>
                        About & Support
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400">App information and support resources</p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                        <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100" style={{ fontWeight: 600 }}>
                          App Version
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">Chaturway v1.0.0</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-orange-500 transition text-left"
                        >
                          <h4 className="font-semibold mb-1 text-gray-900 dark:text-gray-100" style={{ fontWeight: 600 }}>
                            Contact Support
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Get help from our support team</p>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-orange-500 transition text-left"
                        >
                          <h4 className="font-semibold mb-1 text-gray-900 dark:text-gray-100" style={{ fontWeight: 600 }}>
                            Terms & Privacy
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">View terms and privacy policy</p>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <UserProfile
          user={user}
          onClose={() => setShowProfileEdit(false)}
          onUpdate={(updatedUser) => {
            setShowProfileEdit(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default Settings;
