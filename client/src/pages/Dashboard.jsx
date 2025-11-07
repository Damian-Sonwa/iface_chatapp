import { useEffect, useMemo, useState } from 'react';
import Joyride from 'react-joyride';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Sparkles, Users, MessageSquare, User, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const fetchRooms = async () => {
  const response = await api.get('/rooms');
  return response.data.rooms || [];
};

const fetchPrivateChats = async () => {
  const response = await api.get('/private');
  return response.data.chats || [];
};

const Dashboard = () => {
  const { user } = useAuth();
  const [tourRun, setTourRun] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);

  const { data: rooms = [] } = useQuery({ queryKey: ['dashboardRooms'], queryFn: fetchRooms, staleTime: 30000 });
  const { data: privateChats = [] } = useQuery({ queryKey: ['dashboardPrivateChats'], queryFn: fetchPrivateChats, staleTime: 30000 });

  useEffect(() => {
    if (localStorage.getItem('showAppTour') === '1') {
      setTourRun(true);
      localStorage.removeItem('showAppTour');
    }
  }, []);

  const profileCompletion = user?.profileCompletion ?? 0;
  const recommendations = useMemo(() => {
    if (!user?.skills?.length) {
      return [
        {
          title: 'Explore Tech Skill Groups',
          description: 'Join communities by domains to collaborate and upskill quickly.',
          action: '/tech-skills'
        },
        {
          title: 'Complete your profile',
          description: 'Add your bio and photo to improve your visibility with collaborators.',
          action: '/settings'
        }
      ];
    }

    return user.skills.slice(0, 3).map(skill => ({
      title: `Spotlight: ${skill}`,
      description: `Discover discussions and groups tailored to ${skill.toLowerCase()}.`,
      action: '/tech-skills'
    }));
  }, [user]);

  const tourSteps = [
    {
      target: '[data-tour="dashboard-overview"]',
      content: 'This dashboard keeps track of your progress, reminders, and quick actions.'
    },
    {
      target: '[data-tour="dashboard-groups"]',
      content: 'See and join communities based on your selected skills or interests.'
    },
    {
      target: '[data-tour="dashboard-messages"]',
      content: 'Access your latest conversations and jump back into discussions quickly.'
    },
    {
      target: '[data-tour="nav-links"], [data-tour="profile-reminder"]',
      content: 'Use navigation and your profile to customize your experience and settings.'
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status, type, index } = data;
    if (['finished', 'skipped'].includes(status)) {
      setTourRun(false);
    } else if (type === 'step:after') {
      setTourStepIndex(index);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/40 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-28 pb-16 px-4">
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

      <div className="max-w-6xl mx-auto space-y-10">
        <section data-tour="dashboard-overview" className="bg-white/80 dark:bg-gray-900/90 border border-white/20 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.2)] p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Welcome back, {user?.username}!</h1>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                Here’s a snapshot of what’s happening across your communities and conversations.
              </p>
            </div>
            <div data-tour="profile-reminder" className="bg-white/70 dark:bg-gray-800/70 border border-white/20 rounded-2xl px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
              <div className="flex items-center gap-2 font-semibold text-purple-500">
                <Sparkles className="w-4 h-4" /> Profile progress
              </div>
              <div className="mt-2">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div style={{ width: `${profileCompletion}%` }} className="h-full bg-gradient-to-r from-purple-500 to-pink-500" />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Your profile is {profileCompletion}% complete.</p>
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 ${profileCompletion >= 75 ? 'text-green-500' : 'text-gray-400'}`} />
                  <span>{profileCompletion >= 75 ? 'Great job! Your profile stands out.' : 'Complete your bio and avatar to improve discovery.'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid xl:grid-cols-3 gap-6" data-tour="dashboard-groups">
          <div className="xl:col-span-2 bg-white/80 dark:bg-gray-900/90 border border-white/20 backdrop-blur-xl rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Recommended for you</h2>
              <LinkButton to="/tech-skills" label="Discover more" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {recommendations.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-5 rounded-2xl bg-white/70 dark:bg-gray-800/70 border border-white/20 space-y-2"
                >
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                  <LinkButton to={item.action} label="Explore" subtle />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/90 border border-white/20 backdrop-blur-xl rounded-3xl p-6 space-y-4" data-tour="dashboard-messages">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Recent messages</h2>
              <LinkButton to="/chat" label="View all" />
            </div>
            {privateChats.length === 0 ? (
              <EmptyState icon={MessageSquare} message="No recent conversations yet" sub="Start a direct chat from the menu." />
            ) : (
              <div className="space-y-3">
                {privateChats.slice(0, 4).map(chat => {
                  const otherUser = chat.participants?.find(p => (p._id || p.id) !== (user?._id || user?.id));
                  return (
                    <div key={chat._id} className="p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-white/15">
                      <p className="font-semibold text-gray-700 dark:text-gray-100">{otherUser?.username || 'Conversation'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-300 line-clamp-2">{chat.lastMessage?.content || 'No messages yet'}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-900/90 border border-white/20 backdrop-blur-xl rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Your groups</h2>
            <LinkButton to="/tech-skills" label="Join new groups" subtle />
          </div>
          {rooms.length === 0 ? (
            <EmptyState icon={Users} message="You haven’t joined any groups yet" sub="Complete onboarding or browse skill communities to start." />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {rooms.slice(0, 4).map(room => (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-white/15"
                >
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">{room.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{room.description || 'Active tech conversation hub'}</p>
                  <div className="mt-3 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{room.members?.length || 0} members</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const LinkButton = ({ to, label, subtle }) => (
  <Link
    to={to}
    className={`inline-flex items-center gap-2 text-sm font-medium transition ${
      subtle
        ? 'text-purple-500 hover:text-purple-400'
        : 'text-purple-600 hover:text-purple-500'
    }`}
  >
    {label}
    <ArrowRight className="w-4 h-4" />
  </Link>
);

const EmptyState = ({ icon: Icon, message, sub }) => (
  <div className="p-6 rounded-2xl border border-dashed border-white/30 text-center space-y-3 text-gray-500 dark:text-gray-400">
    <Icon className="w-10 h-10 mx-auto text-purple-400" />
    <p className="font-semibold text-gray-700 dark:text-gray-200">{message}</p>
    {sub && <p className="text-sm text-gray-500 dark:text-gray-400">{sub}</p>}
  </div>
);

export default Dashboard;
