import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, User, MessageSquare, X } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const GroupJoinRequestsPanel = ({ roomId, onClose }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (roomId) {
      fetchRequests();
    }
  }, [roomId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/group-join-requests/room/${roomId}`);
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching join requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setProcessing(requestId);
      await api.post(`/group-join-requests/${requestId}/approve`);
      await fetchRequests();
      // Refresh rooms in parent component if needed
      if (onClose) {
        setTimeout(() => {
          window.location.reload(); // Simple refresh - could be improved with state management
        }, 1000);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert(error.response?.data?.error || 'Failed to approve request');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId, reason = '') => {
    const rejectionReason = reason || prompt('Please provide a reason for rejection (optional):') || 'Request rejected';
    
    try {
      setProcessing(requestId);
      await api.post(`/group-join-requests/${requestId}/reject`, { reason: rejectionReason });
      await fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert(error.response?.data?.error || 'Failed to reject request');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-800/90 to-gray-900/90">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Join Requests</h2>
          <p className="text-sm text-gray-400">{requests.length} pending</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Requests List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400">No pending join requests</p>
          </div>
        ) : (
          requests.map((request) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-all"
            >
              {/* User Info */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-400/50 flex items-center justify-center text-purple-200 font-semibold">
                  {request.userId?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{request.userId?.username || 'Unknown User'}</h3>
                  <p className="text-sm text-gray-400">{request.userId?.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Requested {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Pending
                </div>
              </div>

              {/* Question */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Question</p>
                <p className="text-sm text-gray-300 bg-white/5 p-2 rounded-lg">{request.question}</p>
              </div>

              {/* Answer */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Answer</p>
                <p className="text-sm text-white bg-white/5 p-3 rounded-lg">{request.answer}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => handleApprove(request._id)}
                  disabled={processing === request._id}
                  whileHover={{ scale: processing ? 1 : 1.05 }}
                  whileTap={{ scale: processing ? 1 : 0.95 }}
                  className="flex-1 py-2 px-4 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 font-semibold hover:bg-green-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing === request._id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </>
                  )}
                </motion.button>
                <motion.button
                  onClick={() => handleReject(request._id)}
                  disabled={processing === request._id}
                  whileHover={{ scale: processing ? 1 : 1.05 }}
                  whileTap={{ scale: processing ? 1 : 0.95 }}
                  className="flex-1 py-2 px-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default GroupJoinRequestsPanel;

