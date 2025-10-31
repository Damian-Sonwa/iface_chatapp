import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Vote, Users } from 'lucide-react';
import api from '../utils/api';
import { getSocket } from '../utils/socket';

const PollDisplay = ({ poll, currentUser, onVote }) => {
  const socket = getSocket();
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    if (!poll || !currentUser) return;
    
    // Check if user has voted
    const userId = currentUser._id || currentUser.id;
    let userVotedIndex = -1;
    
    poll.options.forEach((option, idx) => {
      const hasVotedOnOption = option.votes.some(v => 
        (v._id || v.id || v).toString() === userId.toString()
      );
      if (hasVotedOnOption) {
        userVotedIndex = idx;
        setUserVote(idx);
      }
    });
    
    setHasVoted(userVotedIndex >= 0);
    
    // Calculate total votes
    const total = poll.options.reduce((sum, option) => sum + (option.votes?.length || 0), 0);
    setTotalVotes(total);
  }, [poll, currentUser]);

  const handleVote = async (optionIndex) => {
    if (hasVoted || !poll || !currentUser) return;
    
    try {
      const response = await api.post(`/polls/${poll._id}/vote`, { optionIndex });
      setHasVoted(true);
      setUserVote(optionIndex);
      onVote?.(response.data.poll);
      
      // Broadcast vote update via socket
      if (socket && poll.room) {
        socket.emit('poll:voted', { roomId: poll.room, poll: response.data.poll });
      }
    } catch (error) {
      console.error('Vote error:', error);
      alert('Failed to vote. Please try again.');
    }
  };

  const getPercentage = (votes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-800 shadow-lg"
    >
      {/* Poll Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Vote className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {poll.question}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Users className="w-3 h-3" />
            <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {poll.options.map((option, idx) => {
          const votes = option.votes?.length || 0;
          const percentage = getPercentage(votes);
          const isUserVote = userVote === idx;
          const isWinning = !hasVoted && votes > 0 && votes === Math.max(...poll.options.map(o => o.votes?.length || 0));

          return (
            <motion.button
              key={idx}
              onClick={() => handleVote(idx)}
              disabled={hasVoted}
              whileHover={!hasVoted ? { scale: 1.02 } : {}}
              whileTap={!hasVoted ? { scale: 0.98 } : {}}
              className={`w-full relative overflow-hidden rounded-xl p-3 text-left transition ${
                hasVoted
                  ? isUserVote
                    ? 'border-2 border-purple-500 bg-purple-100 dark:bg-purple-900/30'
                    : 'border border-purple-200 dark:border-purple-800 bg-white/50 dark:bg-gray-700/50'
                  : 'border border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-gray-700/80 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer'
              }`}
            >
              {/* Progress Bar */}
              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5 }}
                  className={`absolute inset-0 ${
                    isUserVote
                      ? 'bg-gradient-to-r from-purple-400 to-purple-600'
                      : 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700'
                  }`}
                />
              )}

              {/* Content */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <span className={`font-medium text-sm ${hasVoted && isUserVote ? 'text-purple-900 dark:text-purple-100' : 'text-gray-900 dark:text-gray-100'}`}>
                  {option.text}
                </span>
                {hasVoted && (
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${isUserVote ? 'text-purple-900 dark:text-purple-100' : 'text-gray-600 dark:text-gray-400'}`}>
                      {percentage}%
                    </span>
                    {isUserVote && (
                      <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                        Your vote
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {!hasVoted && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
          Tap an option to vote
        </p>
      )}
    </motion.div>
  );
};

export default PollDisplay;

