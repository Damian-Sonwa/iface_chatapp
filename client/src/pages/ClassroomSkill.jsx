import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Video, Clock, Users, Calendar as CalendarIcon, ExternalLink, BookOpen, Sparkles } from 'lucide-react';

const ClassroomSkill = () => {
  const { skill } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [skillInfo, setSkillInfo] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/classrooms/skill/${skill}/sessions`);
        setSkillInfo(response.data.skill);
        setSessions(response.data.sessions || []);
      } catch (err) {
        console.error('Skill sessions error:', err);
        setError(err.response?.data?.error || 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [skill]);

  const groupedSessions = useMemo(() => {
    const upcoming = [];
    const recorded = [];
    const past = [];
    sessions.forEach(session => {
      const startDate = session.startTime ? new Date(session.startTime) : null;
      if (session.sessionType === 'recorded') {
        recorded.push({ ...session, startDate });
      } else if (startDate && startDate >= new Date()) {
        upcoming.push({ ...session, startDate });
      } else {
        past.push({ ...session, startDate });
      }
    });
    return { upcoming, recorded, past };
  }, [sessions]);

  const handleJoin = (session) => {
    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank', 'noopener');
    }
  };

  const handleViewDetails = (session) => {
    const classroomId = session.classroom?._id || session.classroom;
    navigate(`/classroom/${skill}/${session._id}`, { state: { classroomId } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center text-gray-400">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 px-4 pt-24 pb-16 md:px-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <button onClick={() => navigate(-1)} className="text-sm text-indigo-300 hover:text-indigo-200 mb-3">← Back</button>
          <h1 className="text-3xl font-bold text-white mb-2">{skillInfo?.name || 'Classroom'}</h1>
          <p className="text-gray-300">Browse scheduled classes and recordings for this discipline. Join live or revisit past sessions to reinforce learning.</p>
        </div>

        {error && <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300">{error}</div>}

        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Upcoming live sessions</h2>
            <span className="text-sm text-gray-400">{groupedSessions.upcoming.length} scheduled</span>
          </header>
          {groupedSessions.upcoming.length === 0 ? (
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 text-gray-400">No live sessions scheduled yet.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {groupedSessions.upcoming.map(session => (
                <motion.div key={session._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 backdrop-blur-xl text-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">{session.title}</p>
                      <p className="text-xs text-indigo-200">{session.classroomName}</p>
                    </div>
                    <Video className="w-5 h-5 text-indigo-200" />
                  </div>
                  <p className="text-sm text-indigo-100 mt-2 line-clamp-3">{session.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-indigo-100 mt-3">
                    {session.startDate && (
                      <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" />{session.startDate.toLocaleString()}</span>
                    )}
                    <span className="inline-flex items-center gap-1"><Users className="w-4 h-4" />Instructor: {session.instructor?.username || 'TBA'}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <button onClick={() => handleViewDetails(session)} className="inline-flex items-center gap-2 text-sm text-indigo-100 hover:text-white">
                      Details <BookOpen className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleJoin(session)} className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white">
                      Join <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Recorded sessions</h2>
          {groupedSessions.recorded.length === 0 ? (
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 text-gray-400">No recordings available yet.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupedSessions.recorded.map(session => (
                <div key={session._id} className="p-5 rounded-2xl border border-white/10 bg-white/5 text-gray-200">
                  <p className="font-semibold text-white">{session.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{session.classroomName}</p>
                  <p className="text-xs text-gray-500 mt-3 inline-flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> {session.startDate ? session.startDate.toLocaleString() : 'Recorded'}</p>
                  {session.recordingLink ? (
                    <a href={session.recordingLink} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200 mt-3">
                      Watch recording <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="mt-3 text-xs text-gray-500 inline-flex items-center gap-1"><Sparkles className="w-3 h-3" />Recording coming soon</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {groupedSessions.past.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Past sessions</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupedSessions.past.slice(-6).map(session => (
                <div key={session._id} className="p-5 rounded-2xl border border-white/10 bg-white/5 text-gray-200">
                  <p className="font-semibold text-white">{session.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{session.classroomName}</p>
                  <p className="text-xs text-gray-500 mt-3 inline-flex items-center gap-1"><Clock className="w-4 h-4" /> {session.startDate ? session.startDate.toLocaleString() : 'Past session'}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ClassroomSkill;
