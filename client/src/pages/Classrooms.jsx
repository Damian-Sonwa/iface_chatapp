import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Users, BookOpen, Video, FileText, Award, CheckCircle, DollarSign, Sparkles, ArrowRight, Code, Lock, BarChart3, Palette, Rocket, Brain, Smartphone, Globe, Cloud, Link2, X } from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const iconMap = {
  '💻': Code,
  '🔒': Lock,
  '📊': BarChart3,
  '🎨': Palette,
  '🚀': Rocket,
  '🤖': Brain,
  '📱': Smartphone,
  '🌐': Globe,
  '☁️': Cloud,
  '⛓️': Link2
};

const Classrooms = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [techSkills, setTechSkills] = useState([]);
  const [classroomsBySkill, setClassroomsBySkill] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSkills, setExpandedSkills] = useState(new Set());
  const [subscribing, setSubscribing] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all tech skills
      const skillsResponse = await api.get('/tech-skills');
      const skills = skillsResponse.data.skills || [];
      setTechSkills(skills);

      // Fetch classrooms for each skill
      const classroomsMap = {};
      const promises = skills.map(async (skill) => {
        try {
          const response = await api.get(`/classrooms/skill/${skill._id}`);
          const classrooms = response.data.classrooms || [];
          return { skillId: skill._id, classrooms };
        } catch (err) {
          console.error(`Error fetching classrooms for ${skill.name}:`, err);
          return { skillId: skill._id, classrooms: [] };
        }
      });

      const results = await Promise.all(promises);
      results.forEach(({ skillId, classrooms }) => {
        classroomsMap[skillId] = classrooms;
      });

      setClassroomsBySkill(classroomsMap);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.error || 'Failed to load classrooms');
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skillId) => {
    setExpandedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skillId)) {
        newSet.delete(skillId);
      } else {
        newSet.add(skillId);
      }
      return newSet;
    });
  };

  const handleSubscribe = async (classroomId, skillId) => {
    setSubscribing(prev => ({ ...prev, [classroomId]: true }));
    try {
      const subscribeResponse = await api.post(`/classrooms/${classroomId}/subscribe`);
      if (subscribeResponse.data.message) {
        // Refresh classrooms for this skill
        const classroomsResponse = await api.get(`/classrooms/skill/${skillId}`);
        setClassroomsBySkill(prev => ({
          ...prev,
          [skillId]: classroomsResponse.data.classrooms || []
        }));

        // Navigate to classroom room if available
        if (subscribeResponse.data.room) {
          navigate('/chat', {
            state: {
              chatId: subscribeResponse.data.room._id,
              chatType: 'room'
            }
          });
        }
      }
    } catch (err) {
      console.error('Error subscribing to classroom:', err);
      alert(err.response?.data?.error || 'Failed to subscribe to classroom');
    } finally {
      setSubscribing(prev => ({ ...prev, [classroomId]: false }));
    }
  };

  const handleUnsubscribe = async (classroomId, skillId) => {
    setSubscribing(prev => ({ ...prev, [classroomId]: true }));
    try {
      await api.delete(`/classrooms/${classroomId}/subscribe`);
      // Refresh classrooms for this skill
      const response = await api.get(`/classrooms/skill/${skillId}`);
      setClassroomsBySkill(prev => ({
        ...prev,
        [skillId]: response.data.classrooms || []
      }));
    } catch (err) {
      console.error('Error unsubscribing from classroom:', err);
      alert(err.response?.data?.error || 'Failed to unsubscribe from classroom');
    } finally {
      setSubscribing(prev => ({ ...prev, [classroomId]: false }));
    }
  };

  const handleOpenClassroom = (classroom) => {
    if (classroom.isSubscribed && classroom.roomId) {
      const roomId = classroom.roomId._id || classroom.roomId;
      navigate('/chat', {
        state: {
          chatId: roomId,
          chatType: 'room'
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading classrooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Classrooms
              </h1>
              <p className="text-gray-400">
                Explore structured learning courses organized by tech skills. Subscribe to access classroom rooms and resources.
              </p>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Tech Skills with Classrooms */}
        <div className="space-y-6">
          {techSkills.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-indigo-400 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400 text-lg">No tech skills available yet.</p>
            </div>
          ) : (
            techSkills.map((skill, skillIndex) => {
              const IconComponent = iconMap[skill.icon] || Code;
              const classrooms = classroomsBySkill[skill._id] || [];
              const isExpanded = expandedSkills.has(skill._id);

              return (
                <motion.div
                  key={skill._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: skillIndex * 0.1 }}
                  className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-indigo-500/20 transition-all"
                >
                  {/* Skill Header - Clickable */}
                  <button
                    onClick={() => toggleSkill(skill._id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex-shrink-0">
                        <IconComponent className="w-8 h-8 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h2 className="text-xl font-bold text-white mb-1 truncate">{skill.name}</h2>
                        <p className="text-sm text-gray-400 line-clamp-1">{skill.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {classrooms.length} {classrooms.length === 1 ? 'classroom' : 'classrooms'} available
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Classrooms List - Expandable */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0 space-y-4 border-t border-white/10">
                          {classrooms.length === 0 ? (
                            <div className="text-center py-8">
                              <GraduationCap className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-50" />
                              <p className="text-gray-400 mb-2">No classrooms available for this skill yet.</p>
                              <p className="text-xs text-gray-500">Check back later or contact an admin to create one.</p>
                            </div>
                          ) : (
                            classrooms.map((classroom, index) => {
                              const isLoading = subscribing[classroom._id];

                              return (
                                <motion.div
                                  key={classroom._id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className={`p-5 rounded-xl border transition-all ${
                                    classroom.isSubscribed
                                      ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/50'
                                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/30'
                                  }`}
                                >
                                  {/* Classroom Header */}
                                  <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                      <div className={`p-2 rounded-xl flex-shrink-0 ${
                                        classroom.isSubscribed
                                          ? 'bg-indigo-500/30'
                                          : 'bg-indigo-500/20'
                                      }`}>
                                        <GraduationCap className="w-5 h-5 text-indigo-400" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-white mb-1 truncate">
                                          {classroom.name}
                                        </h3>
                                        <p className="text-sm text-gray-400 line-clamp-2">
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
                                    {classroom.price > 0 ? (
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="w-4 h-4" />
                                        <span>${classroom.price}</span>
                                      </div>
                                    ) : (
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
                                          onClick={() => handleUnsubscribe(classroom._id, skill._id)}
                                          disabled={isLoading}
                                          whileHover={{ scale: isLoading ? 1 : 1.02 }}
                                          whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          {isLoading ? '...' : 'Unsubscribe'}
                                        </motion.button>
                                      </>
                                    ) : (
                                      <motion.button
                                        onClick={() => handleSubscribe(classroom._id, skill._id)}
                                        disabled={isLoading}
                                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                        className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <GraduationCap className="w-4 h-4" />
                                        <span>{isLoading ? 'Subscribing...' : 'Subscribe Now'}</span>
                                      </motion.button>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Classrooms;

