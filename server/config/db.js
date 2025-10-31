const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI;

// Strict enforcement: Only connect to the specified database
if (!MONGO_URI) {
  console.error('❌ MONGO_URI missing — refusing to connect to any other database.');
  process.exit(1);
}

// Allow local MongoDB or Atlas MongoDB
const isLocalMongo = MONGO_URI.includes('localhost') || MONGO_URI.includes('127.0.0.1');
const isAtlasMongo = MONGO_URI.includes('mongodb.net');

// For Atlas, validate connection string format (optional check)
// Database name will be enforced via dbName option

if (!isLocalMongo && !isAtlasMongo) {
  console.error('❌ MONGO_URI must be either:');
  console.error('   - Local MongoDB: mongodb://localhost:27017/');
  console.error('   - Atlas MongoDB: mongodb+srv://... with "chaturway10" in the path');
  process.exit(1);
}

mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    // Clean the URI - remove newlines, whitespace, and trailing ? if present
    let uri = MONGO_URI.trim().replace(/\s+/g, '').replace(/\n/g, '').replace(/\r/g, '');
    if (uri.endsWith('?')) {
      uri = uri.slice(0, -1);
    }
    
    // Only add Atlas-specific query params if connecting to Atlas (not local)
    if (!isLocalMongo) {
      const hasParams = uri.includes('?');
      if (!hasParams) {
        uri += '?retryWrites=true&w=majority';
      } else {
        // Ensure retryWrites and w=majority are present (check if they're already there)
        const params = uri.split('?')[1] || '';
        if (!params.includes('retryWrites=true') && !params.includes('retryWrites=')) {
          uri += '&retryWrites=true';
        }
        if (!params.includes('w=majority') && !params.includes('w=')) {
          uri += '&w=majority';
        }
      }
    }
    
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📍 URI:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Mask password in logs
    
    // Use chaturway001 as specified
    const dbName = 'chaturway001';
    
    // Connection options
    const connectionOptions = {
      dbName: dbName,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2
    };
    
    // Only add these for Atlas (not needed for local)
    if (!isLocalMongo) {
      connectionOptions.retryWrites = true;
      connectionOptions.w = 'majority';
    }
    
    await mongoose.connect(uri, connectionOptions);
    
    const connectionType = isLocalMongo ? 'Local MongoDB' : 'MongoDB Atlas';
    console.log(`✅ Connected to ${connectionType} → ${dbName}`);
    console.log(`📊 Database: ${dbName}`);
    
    // Log connection details for verification
    console.log(`🔗 Using MONGO_URI: ${MONGO_URI.includes('mongodb.net') ? 'MongoDB Atlas' : 'Local MongoDB'}`);
  } catch (error) {
    console.error('\n❌ MongoDB connection error:', error.message);
    
    // Provide specific error guidance
    if (error.message.includes('ETIMEOUT') || error.message.includes('querySrv') || error.message.includes('queryTxt')) {
      if (isLocalMongo) {
        console.error('\n⏱️  Local MongoDB Connection Error');
        console.error('This usually means:');
        console.error('   1. MongoDB is NOT running locally');
        console.error('      → Install MongoDB Community Edition');
        console.error('      → Start MongoDB service: net start MongoDB');
        console.error('      → Or run: mongod (if installed as standalone)');
        console.error('');
        console.error('   2. MongoDB is running on a different port');
        console.error('      → Default port is 27017');
        console.error('      → Check if port in connection string matches');
        console.error('');
        console.error('   3. Firewall blocking localhost connection');
        console.error('      → Check Windows Firewall settings');
      } else {
        console.error('\n⏱️  DNS/Network Timeout Error');
        console.error('This usually means:');
        console.error('   1. MongoDB Atlas cluster might be PAUSED');
        console.error('      → Go to MongoDB Atlas dashboard');
        console.error('      → Check if cluster shows "Resume" button');
        console.error('      → If paused, click "Resume" and wait for it to start');
        console.error('');
        console.error('   2. Your IP address is NOT whitelisted');
        console.error('      → Go to: https://cloud.mongodb.com/v2#/security/network/whitelist');
        console.error('      → Click "ADD IP ADDRESS"');
        console.error('      → Choose "ADD CURRENT IP ADDRESS" (recommended)');
        console.error('      → OR add: 0.0.0.0/0 (allows all IPs - for development only)');
        console.error('      → Wait 1-2 minutes for changes to propagate');
        console.error('');
        console.error('   3. Network/Firewall blocking connection');
        console.error('      → Try disabling VPN if using one');
        console.error('      → Check corporate firewall settings');
        console.error('      → Try from a different network');
      }
    } else if (error.message.includes('authentication') || error.message.includes('credentials')) {
      console.error('\n🔐 Authentication Error');
      console.error('   1. Verify username and password in .env file');
      console.error('   2. Check if password has special characters (%40 for @)');
      console.error('   3. Ensure database user has proper permissions');
    } else {
      console.error('\n⚠️  General Connection Issue');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify MongoDB Atlas cluster is not paused');
      console.error('   3. Check IP whitelist settings');
      console.error('   4. Try restarting the connection');
    }
    
    if (isLocalMongo) {
      console.error('\n💡 Quick Fix Checklist for Local MongoDB:');
      console.error('   ☐ MongoDB is installed and running');
      console.error('   ☐ MongoDB service is started (net start MongoDB)');
      console.error('   ☐ Port 27017 is not blocked by firewall');
      console.error('   ☐ Connection string: mongodb://localhost:27017/');
    } else {
      console.error('\n💡 Quick Fix Checklist for MongoDB Atlas:');
      console.error('   ☐ Cluster is running (not paused)');
      console.error('   ☐ IP address whitelisted (0.0.0.0/0 or your IP)');
      console.error('   ☐ Internet connection working');
      console.error('   ☐ Correct connection string in .env file');
    }
    
    // Throw error instead of exiting - let calling code decide what to do
    throw error;
  }
};

module.exports = connectDB;

