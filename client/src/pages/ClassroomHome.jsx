import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Video,
  Clock,
  Users,
  Calendar as CalendarIcon,
  ExternalLink,
  Plus,
  BookOpen,
  Sparkles,
  CheckCircle,
  X,
  MapPin,
  ChevronRight
} from 'lucide-react';

const slugify = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const ClassroomHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [classroomsBySkill, setClassroomsBySkill] = useState({});
  const [sessionsBySkill, setSessionsBySkill] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscribing, setSubscribing] = useState({});
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    classroomId: '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    meetingLink: '',
    meetingPlatform: 'Zoom',
    sessionType: 'live'
  });
  const [scheduling, setScheduling] = useState(false);

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin' || user?.isAdmin;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const skillsRes = await api.get('/tech-skills');
        const skillList = skillsRes.data.skills || [];
        setSkills(skillList);

        const classroomMap = {};
        const sessionMap = {};

        await Promise.all(skillList.map(async (skill) => {
          try {
            const [classroomRes, sessionRes] = await Promise.all([
              api.get(`/classrooms/skill/${skill._id}`),
              api.get(`/classrooms/skill/${slugify(skill.name)}/sessions`)
            ]);
            classroomMap[skill._id] = classroomRes.data.classrooms || [];
            sessionMap[skill._id] = sessionRes.data.sessions || [];
          } catch (err) {
            classroomMap[skill._id] = [];
            sessionMap[skill._id] = [];
            console.error('Classroom fetch error', err);
          }
        }));

        setClassroomsBySkill(classroomMap);
        setSessionsBySkill(sessionMap);
      } catch (err) {
        console.error('Classroom home error:', err);
        setError(err.response?.data?.error || 'Failed to load classroom data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const allSessions = useMemo(() => {
    const sessions = Object.values(sessionsBySkill).flat();
    return sessions
      .map(session => ({
        ...session,
        startTime: session.startTime ? new Date(session.startTime) : null
      }))
      .sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
  }, [sessionsBySkill]);

  const upcomingSessions = allSessions.filter(session => session.startTime && session.startTime >= new Date());
  const pastSessions = allSessions.filter(session => !session.startTime || session.startTime < new Date());

  const handleSubscribe = async (classroomId, skillId) => {
    setSubscribing(prev => ({ ...prev, [classroomId]: true }));
    try {
      const res = await api.post(`/classrooms/${classroomId}/subscribe`);
      if (res.data.message) {
        const refreshed = await api.get(`/classrooms/skill/${skillId}`);
        setClassroomsBySkill(prev => ({
          ...prev,
          [skillId]: refreshed.data.classrooms || []
        }));
        if (res.data.room) {
          navigate('/chat', { state: { chatId: res.data.room._id, chatType: 'room' } });
        }
      }
    } catch (err) {
      console.error('Subscribe error:', err);
      alert(err.response?.data?.error || 'Subscription failed');
    } finally {
      setSubscribing(prev => ({ ...prev, [classroomId]: false }));
    }
  };

  const handleUnsubscribe = async (classroomId, skillId) => {
    setSubscribing(prev => ({ ...prev, [classroomId]: true }));
    try {
      await api.delete(`/classrooms/${classroomId}/subscribe`);
      const refreshed = await api.get(`/classrooms/skill/${skillId}`);
      setClassroomsBySkill(prev => ({
        ...prev,
        [skillId]: refreshed.data.classrooms || []
      }));
    } catch (err) {
      console.error('Unsubscribe error:', err);
      alert(err.response?.data?.error || 'Unsubscribe failed');
    } finally {
      setSubscribing(prev => ({ ...prev, [classroomId]: false }));
    }
  };

  const handleOpenClassroom = (classroom) => {
    if (classroom.isSubscribed && classroom.roomId) {
      const roomId = classroom.roomId._id || classroom.roomId;
      navigate('/chat', { state: { chatId: roomId, chatType: 'room' } });
    }
  };

  const handleJoinSession = (session) => {
    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank', 'noopener');
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleForm.classroomId) {
      alert('Select a classroom');
      return;
    }
    try {
      setScheduling(true);
      const payload = {
        ...scheduleForm,
        startTime: scheduleForm.startTime ? new Date(scheduleForm.startTime).toISOString() : null,
        endTime: scheduleForm.endTime ? new Date(scheduleForm.endTime).toISOString() : null
      };
      await api.post(`/classrooms/${scheduleForm.classroomId}/sessions`, payload);
      setScheduleOpen(false);
      setScheduleForm({
        classroomId: '',
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        meetingLink: '',
        meetingPlatform: 'Zoom',
        sessionType: 'live'
      });
      const classroom = skills.find(skill => (classroomsBySkill[skill._id] || []).some(cls => cls._id === payload.classroomId));
      if (classroom) {
        const sessionsRes = await api.get(`/classrooms/skill/${slugify(classroom.name)}/sessions`);
        setSessionsBySkill(prev => ({
          ...prev,
          [classroom._id]: sessionsRes.data.sessions || []
        }));
      }
    } catch (err) {
      console.error('Schedule error:', err);
      alert(err.response?.data?.error || 'Failed to schedule session');
    } finally {
      setScheduling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading classrooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 px-4 pb-24 pt-24 md:px-10">
      {isInstructor && (
        <button
          onClick={() => setScheduleOpen(true)}
          className="fixed bottom-6 right-6 z-20 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Class</span>
        </button>
      )}

      <div className="max-w-7xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
        >
          <h1 className="text-4xl font-bold text-white mb-3">Classroom Hub</h1>
          <p className="text-gray-300 max-w-3xl">
            Join live sessions, access curated materials, and stay ahead in your tech journey. Subscribe to classrooms aligned with your skills and receive reminders for upcoming lessons.
          </p>
        </motion.div>

        {error && (
          <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300">{error}</div>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Upcoming Live Sessions</h2>
          </div>
          {upcomingSessions.length === 0 ? (
            <div className="p-6 border border-white/10 rounded-2xl text-gray-400 bg-white/5">No upcoming sessions yet. Check back soon!</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSessions.slice(0, 6).map(session => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-xl text-white space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/40">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{session.title}</p>
                      <p className="text-xs text-indigo-200">{session.classroomName}</p>
                    </div>
                  </div>
                  <p className="text-sm text-indigo-100 line-clamp-2">{session.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-indigo-100">
                    {session.startTime && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {session.startTime.toLocaleString()}
                      </span>
                    )}
                    {session.meetingPlatform && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {session.meetingPlatform}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-indigo-200">
                      Instructor: {session.instructor?.username || 'TBA'}
                    </div>
                    <button
                      onClick={() => handleJoinSession(session)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white"
                    >
                      Join
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Classroom Directory</h2>
          {skills.map(skill => {
            const classrooms = classroomsBySkill[skill._id] || [];
            return (
              <div key={skill._id} className="border border-white/10 rounded-3xl overflow-hidden">
                <div className="px-6 py-4 bg-white/5 backdrop-blur-sm border-b border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{skill.name}</p>
                    <p className="text-sm text-gray-400">{skill.description}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/classroom/${slugify(skill.name)}`)}
                    className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200"
                  >
                    View sessions
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 grid gap-4 md:grid-cols-2">
                  {classrooms.length === 0 ? (
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-gray-400">
                      No classrooms available yet.
                    </div>
                  ) : (
                    classrooms.map(classroom => {
                      const isSubscribed = classroom.isSubscribed;
                      const loadingState = subscribing[classroom._id];
                      return (
                        <div key={classroom._id} className={`p-5 rounded-2xl border ${isSubscribed ? 'border-indigo-500/40 bg-indigo-500/15' : 'border-white/10 bg-white/5'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold text-white">{classroom.name}</p>
                              <p className="text-sm text-gray-400 line-clamp-2">{classroom.description}</p>
                            </div>
                            {isSubscribed && <CheckCircle className="w-5 h-5 text-green-400" />}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-300 mt-3">
                            <span className="inline-flex items-center gap-1"><Users className="w-4 h-4" /> {classroom.subscriberCount || 0}</span>
                            {classroom.price > 0 ? (
                              <span className="inline-flex items-center gap-1"><Sparkles className="w-4 h-4" /> ${classroom.price}</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-green-400"><Sparkles className="w-4 h-4" /> Free</span>
                            )}
                          </div>
                          <div className="flex gap-2 mt-4">
                            {isSubscribed ? (
                              <>
                                <button
                                  onClick={() => handleOpenClassroom(classroom)}
                                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm"
                                >
                                  <BookOpen className="w-4 h-4" /> Open
                                </button>
                                <button
                                  disabled={loadingState}
                                  onClick={() => handleUnsubscribe(classroom._id, skill._id)}
                                  className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-sm text-white disabled:opacity-50"
                                >
                                  {loadingState ? '...' : 'Unsubscribe'}
                                </button>
                              </>
                            ) : (
                              <button
                                disabled={loadingState}
                                onClick={() => handleSubscribe(classroom._id, skill._id)}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm disabled:opacity-50"
                              >
                                <GraduationCap className="w-4 h-4" />
                                {loadingState ? 'Subscribing...' : 'Subscribe'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {pastSessions.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Recent Sessions</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastSessions.slice(-6).map(session => (
                <div key={session._id} className="p-5 rounded-2xl border border-white/10 bg-white/5 text-gray-200">
                  <p className="font-semibold text-white mb-1">{session.title}</p>
                  <p className="text-xs text-gray-400 mb-2">{session.classroomName}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> {session.startTime ? session.startTime.toLocaleString() : 'Recorded session'}</p>
                  {session.recordingLink && (
                    <a href={session.recordingLink} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200 mt-3">
                      View recording <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <AnimatePresence>
        {scheduleOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
          >
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onSubmit={handleSchedule}
              className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Schedule a class</h3>
                <button type="button" onClick={() => setScheduleOpen(false)} className="p-2 rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase">Classroom</label>
                  <select
                    value={scheduleForm.classroomId}
                    onChange={e => setScheduleForm(prev => ({ ...prev, classroomId: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
                    required
                  >
                    <option value="">Select classroom</option>
                    {skills.map(skill => (
                      (classroomsBySkill[skill._id] || []).map(cls => (
                        <option key={cls._id} value={cls._id}>{skill.name} · {cls.name}</option>
                      ))
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase">Title</label>
                  <input
                    value={scheduleForm.title}
                    onChange={e => setScheduleForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase">Description</label>
                  <textarea
                    value={scheduleForm.description}
                    onChange={e => setScheduleForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 uppercase">Start time</label>
                    <input
                      type="datetime-local"
                      value={scheduleForm.startTime}
                      onChange={e => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase">End time</label>
                    <input
                      type="datetime-local"
                      value={scheduleForm.endTime}
                      onChange={e => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase">Meeting link</label>
                  <input
                    value={scheduleForm.meetingLink}
                    onChange={e => setScheduleForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                    placeholder="https://"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 uppercase">Platform</label>
                    <select
                      value={scheduleForm.meetingPlatform}
                      onChange={e => setScheduleForm(prev => ({ ...prev, meetingPlatform: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
                    >
                      <option value="Zoom">Zoom</option>
                      <option value="Google Meet">Google Meet</option>
                      <option value="Teams">Microsoft Teams</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase">Session type</label>
                    <select
                      value={scheduleForm.sessionType}
                      onChange={e => setScheduleForm(prev => ({ ...prev, sessionType: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
                    >
                      <option value="live">Live</option>
                      <option value="recorded">Recorded</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setScheduleOpen(false)} className="px-4 py-2 rounded-xl border border-white/10 text-sm text-gray-300">Cancel</button>
                <button type="submit" disabled={scheduling} className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm disabled:opacity-50">
                  {scheduling ? 'Scheduling...' : 'Schedule'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClassroomHome;
