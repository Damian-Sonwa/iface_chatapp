import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Users, BookOpen, Video, FileText, Award, CheckCircle, X, ArrowLeft, Sparkles, Clock, DollarSign } from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const ClassroomList = ({ skillId, skillName, onClose }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (skillId) {
      fetchClassrooms();
    }
  }, [skillId]);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/classrooms/skill/${skillId}`);
      setClassrooms(response.data.classrooms || []);
    } catch (err) {
      console.error('Error fetching classrooms:', err);
      setError(err.response?.data?.error || 'Failed to load classrooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (classroomId) => {
    try {
      const response = await api.post(`/classrooms/${classroomId}/subscribe`);
      // Refresh classrooms list
      await fetchClassrooms();
      
      // Navigate to classroom room
      if (response.data.room) {
        navigate('/chat', {
          state: {
            chatId: response.data.room._id,
            chatType: 'room'
          }
        });
        onClose();
      }
    } catch (err) {
      console.error('Error subscribing to classroom:', err);
      alert(err.response?.data?.error || 'Failed to subscribe to classroom');
    }
  };

  const handleUnsubscribe = async (classroomId) => {
    try {
      await api.delete(`/classrooms/${classroomId}/subscribe`);
      // Refresh classrooms list
      await fetchClassrooms();
    } catch (err) {
      console.error('Error unsubscribing from classroom:', err);
      alert(err.response?.data?.error || 'Failed to unsubscribe from classroom');
    }
  };

  const handleOpenClassroom = (classroom) => {
    if (classroom.isSubscribed && classroom.roomId) {
      navigate('/chat', {
        state: {
          chatId: classroom.roomId._id || classroom.roomId,
          chatType: 'room'
        }
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10006]"
        onClick={onClose}
      />
      
      {/* Classroom Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md z-[10007] bg-gradient-to-br from-slate-900/95 via-indigo-900/30 to-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col h-screen max-h-screen"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                {skillName} Classrooms
              </h2>
              <p className="text-xs text-gray-400">Upgrade your career with specialized courses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading classrooms...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchClassrooms}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : classrooms.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-indigo-400 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400 mb-2">No classrooms available yet.</p>
              <p className="text-xs text-gray-500">Check back later for new courses.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {classrooms.map((classroom, index) => (
                <motion.div
                  key={classroom._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 sm:p-5 rounded-xl border transition-all ${
                    classroom.isSubscribed
                      ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/30'
                  }`}
                >
                  {/* Classroom Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 ${
                        classroom.isSubscribed
                          ? 'bg-indigo-500/30'
                          : 'bg-indigo-500/20'
                      }`}>
                        <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-white mb-1 truncate">
                          {classroom.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">
                          {classroom.description || 'Career upgrade course'}
                        </p>
                      </div>
                    </div>
                    {classroom.isSubscribed && (
                      <div className="flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  {classroom.features && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {classroom.features.liveSessions && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-xs text-gray-300">
                          <Video className="w-3 h-3" />
                          <span>Live Sessions</span>
                        </div>
                      )}
                      {classroom.features.assignments && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-xs text-gray-300">
                          <FileText className="w-3 h-3" />
                          <span>Assignments</span>
                        </div>
                      )}
                      {classroom.features.resources && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-xs text-gray-300">
                          <BookOpen className="w-3 h-3" />
                          <span>Resources</span>
                        </div>
                      )}
                      {classroom.features.certificates && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-xs text-gray-300">
                          <Award className="w-3 h-3" />
                          <span>Certificate</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{classroom.subscriberCount || 0} subscribers</span>
                    </div>
                    {classroom.price > 0 && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>${classroom.price}</span>
                      </div>
                    )}
                    {classroom.price === 0 && (
                      <div className="flex items-center gap-1 text-green-400">
                        <Sparkles className="w-4 h-4" />
                        <span>Free</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {classroom.isSubscribed ? (
                      <>
                        <motion.button
                          onClick={() => handleOpenClassroom(classroom)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Open Classroom</span>
                        </motion.button>
                        <motion.button
                          onClick={() => handleUnsubscribe(classroom._id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-all"
                        >
                          Unsubscribe
                        </motion.button>
                      </>
                    ) : (
                      <motion.button
                        onClick={() => handleSubscribe(classroom._id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2"
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>Subscribe Now</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ClassroomList;

