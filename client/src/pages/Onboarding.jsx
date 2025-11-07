import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Joyride from 'react-joyride';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles, BookOpen, Users, MessageSquare, User, Shield } from 'lucide-react';

const skillOptions = [
  'Frontend Development',
  'Backend Development',
  'Mobile Development',
  'Data Analysis',
  'Cybersecurity',
  'UI/UX Design',
  'Product Management',
  'DevOps',
  'AI & Machine Learning',
  'Copywriting',
  'Marketing Automation',
  'Cloud Engineering'
];

const levelOptions = ['Beginner', 'Intermediate', 'Professional'];

const StepContainer = ({ title, description, children }) => (
  <div className="max-w-3xl mx-auto bg-white/80 dark:bg-gray-900/90 border border-white/20 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.25)] p-6 md:p-10 space-y-6">
    <div className="space-y-2 text-center">
      <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">{title}</h2>
      {description && <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{description}</p>}
    </div>
    {children}
  </div>
);

const Onboarding = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState(user?.skills || []);
  const [skillLevel, setSkillLevel] = useState(user?.skillLevel || '');
  const [verificationAnswer, setVerificationAnswer] = useState('');
  const [tourRun, setTourRun] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);

  useEffect(() => {
    if (tourRun) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [tourRun]);

  const profileCompletion = useMemo(() => {
    const total = 4;
    let score = 0;
    if (user?.avatarUrl || user?.avatar) score += 1;
    if (user?.bio && user.bio.trim().length > 0) score += 1;
    if (selectedSkills.length > 0) score += 1;
    if (skillLevel) score += 1;
    return Math.round((score / total) * 100);
  }, [user, selectedSkills, skillLevel]);

  const tourSteps = useMemo(() => ([
    {
      target: '[data-tour="tour-dashboard"]',
      content: 'Your dashboard gives quick access to recommendations and your activity summary.'
    },
    {
      target: '[data-tour="tour-groups"]',
      content: 'Discover skill-based communities and collaborative groups tailored to your interests.'
    },
    {
      target: '[data-tour="tour-messages"]',
      content: 'Stay connected with direct and group chats. Conversations live here.'
    },
    {
      target: '[data-tour="tour-profile"]',
      content: 'Keep your profile updated to get personalized matches and visibility.'
    }
  ]), []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.hasOnboarded) {
    return <Navigate to="/dashboard" replace />;
  }

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => prev.includes(skill)
      ? prev.filter(s => s !== skill)
      : [...prev, skill]
    );
  };

  const handleStartTour = () => {
    setTourStepIndex(0);
    setTourRun(true);
  };

  const handleJoyrideCallback = (data) => {
    const { status, type, index } = data;
    if (['finished', 'skipped'].includes(status)) {
      setTourRun(false);
      setStep(prev => prev + 1);
    } else if (type === 'step:after') {
      setTourStepIndex(index);
    }
  };

  const handleComplete = async () => {
    if (selectedSkills.length === 0) {
      alert('Select at least one skill or interest to continue.');
      return;
    }
    if (!skillLevel) {
      alert('Please choose your current level.');
      return;
    }
    if (!rulesAccepted) {
      alert('Please acknowledge the community guidelines to continue.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post('/onboarding/complete', {
        skills: selectedSkills,
        skillLevel,
        verificationAnswer
      });
      setUser?.(response.data.user);
      localStorage.setItem('showAppTour', '1');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Onboarding completion error:', error);
      alert(error.response?.data?.error || 'Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <StepContainer
            title={`Welcome, ${user.username}!`}
            description="We’re excited to have you here. Let’s personalize your experience so you can find the right communities and conversations faster."
          >
            <div className="space-y-8">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { icon: Sparkles, title: 'Tailored Connections', text: 'Join communities that match your interests and grow your skills.' },
                  { icon: Users, title: 'Collaborative Learning', text: 'Share knowledge, get feedback, and build together with peers.' },
                  { icon: MessageSquare, title: 'Vibrant Discussions', text: 'Jump into active chats with professionals across the tech sphere.' }
                ].map((card, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white/60 dark:bg-gray-800/70 border border-white/20 flex flex-col gap-3 items-start">
                    <card.icon className="w-8 h-8 text-purple-500" />
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{card.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{card.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/30"
                >
                  Get Started
                </motion.button>
              </div>
            </div>
          </StepContainer>
        );
      case 1:
        return (
          <StepContainer
            title="Choose your focus areas"
            description="Select the skills or domains you’re exploring. We’ll use these to surface relevant groups and discussions."
          >
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-3">
                {skillOptions.map(skill => {
                  const active = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                        active
                          ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-300'
                          : 'border-white/20 bg-white/40 dark:bg-gray-800/70 text-gray-700 dark:text-gray-200 hover:border-purple-400/50'
                      }`}
                    >
                      <CheckCircle className={`w-5 h-5 ${active ? 'text-purple-500' : 'text-gray-400'}`} />
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">What best describes your current level?</p>
                <div className="flex flex-wrap gap-3">
                  {levelOptions.map(level => (
                    <button
                      key={level}
                      onClick={() => setSkillLevel(level)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                        skillLevel === level
                          ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-300'
                          : 'border-white/20 bg-white/40 dark:bg-gray-800/70 text-gray-700 dark:text-gray-200 hover:border-purple-400/50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Optional: What goals would you like to achieve here?
                </label>
                <textarea
                  value={verificationAnswer}
                  onChange={(e) => setVerificationAnswer(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl bg-white/60 dark:bg-gray-800/70 border border-white/20 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Share your learning goals, expectations, or what you’d like help with."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="px-5 py-2 rounded-xl border border-white/20 text-sm text-gray-600 dark:text-gray-300 hover:bg-white/10"
                >
                  Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep(2)}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500"
                >
                  Continue
                </motion.button>
              </div>
            </div>
          </StepContainer>
        );
      case 2:
        return (
          <StepContainer
            title="Quick tour"
            description="Here’s a snapshot of the core areas you’ll use every day."
          >
            <div className="relative">
              <Joyride
                steps={tourSteps}
                run={tourRun}
                stepIndex={tourStepIndex}
                continuous
                showProgress
                showSkipButton
                callback={handleJoyrideCallback}
                styles={{
                  options: {
                    primaryColor: '#a855f7',
                    textColor: '#1f2937',
                    zIndex: 2000
                  }
                }}
              />
              <div className="grid md:grid-cols-2 gap-4">
                <div data-tour="tour-dashboard" className="p-5 rounded-2xl bg-white/60 dark:bg-gray-800/70 border border-white/20 space-y-2">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Dashboard</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Stay on top of your progress with tailored insights and quick actions.</p>
                </div>
                <div data-tour="tour-groups" className="p-5 rounded-2xl bg-white/60 dark:bg-gray-800/70 border border-white/20 space-y-2">
                  <Users className="w-6 h-6 text-purple-500" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Groups</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Find communities aligned with your interests and skill goals.</p>
                </div>
                <div data-tour="tour-messages" className="p-5 rounded-2xl bg-white/60 dark:bg-gray-800/70 border border-white/20 space-y-2">
                  <MessageSquare className="w-6 h-6 text-purple-500" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Messages</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Start or join conversations to collaborate and learn with peers.</p>
                </div>
                <div data-tour="tour-profile" className="p-5 rounded-2xl bg-white/60 dark:bg-gray-800/70 border border-white/20 space-y-2">
                  <User className="w-6 h-6 text-purple-500" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Profile</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Showcase your skills, journey, and availability for collaborations.</p>
                </div>
              </div>
              {!tourRun && (
                <div className="flex justify-end mt-6 gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-2 rounded-xl border border-white/20 text-sm text-gray-600 dark:text-gray-300 hover:bg-white/10"
                  >
                    Back
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleStartTour}
                    className="px-5 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500"
                  >
                    Start Guided Tour
                  </motion.button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-5 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-white/10"
                  >
                    Skip Tour
                  </button>
                </div>
              )}
            </div>
          </StepContainer>
        );
      case 3:
        return (
          <StepContainer
            title="Complete your profile"
            description="Profiles with photos and bios get more responses and tailored recommendations."
          >
            <div className="space-y-6">
              <div className="bg-white/60 dark:bg-gray-800/70 border border-white/20 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-semibold text-lg">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{user.username}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Profile completion: {profileCompletion}%</p>
                  </div>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Add a profile photo to stand out.</li>
                  <li>• Share a short bio highlighting your expertise or interests.</li>
                  <li>• Keep your skills updated to get better group recommendations.</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2 rounded-xl border border-white/20 text-sm text-gray-600 dark:text-gray-300 hover:bg-white/10"
                >
                  Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep(4)}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500"
                >
                  Continue
                </motion.button>
              </div>
            </div>
          </StepContainer>
        );
      case 4:
        return (
          <StepContainer
            title="Community guidelines"
            description="We’re committed to keeping the community constructive and respectful."
          >
            <div className="space-y-6">
              <div className="bg-white/60 dark:bg-gray-800/70 border border-white/20 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-purple-500">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Quick reminders</span>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Respect others’ time and perspectives.</li>
                  <li>• Keep discussions on-topic and supportive.</li>
                  <li>• Report any suspicious activity or abuse.</li>
                </ul>
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={rulesAccepted}
                    onChange={(e) => setRulesAccepted(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  I agree to follow the community guidelines.
                </label>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-2 rounded-xl border border-white/20 text-sm text-gray-600 dark:text-gray-300 hover:bg-white/10"
                >
                  Back
                </button>
                <motion.button
                  whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/30 disabled:opacity-60"
                >
                  {isSubmitting ? 'Finishing...' : 'Complete onboarding'}
                </motion.button>
              </div>
            </div>
          </StepContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-28 pb-16 px-4">
      <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
    </div>
  );
};

export default Onboarding;
