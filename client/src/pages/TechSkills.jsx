import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Lock, BarChart3, Palette, Rocket, Brain, Smartphone, Globe, Cloud, Link2, CheckCircle, XCircle, Clock, Users, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import JoinRequestModal from '../components/JoinRequestModal';

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

const TechSkills = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRequest, setJoinRequest] = useState(null);

  useEffect(() => {
    fetchTechSkills();
  }, []);

  const fetchTechSkills = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tech-skills');
      setSkills(response.data.skills || []);
    } catch (error) {
      console.error('Error fetching tech skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSkill = async (skill) => {
    try {
      // Get question for this skill
      const questionResponse = await api.get(`/tech-skills/${skill._id}/question`);
      setJoinRequest({
        skill,
        question: questionResponse.data.question,
        roomId: null // Will be set when we get the room
      });
      
      // Get rooms for this skill
      const roomsResponse = await api.get(`/tech-skills/${skill._id}/rooms`);
      const rooms = roomsResponse.data.rooms || [];
      
      if (rooms.length > 0) {
        const room = rooms[0];
        setJoinRequest(prev => ({
          ...prev,
          roomId: room._id
        }));
        setShowJoinModal(true);
      } else {
        alert('No room found for this tech skill. Please contact an admin.');
      }
    } catch (error) {
      console.error('Error getting join request info:', error);
      alert('Failed to load join information. Please try again.');
    }
  };

  const handleJoinSuccess = () => {
    setShowJoinModal(false);
    setJoinRequest(null);
    // Refresh or navigate
    navigate('/chat');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tech skills...</p>
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Tech Skills Groups
          </h1>
          <p className="text-gray-400">
            Join specialized groups based on your tech skills and interests. Answer questions to get approved by admins.
          </p>
        </motion.div>

        {/* Tech Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, index) => {
            const IconComponent = iconMap[skill.icon] || Code;
            return (
              <motion.div
                key={skill._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/20">
                  {/* Icon */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                      <IconComponent className="w-8 h-8 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{skill.name}</h3>
                      <p className="text-sm text-gray-400">{skill.description}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleJoinSkill(skill)}
                    className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                  >
                    <Users className="w-5 h-5" />
                    <span>Join Group</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {skills.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No tech skills available yet.</p>
          </div>
        )}
      </div>

      {/* Join Request Modal */}
      {showJoinModal && joinRequest && (
        <JoinRequestModal
          skill={joinRequest.skill}
          question={joinRequest.question}
          roomId={joinRequest.roomId}
          onClose={() => {
            setShowJoinModal(false);
            setJoinRequest(null);
          }}
          onSuccess={handleJoinSuccess}
        />
      )}
    </div>
  );
};

export default TechSkills;

