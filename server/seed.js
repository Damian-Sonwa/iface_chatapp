require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Room = require('./models/Room');
const Message = require('./models/Message');
const PrivateChat = require('./models/PrivateChat');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';

// Allow local MongoDB (localhost) or Atlas MongoDB
const isLocalMongo = MONGO_URI.includes('localhost') || MONGO_URI.includes('127.0.0.1');
const isAtlasMongo = MONGO_URI.includes('mongodb.net');

if (!isLocalMongo && !isAtlasMongo) {
  console.error('❌ MONGO_URI must be either:');
  console.error('   - Local MongoDB: mongodb://localhost:27017/');
  console.error('   - Atlas MongoDB: mongodb+srv://...');
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI, { dbName: 'chaturway001' });
    const connectionType = isLocalMongo ? 'Local MongoDB' : 'MongoDB Atlas';
    console.log(`✅ Connected to ${connectionType} → chaturway001`);

    // Clear existing data
    await User.deleteMany({});
    await Room.deleteMany({});
    await Message.deleteMany({});
    await PrivateChat.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users with new features
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.insertMany([
      {
        username: 'alice',
        email: 'alice@example.com',
        password: hashedPassword,
        phoneNumber: '+1234567890',
        status: 'online',
        bio: 'Software developer and open-source enthusiast 🚀',
        isAdmin: true, // Make alice an admin
        avatar: null,
        vibe: 'Energetic',
        theme: 'sunset',
        autoVibe: true,
        preferredLanguage: 'en'
      },
      {
        username: 'bob',
        email: 'bob@example.com',
        password: hashedPassword,
        phoneNumber: '+1234567891',
        status: 'online',
        bio: 'Full-stack developer | Love coding and coffee ☕',
        isAdmin: false,
        avatar: null
      },
      {
        username: 'charlie',
        email: 'charlie@example.com',
        password: hashedPassword,
        phoneNumber: '+1234567892',
        status: 'offline',
        bio: 'UI/UX Designer | Creating beautiful experiences 🎨',
        isAdmin: false,
        avatar: null
      },
      {
        username: 'diana',
        email: 'diana@example.com',
        password: hashedPassword,
        phoneNumber: '+1234567893',
        status: 'online',
        bio: 'Product Manager | Building amazing products 📱',
        isAdmin: false,
        avatar: null
      },
      {
        username: 'eve',
        email: 'eve@example.com',
        password: hashedPassword,
        phoneNumber: '+1234567894',
        status: 'away',
        bio: 'DevOps Engineer | Automating everything 🤖',
        isAdmin: false,
        avatar: null
      }
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create rooms with new features (admins, pinned messages)
    const rooms = await Room.insertMany([
      {
        name: 'General',
        description: 'General discussion room for everyone',
        createdBy: users[0]._id, // alice
        members: users.map(u => u._id),
        isPrivate: false,
        admins: [users[0]._id, users[1]._id], // alice and bob as admins
        pinnedMessages: [],
        mutedUsers: []
      },
      {
        name: 'Tech Talk',
        description: 'Technology discussions and coding help',
        createdBy: users[1]._id, // bob
        members: [users[0]._id, users[1]._id, users[2]._id, users[4]._id],
        isPrivate: false,
        admins: [users[1]._id], // bob as admin
        pinnedMessages: [],
        mutedUsers: []
      },
      {
        name: 'Random',
        description: 'Random chat and fun discussions',
        createdBy: users[2]._id, // charlie
        members: users.map(u => u._id),
        isPrivate: false,
        admins: [],
        pinnedMessages: [],
        mutedUsers: []
      },
      {
        name: 'Development',
        description: 'Development discussions and code reviews',
        createdBy: users[0]._id, // alice
        members: [users[0]._id, users[1]._id, users[4]._id],
        isPrivate: false,
        admins: [users[0]._id], // alice as admin
        pinnedMessages: [],
        mutedUsers: []
      }
    ]);

    console.log(`✅ Created ${rooms.length} rooms`);

    // Create some sample messages with new features
    // Create messages in batches to handle references
    
    // General room messages
    const welcomeMsg = await Message.create({
      sender: users[0]._id,
      room: rooms[0]._id,
      content: 'Welcome to the General chat room! 👋 Feel free to introduce yourselves.',
      messageType: 'text',
      readBy: [{ user: users[0]._id }, { user: users[1]._id }, { user: users[3]._id }],
      reactions: [
        { emoji: '👋', users: [users[1]._id, users[3]._id] },
        { emoji: '❤️', users: [users[1]._id] }
      ],
      pinned: true,
      pinnedBy: users[0]._id,
      pinnedAt: new Date()
    });

    const bobMessage = await Message.create({
      sender: users[1]._id,
      room: rooms[0]._id,
      content: 'Hey everyone! Excited to be here! 🚀',
      messageType: 'text',
      readBy: [{ user: users[1]._id }, { user: users[0]._id }],
      reactions: [
        { emoji: '🚀', users: [users[0]._id, users[3]._id] }
      ]
    });

    const replyMsg = await Message.create({
      sender: users[0]._id,
      room: rooms[0]._id,
      content: 'This is a reply to the welcome message',
      messageType: 'text',
      replyTo: welcomeMsg._id,
      readBy: [{ user: users[0]._id }]
    });

    // Tech Talk room messages
    const reactMsg = await Message.create({
      sender: users[0]._id,
      room: rooms[1]._id,
      content: 'What do you think about the new React features? https://react.dev/blog',
      messageType: 'link',
      readBy: [{ user: users[0]._id }, { user: users[1]._id }],
      linkPreview: {
        url: 'https://react.dev/blog',
        title: 'React Blog',
        description: 'The latest updates from the React team',
        siteName: 'React'
      },
      reactions: [
        { emoji: '👍', users: [users[1]._id] }
      ]
    });

    await Message.create({
      sender: users[1]._id,
      room: rooms[1]._id,
      content: 'Great question! I love the new hooks API.',
      messageType: 'text',
      readBy: [{ user: users[1]._id }]
    });

    // Random room messages
    const designMsg = await Message.create({
      sender: users[2]._id,
      room: rooms[2]._id,
      content: 'Anyone up for a design review session? 🎨',
      messageType: 'text',
      readBy: [{ user: users[2]._id }],
      reactions: [
        { emoji: '🎨', users: [users[0]._id] },
        { emoji: '👍', users: [users[3]._id] }
      ]
    });

    await Message.create({
      sender: users[3]._id,
      room: rooms[2]._id,
      content: 'Count me in! When are you thinking?',
      messageType: 'text',
      replyTo: designMsg._id,
      readBy: [{ user: users[3]._id }]
    });

    // Development room messages
    const devMsg = await Message.create({
      sender: users[0]._id,
      room: rooms[3]._id,
      content: 'Important: Please review the latest PR before merging.',
      messageType: 'text',
      readBy: [{ user: users[0]._id }, { user: users[1]._id }],
      pinned: true,
      pinnedBy: users[0]._id,
      pinnedAt: new Date(),
      reactions: [
        { emoji: '✅', users: [users[1]._id] }
      ]
    });

    // Update pinned messages in rooms
    await Room.findByIdAndUpdate(rooms[0]._id, {
      pinnedMessages: [welcomeMsg._id]
    });
    
    await Room.findByIdAndUpdate(rooms[3]._id, {
      pinnedMessages: [devMsg._id]
    });

    const allMessages = await Message.countDocuments();
    console.log(`✅ Created ${allMessages} sample messages`);

    // Create private chats (one at a time to handle unique index)
    // Sort participants to ensure consistent ordering for the unique index
    const privateChats = [];
    
    try {
      const pc1 = await PrivateChat.create({
        participants: [users[0]._id, users[1]._id].sort(),
        lastMessage: null,
        lastMessageAt: null
      });
      privateChats.push(pc1);
    } catch (err) {
      console.log('⚠️  Private chat alice-bob already exists, skipping...');
    }
    
    try {
      const pc2 = await PrivateChat.create({
        participants: [users[1]._id, users[2]._id].sort(),
        lastMessage: null,
        lastMessageAt: null
      });
      privateChats.push(pc2);
    } catch (err) {
      console.log('⚠️  Private chat bob-charlie already exists, skipping...');
    }
    
    try {
      const pc3 = await PrivateChat.create({
        participants: [users[0]._id, users[3]._id].sort(),
        lastMessage: null,
        lastMessageAt: null
      });
      privateChats.push(pc3);
    } catch (err) {
      console.log('⚠️  Private chat alice-diana already exists, skipping...');
    }
    
    // If all failed, try to find existing chats
    if (privateChats.length === 0) {
      const existingChats = await PrivateChat.find({
        $or: [
          { participants: { $all: [users[0]._id, users[1]._id] } },
          { participants: { $all: [users[1]._id, users[2]._id] } },
          { participants: { $all: [users[0]._id, users[3]._id] } }
        ]
      });
      privateChats.push(...existingChats);
      console.log(`📋 Using ${existingChats.length} existing private chats`);
    }

    // Create some private messages (only if we have private chats)
    if (privateChats.length > 0) {
      try {
        const pm1 = await Message.create({
          sender: users[0]._id,
          privateChat: privateChats[0]._id,
          content: 'Hey Bob! How are you doing?',
          messageType: 'text',
          readBy: [{ user: users[0]._id }, { user: users[1]._id }]
        });

        const pm2 = await Message.create({
          sender: users[1]._id,
          privateChat: privateChats[0]._id,
          content: 'Hey Alice! Doing great, thanks for asking! 😊',
          messageType: 'text',
          replyTo: pm1._id,
          readBy: [{ user: users[1]._id }, { user: users[0]._id }]
        });

        // Update private chat with last message
        await PrivateChat.findByIdAndUpdate(privateChats[0]._id, {
          lastMessage: pm2._id,
          lastMessageAt: new Date()
        });
      } catch (err) {
        console.log('⚠️  Could not create private messages for chat 1:', err.message);
      }

      if (privateChats.length > 1) {
        try {
          const pm3 = await Message.create({
            sender: users[1]._id,
            privateChat: privateChats[1]._id,
            content: 'Charlie, did you finish the design mockups?',
            messageType: 'text',
            readBy: [{ user: users[1]._id }]
          });

          await PrivateChat.findByIdAndUpdate(privateChats[1]._id, {
            lastMessage: pm3._id,
            lastMessageAt: new Date()
          });
        } catch (err) {
          console.log('⚠️  Could not create private messages for chat 2:', err.message);
        }
      }

      if (privateChats.length > 2) {
        try {
          const pm4 = await Message.create({
            sender: users[0]._id,
            privateChat: privateChats[2]._id,
            content: 'Diana, can we schedule a product review meeting?',
            messageType: 'text',
            readBy: [{ user: users[0]._id }]
          });

          await PrivateChat.findByIdAndUpdate(privateChats[2]._id, {
            lastMessage: pm4._id,
            lastMessageAt: new Date()
          });
        } catch (err) {
          console.log('⚠️  Could not create private messages for chat 3:', err.message);
        }
      }

      const pmCount = await Message.countDocuments({ privateChat: { $exists: true, $ne: null } });
      console.log(`✅ Created ${privateChats.length} private chats with ${pmCount} messages`);
    } else {
      console.log('⚠️  No private chats created, skipping private messages');
    }

    console.log('\n📝 Seed data created successfully!');
    console.log('\n👥 Test Accounts (password: password123):');
    console.log('   ┌─────────┬─────────────────────┬──────────┬─────────────────────────────┐');
    console.log('   │ Username│ Email               │ Status   │ Bio                         │');
    console.log('   ├─────────┼─────────────────────┼──────────┼─────────────────────────────┤');
    users.forEach(user => {
      const adminBadge = user.isAdmin ? ' [ADMIN]' : '';
      console.log(`   │ ${user.username.padEnd(7)} │ ${user.email.padEnd(19)} │ ${user.status.padEnd(8)} │ ${(user.bio || 'No bio').substring(0, 27).padEnd(27)} │${adminBadge}`);
    });
    console.log('   └─────────┴─────────────────────┴──────────┴─────────────────────────────┘');
    
    console.log('\n🏠 Rooms Created:');
    rooms.forEach(room => {
      const adminCount = room.admins?.length || 0;
      console.log(`   - ${room.name}: ${room.description} (${adminCount} admin${adminCount !== 1 ? 's' : ''})`);
    });

    console.log('\n✨ Features Included:');
    console.log('   ✅ User profiles with bio');
    console.log('   ✅ Admin users (alice and bob in some rooms)');
    console.log('   ✅ Pinned messages in rooms');
    console.log('   ✅ Message reactions (emoji)');
    console.log('   ✅ Message replies');
    console.log('   ✅ Link previews');
    console.log('   ✅ Private chats');
    console.log('   ✅ Read receipts');
    console.log('\n🎉 All seed data created successfully!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
