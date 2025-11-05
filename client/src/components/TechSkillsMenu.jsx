import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Lock, BarChart3, Palette, Rocket, Brain, Smartphone, Globe, Cloud, Link2, X, ArrowLeft, Users, ChevronRight, Wrench, Atom } from 'lucide-react';
import api from '../utils/api';
import TechSkillJoinModal from './TechSkillJoinModal';

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
  '🔧': Wrench
};

const TechSkillsMenu = ({ onClose, onJoinSuccess }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    fetchTechSkills();
  }, []);

  const fetchTechSkills = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tech-skills');
      setSkills(response.data.techSkills || response.data.skills || []);
    } catch (error) {
      console.error('Error fetching tech skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillClick = async (skill) => {
    try {
      // Check if user already has a verified profile
      try {
        const profileResponse = await api.get(`/user-skill-profiles/skill/${skill._id}`);
        const profile = profileResponse.data.profile;
        
        if (profile && profile.isVerified) {
          // Already verified - try to join group directly
          try {
            const joinResponse = await api.post(`/user-skill-profiles/skill/${skill._id}/join-group`);
            if (joinResponse.data.room) {
              alert('Successfully joined the group!');
              if (onJoinSuccess) {
                onJoinSuccess();
              }
              return;
            }
          } catch (joinError) {
            // If join fails, show modal anyway
          }
        }
      } catch (profileError) {
        // No profile exists, continue to verification
      }

      // Get rooms for this skill
      const roomsResponse = await api.get(`/tech-skills/${skill._id}/rooms`);
      const rooms = roomsResponse.data.rooms || [];
      
      if (rooms.length > 0) {
        const room = rooms[0];
        setSelectedSkill({
          skill,
          roomId: room._id
        });
        setShowJoinModal(true);
      } else {
        alert('No room found for this tech skill. Please contact an admin.');
      }
    } catch (error) {
      console.error('Error getting skill info:', error);
      alert('Failed to load skill information. Please try again.');
    }
  };

  const handleJoinSuccess = () => {
    setShowJoinModal(false);
    setSelectedSkill(null);
    if (onJoinSuccess) {
      onJoinSuccess();
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
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10001]"
        onClick={onClose}
      />
      
      {/* Tech Skills Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] z-[10002] bg-gradient-to-br from-slate-900/95 via-purple-900/30 to-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white">Tech Skills Groups</h2>
              <p className="text-xs text-gray-400">Join specialized tech groups</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Skills List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {skills.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No tech skills available yet.</p>
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
                  onClick={() => handleSkillClick(skill)}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 group-hover:border-purple-400/50 transition-colors">
                      <IconComponent className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1">{skill.name}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">{skill.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && selectedSkill && (
        <TechSkillJoinModal
          skill={selectedSkill.skill}
          roomId={selectedSkill.roomId}
          onClose={() => {
            setShowJoinModal(false);
            setSelectedSkill(null);
          }}
          onSuccess={handleJoinSuccess}
        />
      )}
    </>
  );
};

export default TechSkillsMenu;

