import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, ChevronRight, User, Sparkles } from 'lucide-react';
import api from '../utils/api';

const skillLevels = [
  { id: 'Beginner', label: 'Beginner', description: 'Just starting out' },
  { id: 'Intermediate', label: 'Intermediate', description: 'Some experience' },
  { id: 'Professional', label: 'Professional', description: 'Expert level' }
];

const TechSkillJoinModal = ({ skill, roomId, onClose, onSuccess, room }) => {
  const [step, setStep] = useState(1); // 1: Select level, 2: Answer questions
  const [selectedLevel, setSelectedLevel] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (step === 2 && selectedLevel) {
      fetchQuestions();
    }
  }, [step, selectedLevel, skill]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch questions for the selected level from backend
      const response = await api.get(`/user-skill-profiles/skill/${skill._id}/questions/${selectedLevel}`);
      const fetchedQuestions = response.data.questions || [];
      
      if (fetchedQuestions.length === 0) {
        setError('No questions available for this level. Please contact support.');
        return;
      }

      setQuestions(fetchedQuestions);
      
      // Initialize answers object
      const initialAnswers = {};
      fetchedQuestions.forEach((q) => {
        initialAnswers[q._id] = '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(error.response?.data?.error || 'Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all questions are answered
    const unansweredQuestions = questions.filter(q => 
      !answers[q._id] || !answers[q._id].trim()
    );

    if (unansweredQuestions.length > 0) {
      setError('Please answer all questions.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Format answers for API
      const formattedAnswers = questions.map(q => ({
        questionId: q._id,
        answer: answers[q._id].trim()
      }));

      // Verify answers and auto-join if verified (single API call for speed)
      const verifyResponse = await api.post('/user-skill-profiles/verify', {
        skillId: skill._id,
        level: selectedLevel,
        answers: formattedAnswers,
        autoJoin: true // Automatically join group if verified
      });

      const { isVerified, score, message, profile, room, correctCount, totalQuestions } = verifyResponse.data;

      if (isVerified) {
        // Success - pass room data to onSuccess for navigation
        if (onSuccess) {
          onSuccess(room); // Pass room so parent can navigate
        }
        // Show success message briefly
        alert(`🎉 ${message}\nYou got ${correctCount}/${totalQuestions} correct (${score}%)`);
      } else {
        // Not verified - show error with retry option
        setError(`${message}\nYou got ${correctCount}/${totalQuestions} correct (${score}%)`);
      }
    } catch (err) {
      console.error('Error verifying answers:', err);
      setError(err.response?.data?.error || 'Failed to verify answers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10003] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={(e) => {
          // Close modal when clicking outside
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-3xl bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/20 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Join {skill?.name} Group
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {step === 1 ? 'Select your skill level to begin' : 'Answer questions to verify your level'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
              >
                Cancel
              </motion.button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
                {step === 1 ? (
              <div className="space-y-4">
                <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-gray-200 text-sm leading-relaxed">
                    <span className="font-semibold text-blue-300">Welcome!</span> Select your skill level in <span className="font-semibold text-purple-300">{skill?.name}</span>. You'll need to answer questions to verify your level before joining the group.
                  </p>
                </div>
                {skillLevels.map((level, index) => (
                  <motion.button
                    key={level.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedLevel(level.id);
                      setStep(2);
                    }}
                    className={`w-full p-4 rounded-xl border transition-all text-left ${
                      selectedLevel === level.id
                        ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          selectedLevel === level.id
                            ? 'bg-purple-500/30'
                            : 'bg-white/5'
                        }`}>
                          {level.id === 'Beginner' && '🌱'}
                          {level.id === 'Intermediate' && '⚡'}
                          {level.id === 'Professional' && '⭐'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">{level.label}</h3>
                          <p className="text-sm text-gray-400">{level.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {loading && questions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading questions...</p>
                  </div>
                ) : (
                  questions.map((question, qIndex) => (
                    <div key={question._id} className="space-y-3 mb-6">
                      <label className="block text-base font-semibold text-white">
                        {qIndex + 1}. {question.questionText}
                        <span className="text-red-400 ml-1">*</span>
                      </label>
                      {question.questionType === 'multiple-choice' && question.options ? (
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <label
                              key={optIndex}
                              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 cursor-pointer transition-all"
                            >
                              <input
                                type="radio"
                                name={`question-${question._id}`}
                                value={option}
                                checked={answers[question._id] === option}
                                onChange={(e) => {
                                  setAnswers(prev => ({
                                    ...prev,
                                    [question._id]: e.target.value
                                  }));
                                  setError('');
                                }}
                                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-white flex-1">{option}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          value={answers[question._id] || ''}
                          onChange={(e) => {
                            setAnswers(prev => ({
                              ...prev,
                              [question._id]: e.target.value
                            }));
                            setError('');
                          }}
                          placeholder="Type your answer here..."
                          rows={4}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                        />
                      )}
                    </div>
                  ))
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setAnswers({});
                      setError('');
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all"
                  >
                    Back
                  </motion.button>
                  {error && (
                    <motion.button
                      type="button"
                      onClick={() => {
                        // Retry - reset answers and clear error
                        setAnswers({});
                        setError('');
                        // Reset all answers to empty
                        const resetAnswers = {};
                        questions.forEach(q => {
                          resetAnswers[q._id] = '';
                        });
                        setAnswers(resetAnswers);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 font-semibold hover:bg-yellow-500/30 transition-all"
                    >
                      Retry
                    </motion.button>
                  )}
                  <motion.button
                    type="submit"
                    disabled={loading || questions.length === 0}
                    whileHover={{ scale: loading ? 1 : 1.05 }}
                    whileTap={{ scale: loading ? 1 : 0.95 }}
                    className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Submit Request</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TechSkillJoinModal;

