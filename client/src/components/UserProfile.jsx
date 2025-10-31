import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Edit, Save, X, Camera, Palette, Zap, Loader2, ArrowLeft } from 'lucide-react';
import { vibes, themes, applyTheme } from '../utils/themes';
import { motion } from 'framer-motion';
import api from '../utils/api';
import CameraStatus from './CameraStatus';

const UserProfile = ({ user, onClose, onUpdate }) => {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [vibe, setVibe] = useState(user?.vibe || null);
  const [theme, setTheme] = useState(user?.theme || 'default');
  const [autoVibe, setAutoVibe] = useState(user?.autoVibe || false);
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'en');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [statusPhoto, setStatusPhoto] = useState(user?.statusPhoto || null);
  const [statusUpdatedAt, setStatusUpdatedAt] = useState(user?.statusUpdatedAt || null);
  const [statusText, setStatusText] = useState(user?.statusText || '');
  const [originalValues, setOriginalValues] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    vibe: user?.vibe || null,
    theme: user?.theme || 'default',
    autoVibe: user?.autoVibe || false,
    preferredLanguage: user?.preferredLanguage || 'en'
  });
  const fileInputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.patch('/users/profile', { 
        username, 
        bio,
        vibe,
        theme,
        autoVibe,
        preferredLanguage
      });
      
      // Update original values
      setOriginalValues({
        username,
        bio,
        vibe,
        theme,
        autoVibe,
        preferredLanguage
      });
      
      onUpdate?.(response.data.user);
      
      // Apply theme immediately
      const isDark = document.documentElement.classList.contains('dark');
      applyTheme(theme, isDark);
      
      setEditing(false);
      
      // Show success message
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      alert(error.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdated = (data) => {
    if (data?.user) {
      setStatusPhoto(data.user.statusPhoto || data.statusPhoto || null);
      setStatusUpdatedAt(data.user.statusUpdatedAt || data.statusUpdatedAt || new Date());
      onUpdate?.(data.user);
    }
  };

  const handleCancel = () => {
    // Revert to original values
    setUsername(originalValues.username);
    setBio(originalValues.bio);
    setVibe(originalValues.vibe);
    setTheme(originalValues.theme);
    setAutoVibe(originalValues.autoVibe);
    setPreferredLanguage(originalValues.preferredLanguage);
    setEditing(false);
  };

  const handleClose = () => {
    if (editing) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        handleCancel();
        onClose?.();
      }
    } else {
      onClose?.();
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setAvatarPreview(response.data.avatar);
      onUpdate?.(response.data.user);
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 max-w-md w-full shadow-2xl max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          {/* Status Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Status</h3>
              <button onClick={() => setShowCamera(true)} className="px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2">
                <Camera className="w-4 h-4" /> Update
              </button>
            </div>
            {statusPhoto ? (
              <div>
                <img src={statusPhoto} alt="Status" className="w-full h-48 object-cover rounded-lg" />
                {statusText ? (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{statusText}</p>
                ) : null}
                {statusUpdatedAt ? (
                  <p className="mt-1 text-xs text-gray-400">Updated {new Date(statusUpdatedAt).toLocaleString()}</p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No status yet. Share a photo status.</p>
            )}
          </div>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold text-3xl relative group overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={user?.username} className="w-full h-full object-cover" />
                ) : (
                  user?.username?.charAt(0).toUpperCase() || 'U'
                )}
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
              Username
            </label>
            {editing ? (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {user?.username || 'Not set'}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
              Bio
            </label>
            {editing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={150}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={3}
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[60px]">
                {user?.bio || 'No bio yet'}
              </div>
            )}
            {editing && (
              <div className="text-xs text-gray-500 mt-1 text-right">
                {bio.length}/150
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
              Email
            </label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {user?.email || 'Not set'}
            </div>
          </div>

          {/* Vibe Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Profile Vibe
            </label>
            {editing ? (
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(vibes).map(([vibeName, config]) => (
                  <button
                    key={vibeName}
                    onClick={() => setVibe(vibeName)}
                    className={`p-3 rounded-lg border-2 transition ${
                      vibe === vibeName
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">{config.emoji}</div>
                    <div className="text-xs font-medium">{vibeName}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {vibe ? `${vibes[vibe]?.emoji} ${vibe}` : 'No vibe set'}
              </div>
            )}
          </div>

          {/* Theme Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Theme
            </label>
            {editing ? (
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Object.entries(themes).map(([themeName, config]) => (
                  <option key={themeName} value={themeName}>
                    {config.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {themes[theme]?.name || 'Default'}
              </div>
            )}
            {editing && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoVibe"
                  checked={autoVibe}
                  onChange={(e) => setAutoVibe(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="autoVibe" className="text-xs text-gray-600 dark:text-gray-400">
                  Auto-adjust theme based on vibe
                </label>
              </div>
            )}
          </div>

          {/* Preferred Language */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
              Preferred Language
            </label>
            {editing ? (
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="ru">Russian</option>
              </select>
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {preferredLanguage.toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || !username.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setEditing(true);
                  // Store current values as original when entering edit mode
                  setOriginalValues({
                    username,
                    bio,
                    vibe,
                    theme,
                    autoVibe,
                    preferredLanguage
                  });
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </motion.div>
      <CameraStatus open={showCamera} onClose={() => setShowCamera(false)} onUpdated={handleStatusUpdated} />
    </div>
  );
};

export default UserProfile;

