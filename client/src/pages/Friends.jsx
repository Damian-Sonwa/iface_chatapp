import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, UserPlus, Check, X, Phone, MessageSquare, Loader2, Users, Copy, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Friends = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'add'
  const [inviteLink, setInviteLink] = useState('');
  const [inviteGenerating, setInviteGenerating] = useState(false);
  const [inviteError, setInviteError] = useState('');

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await api.get('/friends');
      setFriends(response.data.friends || []);
    } catch (error) {
      console.error('Fetch friends error:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await api.get('/friends/requests');
      setFriendRequests(response.data.requests || []);
    } catch (error) {
      console.error('Fetch friend requests error:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Try phone number first (remove common formatting)
      const cleanedPhone = searchQuery.replace(/\s+/g, '').replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '');
      const isPhoneNumber = /^\+?[1-9]\d{1,14}$/.test(cleanedPhone);

      const response = await api.post('/friends/search', {
        phoneNumber: isPhoneNumber ? cleanedPhone : null,
        username: !isPhoneNumber ? searchQuery : null
      });

      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Search error:', error);
      alert(error.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await api.post('/friends/request', { userId });
      alert('Friend request sent!');
      fetchFriendRequests();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.post('/friends/accept', { requestId });
      await fetchFriends();
      await fetchFriendRequests();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.post('/friends/reject', { requestId });
      await fetchFriendRequests();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to reject request');
    }
  };

  const handleStartChat = async (friendId) => {
    try {
      const response = await api.get(`/private/${friendId}`);
      // Navigate to chat with the chat ID in state
      navigate('/chat', { state: { chatId: response.data.chat._id, chatType: 'private' } });
    } catch (error) {
      console.error('Start chat error:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  const generateInviteLink = async () => {
    if (inviteGenerating) return;
    try {
      setInviteGenerating(true);
      setInviteError('');
      const response = await api.post('/invite/create');
      const link = response.data?.link;
      if (link) {
        setInviteLink(link);
        try {
          await navigator.clipboard.writeText(link);
          alert('Invite link copied to clipboard!');
        } catch (err) {
          console.error('Clipboard copy failed:', err);
          alert(`Invite link ready: ${link}`);
        }
      }
    } catch (error) {
      console.error('Invite link error:', error);
      const message = error.response?.data?.error || 'Failed to generate invite link';
      setInviteError(message);
      alert(message);
    } finally {
      setInviteGenerating(false);
    }
  };

  const shareInviteLink = async () => {
    try {
      if (!inviteLink) {
        await generateInviteLink();
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: 'Join me on Chaturway',
          text: 'Let’s chat together on Chaturway! Use this invite link to join:',
          url: inviteLink
        });
      } else {
        const shareText = `Join me on Chaturway! ${inviteLink}`;
        const encoded = encodeURIComponent(shareText);
        window.open(`https://wa.me/?text=${encoded}`, '_blank');
      }
    } catch (error) {
      console.error('Share invite error:', error);
      alert('Unable to open share dialog. The link has been copied instead.');
      try {
        await navigator.clipboard.writeText(inviteLink);
      } catch (err) {
        console.error('Clipboard fallback failed:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="text-3xl font-bold">Friends</h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={generateInviteLink}
              disabled={inviteGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition disabled:opacity-60"
            >
              {inviteGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Generate Invite Link
                </>
              )}
            </button>
            <button
              onClick={shareInviteLink}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Share2 className="w-4 h-4" /> Share Invite
            </button>
          </div>
        </div>

        {inviteLink && (
          <div className="mb-6 p-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/40 flex flex-wrap items-center gap-3 text-sm text-purple-700 dark:text-purple-200">
            <span className="font-semibold">Invite Link:</span>
            <span className="break-all text-purple-800 dark:text-purple-50">{inviteLink}</span>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(inviteLink);
                  alert('Invite link copied to clipboard');
                } catch (error) {
                  console.error('Copy invite error:', error);
                  alert('Unable to copy link automatically');
                }
              }}
              className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
        )}

        {inviteError && (
          <div className="mb-4 text-sm text-red-500">{inviteError}</div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'friends', label: 'Friends', count: friends.length },
            { id: 'requests', label: 'Requests', count: friendRequests.length },
            { id: 'add', label: 'Add Friend', count: null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="space-y-2">
            {friends.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 flex flex-col items-center gap-4">
                <Users className="w-16 h-16 mx-auto opacity-50" />
                <div>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">No friends yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add friends to start messaging instantly.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  <button
                    onClick={() => setActiveTab('add')}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition"
                  >
                    Add Friend
                  </button>
                  <button
                    onClick={shareInviteLink}
                    className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    Share Invite Link
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">You can search by phone number or username under the “Add Friend” tab.</p>
              </div>
            ) : (
              friends.map((friend) => (
                <motion.div
                  key={friend._id || friend.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    {friend.avatar ? (
                      <img
                        src={friend.avatar}
                        alt={friend.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold">
                        {friend.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{friend.username}</h3>
                      {friend.phoneNumber && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {friend.phoneNumber}
                        </p>
                      )}
                      {friend.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{friend.bio}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartChat(friend._id || friend.id)}
                      className="p-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
                      title="Start Chat"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-2">
            {friendRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>No pending friend requests</p>
              </div>
            ) : (
              friendRequests.map((request) => (
                <motion.div
                  key={request._id || request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    {request.from?.avatar ? (
                      <img
                        src={request.from.avatar}
                        alt={request.from.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold">
                        {request.from?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{request.from?.username}</h3>
                      {request.from?.phoneNumber && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {request.from.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptRequest(request._id || request.id)}
                      className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
                      title="Accept"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request._id || request.id)}
                      className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                      title="Reject"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Add Friend Tab */}
        {activeTab === 'add' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-semibold mb-2">Search by Phone Number or Username</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter phone number or username"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading || !searchQuery.trim()}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold mb-2">Search Results</h3>
                {searchResults.map((result) => {
                  const isFriend = friends.some(f => (f._id || f.id) === (result._id || result.id));
                  return (
                    <motion.div
                      key={result._id || result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        {result.avatar ? (
                          <img
                            src={result.avatar}
                            alt={result.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold">
                            {result.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{result.username}</h3>
                          {result.phoneNumber && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {result.phoneNumber}
                            </p>
                          )}
                          {result.bio && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{result.bio}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        {isFriend ? (
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                            Friend
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendRequest(result._id || result.id)}
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition flex items-center gap-2"
                          >
                            <UserPlus className="w-4 h-4" />
                            Add Friend
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No users found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;

