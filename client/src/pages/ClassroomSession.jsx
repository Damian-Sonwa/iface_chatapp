import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Video,
  Clock,
  Users,
  ExternalLink,
  BookOpen,
  Plus,
  X
} from 'lucide-react';

const ClassroomSession = () => {
  const { skill, classId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [materialModal, setMaterialModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [materialForm, setMaterialForm] = useState({
    title: '',
    type: 'link',
    link: '',
    description: ''
  });
  const classroomId = location.state?.classroomId;
  const canManage = user?.role === 'admin' || user?.isAdmin || user?.role === 'instructor';

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        setError('');
        if (!classroomId) {
          setError('Missing classroom reference');
          return;
        }
        const response = await api.get(`/classrooms/${classroomId}/sessions/${classId}`);
        setSession(response.data.session);
      } catch (err) {
        console.error('Session detail error:', err);
        setError(err.response?.data?.error || 'Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [classId, classroomId]);

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...materialForm,
        sessionId: classId
      };
      await api.post(`/classrooms/${classroomId}/materials`, payload);
      const refreshed = await api.get(`/classrooms/${classroomId}/sessions/${classId}`);
      setSession(refreshed.data.session);
      setMaterialModal(false);
      setMaterialForm({ title: '', type: 'link', link: '', description: '' });
    } catch (err) {
      console.error('Add material error:', err);
      alert(err.response?.data?.error || 'Failed to add material');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const response = await api.post(`/classrooms/${classroomId}/sessions/${classId}/comments`, { content: commentText.trim() });
      setCommentText('');
      setSession(response.data.session);
    } catch (err) {
      console.error('Comment error:', err);
      alert(err.response?.data?.error || 'Failed to post comment');
    }
  };

  if (!classroomId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-gray-400">
        Missing classroom context. Please navigate from the skill page.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-gray-400">
        Loading session...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 px-4 pt-24 pb-16 md:px-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <button onClick={() => navigate(-1)} className="text-sm text-indigo-300 hover:text-indigo-200">← Back</button>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-indigo-200 uppercase tracking-wide">{skill?.replace(/-/g, ' ')}</p>
              <h1 className="text-3xl font-semibold mb-2">{session.title}</h1>
              <p className="text-sm text-indigo-100 max-w-2xl">{session.description}</p>
            </div>
            <Video className="w-8 h-8 text-indigo-200" />
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-indigo-100 mt-4">
            {session.startTime && (
              <span className="inline-flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(session.startTime).toLocaleString()}</span>
            )}
            <span className="inline-flex items-center gap-2"><Users className="w-4 h-4" /> Instructor: {session.instructor?.username || 'TBA'}</span>
          </div>
          <div className="flex gap-3 mt-6">
            {session.meetingLink && (
              <a href={session.meetingLink} target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-100">
                Join session <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {session.recordingLink && (
              <a href={session.recordingLink} target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-gray-200">
                Watch recording <BookOpen className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Materials & resources</h2>
            {canManage && (
              <button onClick={() => setMaterialModal(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-sm text-indigo-100">
                <Plus className="w-4 h-4" /> Upload
              </button>
            )}
          </div>
          {session.materials && session.materials.length > 0 ? (
            <div className="space-y-3">
              {session.materials.map(material => (
                <div key={material._id} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{material.title}</p>
                      <p className="text-xs text-gray-400">{material.description}</p>
                    </div>
                    <a href={material.link} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-indigo-300 hover:text-indigo-200">
                      View <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-2">Uploaded by {material.uploadedBy?.username || 'Instructor'} on {new Date(material.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-gray-400">No materials uploaded yet.</div>
          )}
        </section>

        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl text-white">
          <h2 className="text-lg font-semibold mb-4">Ask a question</h2>
          <form onSubmit={handleAddComment} className="space-y-3">
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              rows={3}
              placeholder="Share your question or feedback..."
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white"
            />
            <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-sm">Post comment</button>
          </form>
          {session.discussion && session.discussion.length > 0 && (
            <div className="mt-6 space-y-4">
              {session.discussion.map(entry => (
                <div key={entry._id || entry.createdAt} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-200">
                  <p className="font-semibold text-white">{entry.user?.username || 'Learner'}</p>
                  <p className="mt-1 text-gray-200">{entry.content}</p>
                  <p className="mt-2 text-[11px] text-gray-500">{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {materialModal && (
          <motion.form
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onSubmit={handleAddMaterial}
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          >
            <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Upload material</h3>
                <button type="button" onClick={() => setMaterialModal(false)} className="p-2 rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase">Title</label>
                <input
                  value={materialForm.title}
                  onChange={e => setMaterialForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase">Description</label>
                <textarea
                  value={materialForm.description}
                  onChange={e => setMaterialForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase">Type</label>
                <select
                  value={materialForm.type}
                  onChange={e => setMaterialForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
                >
                  <option value="link">Link</option>
                  <option value="pdf">PDF</option>
                  <option value="slides">Slides</option>
                  <option value="video">Video</option>
                  <option value="github">GitHub</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase">Link</label>
                <input
                  value={materialForm.link}
                  onChange={e => setMaterialForm(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
                  placeholder="https://"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setMaterialModal(false)} className="px-4 py-2 rounded-xl border border-white/10 text-sm text-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-sm">Save</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClassroomSession;
