import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, ChevronRight, User, Sparkles } from 'lucide-react';
import api from '../utils/api';

const skillLevels = [
  { id: 'Beginner', label: 'Beginner', description: 'Just starting out' },
  { id: 'Intermediate', label: 'Intermediate', description: 'Some experience' },
  { id: 'Professional', label: 'Professional', description: 'Expert level' }
];

const TechSkillJoinModal = ({ skill, roomId, onClose, onSuccess, room }) => {
  console.log('🔷 TechSkillJoinModal rendered with:', { skillId: skill?._id, skillName: skill?.name });
  
  // Log on mount
  useEffect(() => {
    console.log('🔷 TechSkillJoinModal mounted with skill:', skill?.name);
  }, []);
  
  const [step, setStep] = useState(1); // 1: Select level, 2: Answer questions
  const [selectedLevel, setSelectedLevel] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track current question
  const contentRef = useRef(null); // Ref for scrollable content
  const [showSuccess, setShowSuccess] = useState(false); // Show success message
  const [successData, setSuccessData] = useState(null); // Success data (score, message, etc.)
  
  // Debug: Log whenever questions state changes
  useEffect(() => {
    console.log('📊 Questions state changed:', {
      count: questions.length,
      questions: questions.map((q, i) => ({ index: i, id: q._id, text: q.questionText?.substring(0, 50) }))
    });
  }, [questions]);
  
  // Debug: Log whenever currentQuestionIndex changes
  useEffect(() => {
    console.log('📍 Current question index changed to:', currentQuestionIndex, 'of', questions.length);
  }, [currentQuestionIndex, questions.length]);

  useEffect(() => {
    console.log('TechSkillJoinModal useEffect triggered:', { step, selectedLevel, skillId: skill?._id });
    
    if (step === 2 && selectedLevel && skill?._id) {
      console.log('✅ Calling fetchQuestions for level:', selectedLevel);
      fetchQuestions();
    } else {
      console.log('⏭️ Skipping fetchQuestions:', { step, selectedLevel, hasSkill: !!skill?._id });
    }
  }, [step, selectedLevel, skill]);

  const fetchQuestions = async () => {
    console.log('=== fetchQuestions called ===');
    console.log('Skill ID:', skill?._id);
    console.log('Selected Level:', selectedLevel);
    
    try {
      setLoading(true);
      setError('');
      
      const apiUrl = `/user-skill-profiles/skill/${skill._id}/questions/${selectedLevel}`;
      console.log('Fetching from API:', apiUrl);
      
      // Fetch questions for the selected level from backend
      const response = await api.get(apiUrl);
      
      console.log('API Response:', response.data);
      
      const fetchedQuestions = response.data.questions || [];
      
      console.log(`✅ Fetched ${fetchedQuestions.length} questions for ${selectedLevel} level`);
      console.log('Questions array:', fetchedQuestions);
      
      if (fetchedQuestions.length === 0) {
        console.warn('⚠️ No questions returned from API');
        setError('No questions available for this level. Please contact support.');
        setLoading(false);
        return;
      }
      
      if (fetchedQuestions.length < 10) {
        console.warn(`⚠️ Only ${fetchedQuestions.length} questions returned, expected 10`);
      }

      setQuestions(fetchedQuestions);
      console.log('Questions state updated:', fetchedQuestions.length, 'questions');
      
      // Initialize answers object
      const initialAnswers = {};
      fetchedQuestions.forEach((q, index) => {
        console.log(`Question ${index + 1}:`, { id: q._id, text: q.questionText });
        initialAnswers[q._id] = '';
      });
      setAnswers(initialAnswers);
      console.log('Answers initialized:', Object.keys(initialAnswers).length, 'entries');
      
      // Reset to first question
      setCurrentQuestionIndex(0);
      console.log(`✅ Questions set successfully. Total: ${fetchedQuestions.length}, Starting at index 0`);
      setLoading(false);
    } catch (error) {
      const errorMsg = `❌ Error fetching questions: ${error.message}`;
      console.error('❌ Error fetching questions:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        data: error.response?.data,
        status: error.response?.status
      });
      alert(errorMsg); // Temporary alert to show error
      setError(error.response?.data?.error || 'Failed to load questions. Please try again.');
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
        // Show success message with score and welcome
        setSuccessData({
          score,
          correctCount,
          totalQuestions,
          message,
          skillName: skill?.name,
          room
        });
        setShowSuccess(true);
        // Wait 2 seconds before navigating to show success message
        setTimeout(() => {
          setShowSuccess(false);
          if (onSuccess && room) {
            // Immediately navigate to the group chat
            console.log('🎯 Navigating to room:', room);
            onSuccess(room); // Pass room so parent can navigate
          } else {
            console.error('❌ No room data available for navigation');
          }
        }, 2000);
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
          className="w-full max-w-3xl mx-2 sm:mx-4 bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-white/20 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent truncate">
                  Join {skill?.name} Group
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  {step === 1 ? 'Select your skill level to begin' : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm font-medium hover:bg-white/10 transition-all"
              >
                Cancel
              </motion.button>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div ref={contentRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 min-h-0">
                {showSuccess && successData ? (
                  // Success Message
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4"
                    >
                      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                    
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                    >
                      🎉 Success!
                    </motion.h2>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-4 max-w-md"
                    >
                      <div className="p-4 sm:p-6 rounded-xl bg-green-500/10 border border-green-500/30">
                        <p className="text-lg sm:text-xl text-white font-semibold mb-2">
                          Your Score: {successData.correctCount} / {successData.totalQuestions}
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold text-green-400">
                          {successData.score}%
                        </p>
                      </div>
                      
                      <div className="p-4 sm:p-6 rounded-xl bg-purple-500/10 border border-purple-500/30">
                        <p className="text-base sm:text-lg text-white font-semibold mb-2">
                          Welcome to the {successData.skillName} Group! 👋
                        </p>
                        <p className="text-sm sm:text-base text-gray-300">
                          You've successfully joined the group. You can now chat with your peers and colleagues.
                        </p>
                      </div>
                      
                      <div className="pt-4">
                        <p className="text-sm text-gray-400 animate-pulse">
                          Redirecting you to the group...
                        </p>
                      </div>
                    </motion.div>
                  </div>
                ) : step === 1 ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
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
                      console.log('🎯 Level selected:', level.id);
                      setSelectedLevel(level.id);
                      setStep(2);
                      console.log('✅ Step changed to 2, should trigger fetchQuestions');
                    }}
                    className={`w-full p-3 sm:p-4 rounded-xl border transition-all text-left ${
                      selectedLevel === level.id
                        ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          selectedLevel === level.id
                            ? 'bg-purple-500/30'
                            : 'bg-white/5'
                        }`}>
                          {level.id === 'Beginner' && '🌱'}
                          {level.id === 'Intermediate' && '⚡'}
                          {level.id === 'Professional' && '⭐'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-semibold text-white mb-1">{level.label}</h3>
                          <p className="text-xs sm:text-sm text-gray-400">{level.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
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
                ) : questions.length > 0 && currentQuestionIndex < questions.length ? (
                  <>
                    {/* Question Progress Indicator */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm text-gray-400">Question</span>
                        <span className="text-lg sm:text-xl font-bold text-purple-400">
                          {currentQuestionIndex + 1} / {questions.length}
                        </span>
                      </div>
                      <div className="flex gap-1 sm:gap-1.5 flex-wrap">
                        {questions.map((_, idx) => (
                          <div
                            key={idx}
                            className={`h-2 rounded-full transition-all ${
                              idx === currentQuestionIndex
                                ? 'bg-purple-500 w-6 sm:w-8'
                                : answers[questions[idx]._id] && answers[questions[idx]._id].trim() !== ''
                                ? 'bg-purple-500/50 w-2'
                                : 'bg-white/10 w-2'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Current Question Display */}
                    {questions.length > 0 && questions[currentQuestionIndex] ? (() => {
                      const question = questions[currentQuestionIndex];
                      console.log(`📝 Displaying question ${currentQuestionIndex + 1} of ${questions.length}:`, {
                        id: question._id,
                        text: question.questionText,
                        type: question.questionType,
                        options: question.options?.length || 0
                      });
                      return (
                        <div key={`question-${question._id}-${currentQuestionIndex}`} className="space-y-3 sm:space-y-4">
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-lg sm:text-xl">
                              {currentQuestionIndex + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <label className="block text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">
                                {question.questionText}
                                <span className="text-red-400 ml-1">*</span>
                              </label>
                              {question.questionType === 'multiple-choice' && question.options ? (
                                <div className="space-y-2 sm:space-y-3">
                                  {question.options.map((option, optIndex) => (
                                    <label
                                      key={optIndex}
                                      className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all group ${
                                        answers[question._id] === option
                                          ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
                                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/30'
                                      }`}
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
                                        className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 border-gray-300 focus:ring-purple-500 flex-shrink-0"
                                      />
                                      <span className="text-gray-200 group-hover:text-white transition-colors flex-1 text-sm sm:text-base break-words">{option}</span>
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
                                  rows={6}
                                  required
                                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none text-sm sm:text-base"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })() : (
                      <div className="text-center py-8">
                        <p className="text-red-400">Question not found. Please refresh and try again.</p>
                        <p className="text-gray-400 text-sm mt-2">
                          Current index: {currentQuestionIndex}, Total questions: {questions.length}
                        </p>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between gap-2 sm:gap-3 pt-4 border-t border-white/10">
                      <motion.button
                        type="button"
                        onClick={() => {
                          if (currentQuestionIndex > 0) {
                            setCurrentQuestionIndex(prev => prev - 1);
                            setError('');
                            // Scroll to top of question on navigation
                            if (contentRef.current) {
                              contentRef.current.scrollTop = 0;
                            }
                          }
                        }}
                        disabled={currentQuestionIndex === 0}
                        whileHover={{ scale: currentQuestionIndex === 0 ? 1 : 1.05 }}
                        whileTap={{ scale: currentQuestionIndex === 0 ? 1 : 0.95 }}
                        className="px-3 sm:px-6 py-2 sm:py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base font-semibold hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2"
                      >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
                        <span className="hidden sm:inline">Previous</span>
                      </motion.button>

                      {/* Show Next button if NOT on last question */}
                      {currentQuestionIndex < questions.length - 1 ? (
                        <motion.button
                          type="button"
                          onClick={() => {
                            console.log('🔵 NEXT button clicked');
                            console.log('Current state:', {
                              currentIndex: currentQuestionIndex,
                              totalQuestions: questions.length,
                              isLastQuestion: currentQuestionIndex === questions.length - 1,
                              questionsArray: questions.map((q, idx) => ({ 
                                index: idx,
                                id: q._id, 
                                text: q.questionText?.substring(0, 50) 
                              }))
                            });
                            
                            // Validate current question is answered
                            const currentQuestion = questions[currentQuestionIndex];
                            if (!currentQuestion) {
                              console.error(`❌ Question at index ${currentQuestionIndex} not found. Total questions: ${questions.length}`);
                              setError('Question not found. Please refresh and try again.');
                              return;
                            }
                            
                            console.log('Current question:', {
                              id: currentQuestion._id,
                              text: currentQuestion.questionText,
                              currentAnswer: answers[currentQuestion._id]
                            });
                            
                            if (!answers[currentQuestion._id] || answers[currentQuestion._id].trim() === '') {
                              console.warn('⚠️ Question not answered yet');
                              setError('Please answer this question before proceeding to the next one.');
                              return;
                            }
                            
                            setError('');
                            const nextIndex = currentQuestionIndex + 1;
                            console.log(`➡️ Moving from question ${currentQuestionIndex + 1} to question ${nextIndex + 1} of ${questions.length}`);
                            
                            setCurrentQuestionIndex(nextIndex);
                            console.log('✅ currentQuestionIndex updated to:', nextIndex);
                            
                            // Scroll to top of question on navigation
                            setTimeout(() => {
                              if (contentRef.current) {
                                contentRef.current.scrollTop = 0;
                              }
                            }, 100);
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm sm:text-base font-semibold hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center gap-1 sm:gap-2 shadow-lg shadow-purple-500/30"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.button>
                      ) : (
                        // Show Submit button ONLY on the last question (currentQuestionIndex === questions.length - 1)
                        <motion.button
                          type="submit"
                          disabled={loading || !answers[questions[currentQuestionIndex]?._id] || answers[questions[currentQuestionIndex]?._id]?.trim() === ''}
                          whileHover={{ scale: loading ? 1 : 1.05 }}
                          whileTap={{ scale: loading ? 1 : 0.95 }}
                          className="flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm sm:text-base font-semibold hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 shadow-lg shadow-purple-500/30"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span>Submit All Answers</span>
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-red-400">No questions available or invalid question index.</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Questions loaded: {questions.length}, Current index: {currentQuestionIndex}
                    </p>
                  </div>
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

                {/* Actions - Only show Back button and error handling */}
                {step === 2 && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-4 border-t border-white/10">
                    <motion.button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setAnswers({});
                        setError('');
                        setCurrentQuestionIndex(0);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 sm:px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base font-semibold hover:bg-white/10 transition-all"
                    >
                      Back to Level Selection
                    </motion.button>
                    {error && (
                      <motion.button
                        type="button"
                        onClick={() => {
                          // Retry - reset answers and clear error
                          setError('');
                          // Reset all answers to empty and go back to first question
                          const resetAnswers = {};
                          questions.forEach(q => {
                            resetAnswers[q._id] = '';
                          });
                          setAnswers(resetAnswers);
                          setCurrentQuestionIndex(0);
                          // Scroll to top
                          if (contentRef.current) {
                            contentRef.current.scrollTop = 0;
                          }
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 sm:px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-sm sm:text-base font-semibold hover:bg-yellow-500/30 transition-all"
                      >
                        Reset All
                      </motion.button>
                    )}
                  </div>
                )}
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TechSkillJoinModal;

