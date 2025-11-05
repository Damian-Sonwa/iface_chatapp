require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const privateRoutes = require('./routes/private');
const uploadRoutes = require('./routes/upload');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const techSkillRoutes = require('./routes/techSkills');
const groupJoinRequestRoutes = require('./routes/groupJoinRequests');
const Message = require('./models/Message');
const Room = require('./models/Room');
const PrivateChat = require('./models/PrivateChat');
const User = require('./models/User');
const Poll = require('./models/Poll');
const jwt = require('jsonwebtoken');
const { getLinkPreview } = require('./utils/linkPreview');
const { extractMentionedUsernames } = require('./utils/mentionParser');

const JWT_SECRET = process.env.JWT_SECRET || 'yourSuperSecretKeyHere';

// Validate required environment variables
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
  console.error('❌ MONGODB_URI (or MONGO_URI) missing — refusing to connect to any other database.');
  console.error('   Please set MONGODB_URI in your .env file.');
  process.exit(1);
}

// Warn about optional API keys
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY not found. AI features (summarize, suggest-replies) will be disabled.');
}

if (!process.env.GOOGLE_API_KEY) {
  console.warn('⚠️  GOOGLE_API_KEY not found. Translation features will be disabled.');
}

// CORS configuration - allow both local and production origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://chaturway001.netlify.app',
  process.env.CLIENT_URL
].filter(Boolean); // Remove undefined values

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
});

// Middleware

console.log('🌍 CORS Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   Allowed origins:`, allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('   ✅ Allowing request with no origin');
      return callback(null, true);
    }
    
    console.log(`   🔍 CORS check for origin: ${origin}`);
    
    if (allowedOrigins.includes(origin)) {
      console.log('   ✅ Allowing: origin in allowed list');
      callback(null, true);
    } else {
      // Allow any origin in production for now (you can restrict this later)
      if (process.env.NODE_ENV === 'production') {
        console.log('   ✅ Allowing: production environment');
        callback(null, true);
      } else {
        console.log('   ❌ Blocking: not in allowed list and not production');
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.static('uploads'));
app.use(cookieParser());

// Connect to MongoDB (with retry logic)
let dbConnected = false;
const connectWithRetry = async () => {
  try {
    await connectDB();
    dbConnected = true;
    console.log('✅ Server ready - MongoDB connected');
  } catch (error) {
    console.error('\n⚠️  MongoDB connection failed. Server will continue but database features may not work.');
    console.error('💡 Fix the MongoDB connection issue and restart the server.');
    console.error('   See MONGODB_CONNECTION_FIX.md for troubleshooting steps.\n');
    // Don't exit - allow server to run and retry connection
    dbConnected = false;
    // Retry after 10 seconds
    setTimeout(() => {
      console.log('🔄 Retrying MongoDB connection...');
      connectWithRetry();
    }, 10000);
  }
};

connectWithRetry();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    dbConnected: dbConnected,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/2fa', require('./routes/2fa'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/rooms', roomRoutes); // Legacy routes for backward compatibility
app.use('/api/private', privateRoutes); // Legacy routes for backward compatibility
app.use('/api/upload', uploadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', require('./routes/ai'));
app.use('/api/translate', require('./routes/translate'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/invite', require('./routes/invite'));
app.use('/api/moments', require('./routes/moments'));
app.use('/api/polls', require('./routes/polls'));
app.use('/api/tech-skills', techSkillRoutes);
app.use('/api/group-join-requests', groupJoinRequestRoutes);

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.userId;
    socket.username = decoded.username;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
const activeUsers = new Map();

io.on('connection', async (socket) => {
  const userId = socket.userId;
  const username = socket.username;

  console.log(`✅ User connected: ${username} (${socket.id})`);

  // Update user status
  await User.findByIdAndUpdate(userId, {
    status: 'online',
    socketId: socket.id
  });

  activeUsers.set(userId, socket.id);
  socket.broadcast.emit('user:online', { userId, username });

  // Join user's personal room
  socket.join(`user:${userId}`);

  // Get user's rooms and join them
  const rooms = await Room.find({ members: userId });
  rooms.forEach(room => {
    socket.join(`room:${room._id}`);
  });

  // Handle room join
  socket.on('room:join', async ({ roomId }) => {
    socket.join(`room:${roomId}`);
    const room = await Room.findById(roomId);
    if (room && !room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }
    io.to(`room:${roomId}`).emit('room:joined', { userId, username });
  });

  // Handle room leave
  socket.on('room:leave', ({ roomId }) => {
    socket.leave(`room:${roomId}`);
    io.to(`room:${roomId}`).emit('room:left', { userId, username });
  });

  // Handle typing indicator
  socket.on('typing:start', ({ roomId, chatId }) => {
    if (roomId) {
      socket.to(`room:${roomId}`).emit('typing:start', { userId, username });
    } else if (chatId) {
      socket.to(`chat:${chatId}`).emit('typing:start', { userId, username });
    }
  });

  socket.on('typing:stop', ({ roomId, chatId }) => {
    if (roomId) {
      socket.to(`room:${roomId}`).emit('typing:stop', { userId });
    } else if (chatId) {
      socket.to(`chat:${chatId}`).emit('typing:stop', { userId });
    }
  });

  // Handle new message (room)
  socket.on('message:room', async ({ roomId, content, messageType = 'text', attachments = [], replyTo = null, disappearingAfter = null }) => {
    try {
      // Check for URLs and generate link preview
      let linkPreview = null;
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urlMatch = content.match(urlRegex);
      if (urlMatch && urlMatch[0]) {
        try {
          linkPreview = await getLinkPreview(urlMatch[0]);
        } catch (err) {
          console.log('Link preview error:', err.message);
        }
      }

      // Set expiration for disappearing messages
      let expiresAt = null;
      if (disappearingAfter) {
        expiresAt = new Date(Date.now() + disappearingAfter * 60 * 60 * 1000);
      }

      const message = await Message.create({
        sender: userId,
        room: roomId,
        content,
        messageType,
        attachments,
        replyTo,
        linkPreview,
        disappearingAfter,
        expiresAt,
        readBy: [{ user: userId }]
      });

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username avatar')
        .populate('replyTo', 'content sender');

      // Check for @mentions and notify users
      const mentionedUsernames = extractMentionedUsernames(content);
      if (mentionedUsernames.length > 0) {
        const room = await Room.findById(roomId);
        const roomName = room?.name || 'Room';
        const mentionedUsers = await User.find({ username: { $in: mentionedUsernames } });
        mentionedUsers.forEach(mentionedUser => {
          const userSocketId = activeUsers.get(mentionedUser._id.toString());
          if (userSocketId) {
            io.to(userSocketId).emit('mention:notification', {
              message: populatedMessage,
              roomId,
              roomName
            });
          }
        });
      }

      io.to(`room:${roomId}`).emit('message:new', { message: populatedMessage });

      // Schedule deletion for disappearing messages
      if (expiresAt) {
        setTimeout(async () => {
          try {
            await Message.findByIdAndUpdate(message._id, {
              deleted: true,
              content: 'This message has disappeared'
            });
            io.to(`room:${roomId}`).emit('message:expired', { messageId: message._id });
          } catch (err) {
            console.error('Error deleting expired message:', err);
          }
        }, disappearingAfter * 60 * 60 * 1000);
      }
    } catch (error) {
      console.error('Message error:', error);
      socket.emit('message:error', { error: 'Failed to send message' });
    }
  });

  // Handle new message (private)
  socket.on('message:private', async ({ chatId, content, messageType = 'text', recipientId, attachments = [], replyTo = null, disappearingAfter = null }) => {
    try {
      // Check for URLs and generate link preview
      let linkPreview = null;
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urlMatch = content.match(urlRegex);
      if (urlMatch && urlMatch[0]) {
        try {
          linkPreview = await getLinkPreview(urlMatch[0]);
        } catch (err) {
          console.log('Link preview error:', err.message);
        }
      }

      // Set expiration for disappearing messages
      let expiresAt = null;
      if (disappearingAfter) {
        expiresAt = new Date(Date.now() + disappearingAfter * 60 * 60 * 1000);
      }

      const message = await Message.create({
        sender: userId,
        privateChat: chatId,
        content,
        messageType,
        attachments,
        replyTo,
        linkPreview,
        disappearingAfter,
        expiresAt,
        readBy: [{ user: userId }]
      });

      // Update chat last message
      await PrivateChat.findByIdAndUpdate(chatId, {
        lastMessage: message._id,
        lastMessageAt: new Date()
      });

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username avatar')
        .populate('replyTo', 'content sender');

      // Emit to recipient
      const recipientSocketId = activeUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('message:new', { message: populatedMessage, chatId });
        io.to(recipientSocketId).emit('notification:new', {
          message: populatedMessage,
          chatId
        });
      }

      // Also emit back to sender
      socket.emit('message:new', { message: populatedMessage, chatId });

      // Schedule deletion for disappearing messages
      if (expiresAt) {
        setTimeout(async () => {
          try {
            await Message.findByIdAndUpdate(message._id, {
              deleted: true,
              content: 'This message has disappeared'
            });
            io.to(`chat:${chatId}`).emit('message:expired', { messageId: message._id });
          } catch (err) {
            console.error('Error deleting expired message:', err);
          }
        }, disappearingAfter * 60 * 60 * 1000);
      }
    } catch (error) {
      console.error('Private message error:', error);
      socket.emit('message:error', { error: 'Failed to send message' });
    }
  });

  // Handle message read receipt
  socket.on('message:read', async ({ messageId, chatId }) => {
    try {
      const message = await Message.findById(messageId);
      if (message && !message.readBy.some(r => r.user.toString() === userId)) {
        message.readBy.push({ user: userId });
        await message.save();
        
        if (chatId) {
          io.to(`chat:${chatId}`).emit('message:read', { messageId, userId });
        }
      }
    } catch (error) {
      console.error('Read receipt error:', error);
    }
  });

  // Handle message edit
  socket.on('message:edit', async ({ messageId, content, chatId, roomId }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message || message.sender.toString() !== userId) {
        return socket.emit('message:error', { error: 'Unauthorized' });
      }

      message.content = content;
      message.edited = true;
      message.editedAt = new Date();
      await message.save();

      const populatedMessage = await Message.findById(messageId)
        .populate('sender', 'username avatar')
        .populate('replyTo', 'content sender');

      if (chatId) {
        io.to(`chat:${chatId}`).emit('message:edited', { message: populatedMessage });
      } else if (roomId) {
        io.to(`room:${roomId}`).emit('message:edited', { message: populatedMessage });
      }
    } catch (error) {
      console.error('Edit message error:', error);
      socket.emit('message:error', { error: 'Failed to edit message' });
    }
  });

  // Handle message delete
  socket.on('message:delete', async ({ messageId, chatId, roomId }) => {
    try {
      const message = await Message.findById(messageId).populate('room');
      if (!message) return;

      let canDelete = message.sender.toString() === userId;
      if (message.room) {
        const room = message.room;
        const isAdmin = room.admins?.includes(userId) || room.createdBy.toString() === userId;
        canDelete = canDelete || isAdmin;
      }

      if (!canDelete) {
        return socket.emit('message:error', { error: 'Unauthorized' });
      }

      message.deleted = true;
      message.deletedAt = new Date();
      message.content = 'This message was deleted';
      await message.save();

      if (chatId) {
        io.to(`chat:${chatId}`).emit('message:deleted', { messageId });
      } else if (roomId) {
        io.to(`room:${roomId}`).emit('message:deleted', { messageId });
      }
    } catch (error) {
      console.error('Delete message error:', error);
      socket.emit('message:error', { error: 'Failed to delete message' });
    }
  });

  // Handle message reaction
  socket.on('message:react', async ({ messageId, emoji, chatId, roomId }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) return;

      const reaction = message.reactions.find(r => r.emoji === emoji);
      if (reaction) {
        if (reaction.users.includes(userId)) {
          reaction.users = reaction.users.filter(id => id.toString() !== userId);
        } else {
          reaction.users.push(userId);
        }
      } else {
        message.reactions.push({ emoji, users: [userId] });
      }

      await message.save();

      const populatedMessage = await Message.findById(messageId)
        .populate('sender', 'username avatar')
        .populate('reactions.users', 'username');

      if (chatId) {
        io.to(`chat:${chatId}`).emit('message:reacted', { message: populatedMessage });
      } else if (roomId) {
        io.to(`room:${roomId}`).emit('message:reacted', { message: populatedMessage });
      }
    } catch (error) {
      console.error('Reaction error:', error);
    }
  });

  // Join private chat
  socket.on('chat:join', ({ chatId, otherUserId }) => {
    socket.join(`chat:${chatId}`);
    if (otherUserId) {
      socket.join(`user:${otherUserId}`);
    }
  });

  // Handle poll creation
  socket.on('poll:created', ({ roomId, poll }) => {
    socket.to(`room:${roomId}`).emit('poll:created', { poll });
  });

  // Handle poll vote
  socket.on('poll:voted', ({ roomId, poll }) => {
    socket.to(`room:${roomId}`).emit('poll:updated', { poll });
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log(`❌ User disconnected: ${username} (${socket.id})`);
    
    activeUsers.delete(userId);
    
    await User.findByIdAndUpdate(userId, {
      status: 'offline',
      lastSeen: new Date(),
      socketId: null
    });

    socket.broadcast.emit('user:offline', { userId, username });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Client URL: ${process.env.CLIENT_URL || 'https://chaturway001.netlify.app'}`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
  if (!dbConnected) {
    console.log('⚠️  Warning: MongoDB not connected. Server will retry connection every 10 seconds.');
    console.log('   Database features will be unavailable until connection is established.');
  }
});

