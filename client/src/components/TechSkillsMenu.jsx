import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Lock, BarChart3, Palette, Rocket, Brain, Smartphone, Globe, Cloud, Link2, X, ArrowLeft, Users, ChevronRight, Wrench, Atom, Sparkles, GraduationCap } from 'lucide-react';
import api from '../utils/api';
import TechSkillJoinModal from './TechSkillJoinModal';
import ClassroomList from './ClassroomList';

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
  '⛓️': Link2,
  '⚛️': Atom,
  '🔧': Wrench,
  '🧪': Code // For Software Testers - using Code icon as placeholder
};

const TechSkillsMenu = ({ onClose, onJoinSuccess }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showClassrooms, setShowClassrooms] = useState(false);
  const [selectedClassroomSkill, setSelectedClassroomSkill] = useState(null);

  useEffect(() => {
    console.log('🎯 TechSkillsMenu mounted');
    fetchTechSkills();
  }, []);

  const fetchTechSkills = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching tech skills from API...');
      const response = await api.get('/tech-skills');
      console.log('Tech skills API response:', response.data);
      const skillsList = response.data.techSkills || response.data.skills || [];
      setSkills(skillsList);
      console.log(`✅ Loaded ${skillsList.length} tech skills:`, skillsList);
    } catch (error) {
      console.error('❌ Error fetching tech skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillClick = async (skill) => {
    console.log('🎯 Tech skill clicked:', skill);
    // Show modal immediately for faster UX
    setSelectedSkill({
      skill,
      roomId: null // Will be fetched in background
    });
    setShowJoinModal(true);
    console.log('✅ Join modal should now be visible');

    try {
      // Fetch profile and rooms in parallel for faster response
      const [profileResponse, roomsResponse] = await Promise.all([
        api.get(`/user-skill-profiles/skill/${skill._id}`).catch(() => ({ data: { profile: null } })),
        api.get(`/tech-skills/${skill._id}/rooms`).catch(() => ({ data: { rooms: [] } }))
      ]);

      const profile = profileResponse.data.profile;
      const rooms = roomsResponse.data.rooms || [];
      const roomId = rooms.length > 0 ? rooms[0]._id : null;

      // Update selected skill with roomId
      setSelectedSkill(prev => ({
        ...prev,
        roomId: roomId
      }));

      // If already verified, try to join directly
      if (profile && profile.isVerified) {
        try {
          const joinResponse = await api.post(`/user-skill-profiles/skill/${skill._id}/join-group`);
          if (joinResponse.data.room) {
            setShowJoinModal(false);
            setSelectedSkill(null);
            if (onJoinSuccess) {
              onJoinSuccess(joinResponse.data.room);
            }
            return;
          }
        } catch (joinError) {
          // If join fails, let user go through verification
          console.error('Join error:', joinError);
        }
      }
    } catch (error) {
      console.error('Error getting skill info:', error);
      // Modal already shown, user can still proceed
    }
  };

  const handleJoinSuccess = (room) => {
    setShowJoinModal(false);
    setSelectedSkill(null);
    if (onJoinSuccess) {
      onJoinSuccess(room);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tech skills...</p>
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10001]"
        onClick={onClose}
      />
      
          {/* Tech Skills Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] sm:w-96 z-[10002] bg-gradient-to-br from-slate-900/95 via-purple-900/30 to-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col h-screen max-h-screen"
          >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Tech / Digital Skills</h2>
              <p className="text-xs text-gray-400">Explore and join specialized tech groups</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Skills List - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 min-h-0">
          {skills.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <Sparkles className="w-12 h-12 text-purple-400 mx-auto opacity-50" />
              </div>
              <p className="text-gray-400 mb-2">No tech skills available yet.</p>
              <p className="text-xs text-gray-500">Please run the seed script to populate tech skills.</p>
            </div>
          ) : (
            skills.map((skill, index) => {
              const IconComponent = iconMap[skill.icon] || Code;
              return (
                <motion.button
                  key={skill._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSkillClick(skill)}
                  className="w-full p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all group text-left relative"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 group-hover:border-purple-400/50 transition-colors flex-shrink-0">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1 truncate">{skill.name} Group</h3>
                      <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">{skill.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('🎓 Classroom button clicked for skill:', skill.name);
                          setSelectedClassroomSkill({ skillId: skill._id, skillName: skill.name });
                          setShowClassrooms(true);
                        }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2.5 sm:p-3 rounded-lg bg-gradient-to-br from-indigo-500/40 to-purple-500/40 hover:from-indigo-500/50 hover:to-purple-500/50 border-2 border-indigo-400/60 shadow-lg shadow-indigo-500/30 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                        title="View Classrooms"
                      >
                        <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
                      </motion.button>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                    </div>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Join Modal */}
      {showJoinModal && selectedSkill && (
        <>
          {console.log('🔷 Rendering TechSkillJoinModal with:', {
            skill: selectedSkill.skill?.name,
            roomId: selectedSkill.roomId
          })}
          <TechSkillJoinModal
            skill={selectedSkill.skill}
            roomId={selectedSkill.roomId}
            onClose={() => {
              console.log('🚪 Closing join modal');
              alert('🚪 Closing join modal');
              setShowJoinModal(false);
              setSelectedSkill(null);
            }}
            onSuccess={handleJoinSuccess}
          />
        </>
      )}

      {/* Classroom List */}
      {showClassrooms && selectedClassroomSkill && (
        <ClassroomList
          skillId={selectedClassroomSkill.skillId}
          skillName={selectedClassroomSkill.skillName}
          onClose={() => {
            setShowClassrooms(false);
            setSelectedClassroomSkill(null);
          }}
        />
      )}
    </AnimatePresence>
  );
};

export default TechSkillsMenu;

