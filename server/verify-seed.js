require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Room = require('./models/Room');
const Message = require('./models/Message');
const PrivateChat = require('./models/PrivateChat');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';

(async () => {
  try {
    await mongoose.connect(MONGO_URI, { dbName: 'chaturway10' });
    console.log('✅ Connected to database\n');

    const userCount = await User.countDocuments();
    const roomCount = await Room.countDocuments();
    const msgCount = await Message.countDocuments();
    const chatCount = await PrivateChat.countDocuments();

    console.log('📊 Collection Counts:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Rooms: ${roomCount}`);
    console.log(`   Messages: ${msgCount}`);
    console.log(`   Private Chats: ${chatCount}\n`);

    if (userCount > 0) {
      console.log('👤 Sample Users:');
      const users = await User.find().limit(3);
      users.forEach(u => {
        console.log(`   - ${u.username} (${u.email})`);
        console.log(`     Bio: ${u.bio || 'No bio'}`);
        console.log(`     Admin: ${u.isAdmin || false}`);
      });
      console.log();
    }

    if (roomCount > 0) {
      console.log('🏠 Sample Rooms:');
      const rooms = await Room.find().populate('admins', 'username').limit(2);
      rooms.forEach(r => {
        const adminNames = r.admins?.map(a => a.username).join(', ') || 'None';
        console.log(`   - ${r.name}: ${r.description}`);
        console.log(`     Admins: ${adminNames}`);
        console.log(`     Pinned Messages: ${r.pinnedMessages?.length || 0}`);
      });
      console.log();
    }

    if (msgCount > 0) {
      console.log('💬 Sample Messages:');
      const messages = await Message.find()
        .populate('sender', 'username')
        .populate('room', 'name')
        .limit(3)
        .sort({ createdAt: -1 });
      messages.forEach(m => {
        const roomName = m.room?.name || 'Private';
        console.log(`   - ${m.sender?.username || 'Unknown'} in ${roomName}:`);
        console.log(`     "${m.content?.substring(0, 50)}${m.content?.length > 50 ? '...' : ''}"`);
        console.log(`     Reactions: ${m.reactions?.length || 0}, Pinned: ${m.pinned || false}, Edited: ${m.edited || false}`);
      });
    }

    await mongoose.connection.close();
    console.log('\n✅ Verification complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();









