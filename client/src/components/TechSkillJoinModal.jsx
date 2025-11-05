import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, ChevronRight, User } from 'lucide-react';
import api from '../utils/api';

const skillLevels = [
  { id: 'beginner', label: 'Beginner', description: 'Just starting out' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some experience' },
  { id: 'advanced', label: 'Advanced', description: 'Expert level' }
];

const TechSkillJoinModal = ({ skill, roomId, onClose, onSuccess }) => {
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
      // Get base question for the skill
      const questionResponse = await api.get(`/tech-skills/${skill._id}/question`);
      const baseQuestion = questionResponse.data.question;

      // Generate level-based questions
      const levelQuestions = generateLevelQuestions(skill, selectedLevel, baseQuestion);
      setQuestions(levelQuestions);
      
      // Initialize answers object
      const initialAnswers = {};
      levelQuestions.forEach((q, index) => {
        initialAnswers[index] = '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateLevelQuestions = (skill, level, baseQuestion) => {
    const questions = [];
    
    // Always include the base question
    questions.push({
      text: baseQuestion,
      required: true
    });

    // Add level-specific questions
    if (level === 'beginner') {
      questions.push({
        text: `What interests you most about ${skill.name}?`,
        required: true
      });
      questions.push({
        text: `What resources or courses have you used to learn ${skill.name}?`,
        required: false
      });
    } else if (level === 'intermediate') {
      questions.push({
        text: `How many years of experience do you have with ${skill.name}?`,
        required: true
      });
      questions.push({
        text: `What projects have you worked on related to ${skill.name}?`,
        required: true
      });
      questions.push({
        text: `What specific ${skill.name} tools or technologies are you most comfortable with?`,
        required: false
      });
    } else if (level === 'advanced') {
      questions.push({
        text: `Describe your professional experience with ${skill.name} in detail.`,
        required: true
      });
      questions.push({
        text: `What are the most challenging ${skill.name} problems you've solved?`,
        required: true
      });
      questions.push({
        text: `What certifications or advanced training do you have in ${skill.name}?`,
        required: false
      });
      questions.push({
        text: `How do you plan to contribute to this ${skill.name} community?`,
        required: true
      });
    }

    return questions;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all required questions are answered
    const unansweredRequired = questions.find((q, index) => 
      q.required && (!answers[index] || answers[index].trim().length < 10)
    );

    if (unansweredRequired) {
      setError('Please answer all required questions with at least 10 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Combine all answers into a single answer text
      const combinedAnswer = questions.map((q, index) => {
        if (!answers[index] || !answers[index].trim()) return null;
        return `${q.text}\n\n${answers[index].trim()}`;
      }).filter(Boolean).join('\n\n---\n\n');

      await api.post('/group-join-requests', {
        roomId,
        answer: combinedAnswer
      });

      onSuccess();
      alert('Join request submitted successfully! An admin will review your request.');
    } catch (err) {
      console.error('Error submitting join request:', err);
      setError(err.response?.data?.error || 'Failed to submit join request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-3xl bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Join {skill?.name} Group
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {step === 1 ? 'Select your skill level' : 'Answer the questions below'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {step === 1 ? (
              <div className="space-y-4">
                <p className="text-gray-300 mb-6">
                  Please select your skill level in {skill?.name}. This will help us generate appropriate questions for your join request.
                </p>
                {skillLevels.map((level, index) => (
                  <motion.button
                    key={level.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
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
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{level.label}</h3>
                        <p className="text-sm text-gray-400">{level.description}</p>
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
                    <p className="text-gray-400">Generating questions...</p>
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <div key={index} className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-300">
                        {question.text}
                        {question.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      <textarea
                        value={answers[index] || ''}
                        onChange={(e) => {
                          setAnswers(prev => ({
                            ...prev,
                            [index]: e.target.value
                          }));
                          setError('');
                        }}
                        placeholder={`Type your answer here...${question.required ? ' (minimum 10 characters)' : ' (optional)'}`}
                        rows={4}
                        required={question.required}
                        minLength={question.required ? 10 : 0}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                      />
                      {question.required && (
                        <p className="text-xs text-gray-400">
                          {(answers[index] || '').length}/10 characters minimum
                        </p>
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
      </div>
    </AnimatePresence>
  );
};

export default TechSkillJoinModal;

