const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const authController = require('../controllers/authController');

router.use(authController.verifyToken);

/**
 * POST /api/friends/search
 * Search for users by phone number or username
 */
router.post('/search', async (req, res) => {
  try {
    const { phoneNumber, username } = req.body;
    const currentUserId = req.userId;

    if (!phoneNumber && !username) {
      return res.status(400).json({ error: 'Phone number or username is required' });
    }

    const query = {};
    if (phoneNumber) {
      query.phoneNumber = phoneNumber.replace(/\s+/g, '').replace(/-/g, '');
    }
    if (username) {
      query.username = { $regex: username, $options: 'i' };
    }

    // Exclude current user and blocked users
    const currentUser = await User.findById(currentUserId);
    query._id = { 
      $nin: [
        currentUserId,
        ...(currentUser.blockedUsers || []),
        ...(currentUser.blockedBy || [])
      ]
    };

    const users = await User.find(query)
      .select('username email phoneNumber avatar bio status')
      .limit(10);

    res.json({ users });
  } catch (error) {
    console.error('Search friends error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/friends/request
 * Send a friend request
 */
router.post('/request', async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.userId;

    if (userId === currentUserId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already friends
    const currentUser = await User.findById(currentUserId);
    if (currentUser.friends.includes(userId)) {
      return res.status(400).json({ error: 'Already friends' });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: currentUserId, to: userId },
        { from: userId, to: currentUserId }
      ],
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already sent' });
    }

    // Create friend request
    const friendRequest = await FriendRequest.create({
      from: currentUserId,
      to: userId,
      status: 'pending'
    });

    // Add to target user's friend requests array
    targetUser.friendRequests = targetUser.friendRequests || [];
    targetUser.friendRequests.push({
      from: currentUserId,
      status: 'pending',
      createdAt: new Date()
    });
    await targetUser.save();

    console.log(`📩 Friend request sent from ${currentUserId} to ${userId}`);

    res.json({ success: true, friendRequest });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * POST /api/friends/accept
 * Accept a friend request
 */
router.post('/accept', async (req, res) => {
  try {
    const { requestId } = req.body;
    const currentUserId = req.userId;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (friendRequest.to.toString() !== currentUserId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Friend request already processed' });
    }

    // Update request status
    friendRequest.status = 'accepted';
    await friendRequest.save();

    // Add to friends list for both users
    const fromUser = await User.findById(friendRequest.from);
    const toUser = await User.findById(friendRequest.to);

    if (!fromUser.friends.includes(friendRequest.to)) {
      fromUser.friends.push(friendRequest.to);
    }
    if (!toUser.friends.includes(friendRequest.from)) {
      toUser.friends.push(friendRequest.from);
    }

    // Remove from friend requests
    toUser.friendRequests = toUser.friendRequests.filter(
      req => req.from.toString() !== friendRequest.from.toString() || req.status !== 'pending'
    );

    await fromUser.save();
    await toUser.save();

    console.log(`✅ Friend request accepted: ${friendRequest.from} <-> ${friendRequest.to}`);

    res.json({ success: true, friend: fromUser });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/friends/reject
 * Reject a friend request
 */
router.post('/reject', async (req, res) => {
  try {
    const { requestId } = req.body;
    const currentUserId = req.userId;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (friendRequest.to.toString() !== currentUserId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    friendRequest.status = 'rejected';
    await friendRequest.save();

    // Remove from friend requests
    const toUser = await User.findById(friendRequest.to);
    toUser.friendRequests = toUser.friendRequests.filter(
      req => req.from.toString() !== friendRequest.from.toString() || req.status !== 'pending'
    );
    await toUser.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/friends/requests
 * Get all friend requests (pending)
 */
router.get('/requests', async (req, res) => {
  try {
    const currentUserId = req.userId;

    const friendRequests = await FriendRequest.find({
      to: currentUserId,
      status: 'pending'
    }).populate('from', 'username email avatar phoneNumber status');

    res.json({ requests: friendRequests });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/friends
 * Get all friends
 */
router.get('/', async (req, res) => {
  try {
    const currentUserId = req.userId;
    const user = await User.findById(currentUserId).populate('friends', 'username email avatar phoneNumber status bio');
    
    res.json({ friends: user.friends || [] });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE /api/friends/:userId
 * Remove a friend
 */
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove from both friends lists
    currentUser.friends = currentUser.friends.filter(id => id.toString() !== userId);
    targetUser.friends = targetUser.friends.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await targetUser.save();

    // Delete friend requests between them
    await FriendRequest.deleteMany({
      $or: [
        { from: currentUserId, to: userId },
        { from: userId, to: currentUserId }
      ]
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;







