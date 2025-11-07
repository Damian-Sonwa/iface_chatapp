import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, GraduationCap, CheckCircle, DollarSign, BookOpen, Users, Award, Video, FileText, Sparkles } from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const featureIcons = {
  'Live Sessions': Video,
  'Assignments': FileText,
  'Resources': BookOpen,
  'Certificates': Award,
};

const AllClassroomsView = ({ onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscribing, setSubscribing] = useState({});

  useEffect(() => {
    fetchAllClassrooms();
  }, []);

  const fetchAllClassrooms = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all tech skills first
      const skillsResponse = await api.get('/tech-skills');
      const skills = skillsResponse.data.techSkills || skillsResponse.data.skills || [];
      
      // Fetch classrooms for each skill
      const classroomPromises = skills.map(skill => 
        api.get(`/classrooms/skill/${skill._id}`).catch(() => ({ data: { classrooms: [] } }))
      );
      
      const results = await Promise.all(classroomPromises);
      const allClassrooms = results.flatMap((result, index) => {
        const skillClassrooms = result.data.classrooms || [];
        return skillClassrooms.map(cls => ({
          ...cls,
          skillName: skills[index].name,
          skillId: skills[index]._id
        }));
      });
      
      setClassrooms(allClassrooms);
    } catch (err) {
      console.error('Error fetching classrooms:', err);
      setError(err.response?.data?.error || 'Failed to load classrooms.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (classroomId, room) => {
    setSubscribing(prev => ({ ...prev, [classroomId]: true }));
    try {
      const response = await api.post(`/classrooms/${classroomId}/subscribe`);
      if (response.data.message) {
        alert(response.data.message);
        // Update local state
        setClassrooms(prev => prev.map(cls => 
          cls._id === classroomId 
            ? { ...cls, subscribers: [...cls.subscribers, { userId: user._id, subscribedAt: new Date() }] } 
            : cls
        ));
        // Navigate to classroom
        if (room && room._id) {
          onClose();
          navigate('/chat', { state: { chatId: room._id, chatType: 'room' } });
        }
      }
    } catch (err) {
      console.error('Error subscribing to classroom:', err);
      alert(err.response?.data?.error || 'Failed to subscribe to classroom.');
    } finally {
      setSubscribing(prev => ({ ...prev, [classroomId]: false }));
    }
  };

  const handleUnsubscribe = async (classroomId) => {
    setSubscribing(prev => ({ ...prev, [classroomId]: true }));
    try {
      const response = await api.delete(`/classrooms/${classroomId}/subscribe`);
      if (response.data.message) {
        alert(response.data.message);
        setClassrooms(prev => prev.map(cls => 
          cls._id === classroomId 
            ? { ...cls, subscribers: cls.subscribers.filter(s => s.userId.toString() !== user._id.toString()) } 
            : cls
        ));
      }
    } catch (err) {
      console.error('Error unsubscribing from classroom:', err);
      alert(err.response?.data?.error || 'Failed to unsubscribe from classroom.');
    } finally {
      setSubscribing(prev => ({ ...prev, [classroomId]: false }));
    }
  };

  const handleOpenClassroom = (room) => {
    if (room && room._id) {
      onClose();
      navigate('/chat', { state: { chatId: room._id, chatType: 'room' } });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="text-center p-8 rounded-xl bg-slate-800 border border-white/10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading classrooms...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10010]"
        onClick={onClose}
      />
      
      {/* Classroom Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md z-[10011] bg-gradient-to-br from-slate-900/95 via-indigo-900/30 to-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col h-screen max-h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">All Classrooms</h2>
              <p className="text-xs text-gray-400">Enhance your skills with structured learning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Classrooms List - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-h-0">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <X className="w-4 h-4" /> {error}
            </div>
          )}

          {classrooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <GraduationCap className="w-12 h-12 text-indigo-400 mx-auto opacity-50" />
              </div>
              <p className="text-gray-400 mb-2">No classrooms available yet.</p>
              <p className="text-xs text-gray-500">Check back later or contact an admin to create one.</p>
            </div>
          ) : (
            classrooms.map((classroom, index) => {
              const isSubscribed = classroom.subscribers.some(s => s.userId.toString() === user._id.toString());
              const isLoading = subscribing[classroom._id];

              return (
                <motion.div
                  key={classroom._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-lg flex flex-col space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">{classroom.name}</h3>
                      <p className="text-xs text-gray-400 truncate">{classroom.skillName}</p>
                      <p className="text-xs text-gray-500 truncate mt-1">{classroom.description}</p>
                    </div>
                    {isSubscribed && (
                      <span className="px-2 py-1 text-xs font-semibold text-green-400 bg-green-500/20 rounded-full flex items-center gap-1 flex-shrink-0">
                        <CheckCircle className="w-3 h-3" /> Subscribed
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-300">
                    {classroom.price === 0 ? (
                      <span className="px-2 py-1 bg-green-500/20 rounded-full flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Free
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-500/20 rounded-full flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> {classroom.price} {classroom.currency}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-blue-500/20 rounded-full flex items-center gap-1">
                      <Users className="w-3 h-3" /> {classroom.subscribers.length} Subscribers
                    </span>
                  </div>

                  {classroom.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                      {classroom.features.map((feature, featIndex) => {
                        const FeatureIcon = featureIcons[feature] || BookOpen;
                        return (
                          <span key={featIndex} className="px-2 py-1 text-xs text-indigo-300 bg-indigo-500/20 rounded-full flex items-center gap-1">
                            <FeatureIcon className="w-3 h-3" /> {feature}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-3 border-t border-white/5 flex gap-2">
                    {isSubscribed ? (
                      <>
                        <motion.button
                          onClick={() => handleOpenClassroom(classroom.room)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-md shadow-indigo-500/30 min-h-[44px] touch-manipulation"
                        >
                          Open Classroom
                        </motion.button>
                        <motion.button
                          onClick={() => handleUnsubscribe(classroom._id)}
                          disabled={isLoading}
                          whileHover={{ scale: isLoading ? 1 : 1.02 }}
                          whileTap={{ scale: isLoading ? 1 : 0.98 }}
                          className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
                        >
                          {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
                        </motion.button>
                      </>
                    ) : (
                      <motion.button
                        onClick={() => handleSubscribe(classroom._id, classroom.room)}
                        disabled={isLoading}
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-500 hover:to-emerald-500 transition-all shadow-md shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
                      >
                        {isLoading ? 'Subscribing...' : 'Subscribe Now'}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AllClassroomsView;



