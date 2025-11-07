const User = require('../models/User');
const Room = require('../models/Room');
const Message = require('../models/Message');
const Summary = require('../models/Summary');
const PrivateChat = require('../models/PrivateChat');

/**
 * Check if user is admin
 */
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/dashboard
 * Get dashboard statistics and data
 */
const getDashboard = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalRooms = await Room.countDocuments();
    const totalMessages = await Message.countDocuments();
    const totalSummaries = await Summary.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'online' });

    // Recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('username email createdAt status isAdmin');

    const recentSummaries = await Summary.find()
      .populate('requestedBy', 'username')
      .populate('roomId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Messages per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const messagesPerDay = await Message.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalRooms,
        totalMessages,
        totalSummaries,
        activeUsers
      },
      recentUsers,
      recentSummaries,
      messagesPerDay
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/users
 * List all users with filters
 */
const listUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role === 'admin') {
      query.isAdmin = true;
    } else if (role === 'user') {
      query.isAdmin = false;
    }

    if (status) {
      query.status = status;
    }

    const users = await User.find(query)
      .select('-password -twoFactorSecret')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ users });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/users/:userId/ban
 * Ban or unban a user
 */
const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { banned, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(403).json({ error: 'Cannot ban admin users' });
    }

    user.isBanned = banned || false;
    user.banReason = banned ? (reason || 'Banned by administrator') : null;
    user.status = banned ? 'offline' : user.status;
    
    await user.save();

    console.log(`🚫 User ${user.username} ${banned ? 'banned' : 'unbanned'} by admin`);
    res.json({ success: true, user });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/users/:userId/suspend
 * Suspend a user temporarily
 */
const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { suspended, days, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(403).json({ error: 'Cannot suspend admin users' });
    }

    user.isSuspended = suspended || false;
    
    if (suspended && days) {
      const suspendUntil = new Date();
      suspendUntil.setDate(suspendUntil.getDate() + parseInt(days));
      user.suspendedUntil = suspendUntil;
      user.suspensionReason = reason || `Suspended for ${days} day(s)`;
    } else {
      user.suspendedUntil = null;
      user.suspensionReason = null;
    }
    
    user.status = suspended ? 'offline' : user.status;
    await user.save();

    console.log(`⏸️  User ${user.username} ${suspended ? `suspended until ${user.suspendedUntil}` : 'unsuspended'} by admin`);
    res.json({ success: true, user });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/admin/users/:userId
 * Delete a user permanently
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    // Delete user and related data
    await User.findByIdAndDelete(userId);
    
    // Clean up related data (optional - you may want to keep messages for audit)
    // await Message.deleteMany({ sender: userId });
    // await PrivateChat.deleteMany({ participants: userId });
    // await Room.updateMany({ members: userId }, { $pull: { members: userId } });

    console.log(`🗑️  User ${user.username} deleted by admin`);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/users/:userId/reset-password
 * Reset user password (admin action)
 */
const resetPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`🔑 Password reset for user ${user.username} by admin`);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/rooms
 * List all rooms
 */
const listRooms = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const rooms = await Room.find(query)
      .populate('createdBy', 'username')
      .populate('admins', 'username')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ rooms });
  } catch (error) {
    console.error('List rooms error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/admin/rooms/:roomId
 * Delete or archive a room
 */
const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Option 1: Soft delete (add archived field)
    // Option 2: Hard delete
    await Room.findByIdAndDelete(roomId);

    console.log(`🗑️  Room ${roomId} deleted by admin`);

    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/activity
 * Get activity logs
 */
const getActivity = async (req, res) => {
  try {
    const { type, limit = 50 } = req.query;

    const activities = [];

    if (!type || type === 'registrations') {
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('username email createdAt')
        .lean();

      activities.push(...recentUsers.map(u => ({
        type: 'registration',
        userId: u._id,
        username: u.username,
        email: u.email,
        timestamp: u.createdAt
      })));
    }

    if (!type || type === 'summaries') {
      const summaries = await Summary.find()
        .populate('requestedBy', 'username')
        .populate('roomId', 'name')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean();

      activities.push(...summaries.map(s => ({
        type: 'summary',
        userId: s.requestedBy?._id,
        username: s.requestedBy?.username,
        roomId: s.roomId?._id,
        roomName: s.roomId?.name,
        timestamp: s.createdAt
      })));
    }

    // Sort by timestamp
    activities.sort((a, b) => b.timestamp - a.timestamp);

    res.json({ activities: activities.slice(0, parseInt(limit)) });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  isAdmin,
  getDashboard,
  listUsers,
  banUser,
  suspendUser,
  deleteUser,
  resetPassword,
  listRooms,
  deleteRoom,
  getActivity
};

