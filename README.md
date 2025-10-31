# Chaturway - Real-time Chat Application

A modern, WhatsApp-style real-time chat application built with React (Vite) + Tailwind + Express + Socket.io + MongoDB.

## ✨ Features

- 🔐 **User Authentication** - Register and login with JWT
- 💬 **Real-time Messaging** - Socket.io powered instant messaging
- 👥 **Multiple Chat Rooms** - Create and join public chat rooms
- 🔒 **Private Messages** - One-on-one private conversations
- 📍 **Presence System** - See who's online/offline in real-time
- ⌨️ **Typing Indicators** - Know when someone is typing
- ✅ **Read Receipts** - Single and double check marks
- 😊 **Emoji Picker** - Add emojis to messages
- ⚡ **Message Reactions** - React to messages with emojis
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 🎨 **Beautiful UI** - Modern glassmorphism design with Tailwind CSS

## 📁 Project Structure

```
chat_app/
  ├── client/                 # React frontend
  │   ├── src/
  │   │   ├── components/     # React components
  │   │   ├── context/        # React context providers
  │   │   ├── pages/          # Page components
  │   │   ├── utils/          # Utilities (API, Socket)
  │   │   └── App.jsx
  │   ├── package.json
  │   └── vite.config.js
  │
  └── server/                 # Node.js backend
      ├── config/
      │   └── db.js           # MongoDB connection
      ├── controllers/        # Route controllers
      ├── models/             # MongoDB models
      │   ├── User.js
      │   ├── Room.js
      │   ├── PrivateChat.js
      │   └── Message.js
      ├── routes/             # Express routes
      │   ├── auth.js
      │   ├── rooms.js
      │   └── private.js
      ├── server.js           # Main server file
      ├── seed.js             # Database seed script
      ├── package.json
      └── .env                # Environment variables
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (connection string provided)

### 1. Install Server Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server/` directory with the following content:

```env
MONGO_URI=mongodb+srv://madudamian25_db_user:Godofjustice%40001@cluster0.c2havli.mongodb.net/charturway001?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=yourSuperSecretKeyHere
```

> **Important:** ✅ This app connects **only** to MongoDB → charturway001 using the MONGO_URI in /server/.env.

### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

### 4. Seed Database (Optional)

To populate the database with sample users and rooms:

```bash
cd server
npm run seed
```

This will create:
- 4 test users (alice, bob, charlie, diana)
- 3 default rooms (General, Tech Talk, Random)

**Default password for all seeded users:** `password123`

### 5. Start the Application

**Terminal 1 - Start Server:**
```bash
cd server
npm run dev
```

You should see:
```
✅ Connected to MongoDB → charturway001
🚀 Server running on port 5000
```

**Terminal 2 - Start Client:**
```bash
cd client
npm run dev
```

The app will be available at `http://localhost:5173`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Rooms
- `GET /api/rooms` - Get all rooms (protected)
- `POST /api/rooms` - Create new room (protected)
- `POST /api/rooms/:roomId/join` - Join room (protected)
- `GET /api/rooms/:roomId/messages` - Get room messages (protected)
- `GET /api/rooms/users/all` - Get all users (protected)

### Private Chats
- `GET /api/private` - Get user's private chats (protected)
- `GET /api/private/:userId` - Get or create private chat (protected)
- `GET /api/private/messages/:chatId` - Get chat messages (protected)

## 🔌 Socket.io Events

### Client → Server
- `room:join` - Join a room
- `room:leave` - Leave a room
- `message:room` - Send room message
- `message:private` - Send private message
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `message:read` - Mark message as read
- `message:react` - React to message

### Server → Client
- `message:new` - New message received
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `user:online` - User came online
- `user:offline` - User went offline
- `message:read` - Message read receipt
- `message:reacted` - Message reaction update

## 🎨 UI Features

### Authentication Page
- Split-screen layout with hero image
- Glassmorphism design
- Smooth transitions and animations
- Responsive design

### Chat Interface
- **Sidebar:**
  - Room list with descriptions
  - Private chat list with online status
  - User list to start new chats
  - Search functionality
  - Create room button

- **Chat Area:**
  - Message bubbles (sent/received)
  - User avatars and names
  - Timestamps
  - Read receipts (✓ ✓)
  - Message reactions
  - Typing indicators

- **Message Input:**
  - Emoji picker
  - Attachment button (ready for future implementation)
  - Send button
  - Auto-resizing textarea

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Socket.io authentication middleware
- Input validation and sanitization

## 🛠️ Technologies Used

### Frontend
- React 18
- Vite
- Tailwind CSS
- Socket.io Client
- Axios
- Framer Motion
- @joeattardi/emoji-button
- Lucide React Icons

### Backend
- Node.js
- Express.js
- Socket.io
- MongoDB with Mongoose
- JWT
- Bcrypt
- Multer (ready for file uploads)

## 📦 Available Scripts

### Server
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

### Client
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🐛 Troubleshooting

### Server won't start
- Check if MongoDB URI is correct in `.env`
- Ensure PORT 5000 is not in use
- Verify all dependencies are installed

### Client connection issues
- Ensure server is running on port 5000
- Check browser console for errors
- Verify Socket.io connection in Network tab

### Authentication issues
- Clear localStorage: `localStorage.clear()`
- Check JWT_SECRET matches in server `.env`
- Verify token is being sent in headers

## 📸 Screenshots

The app features:
- **Glassmorphism Auth Page** - Beautiful split-screen design with real people socializing
- **Modern Chat UI** - Clean, WhatsApp-inspired interface
- **Real-time Features** - Instant messaging, typing indicators, presence
- **Dark Mode** - Easy theme switching

## 🤝 Contributing

This is a complete, production-ready chat application. Feel free to extend it with:
- File/image uploads
- Voice messages
- Video calls
- Group management
- Message search
- Message editing/deletion

## 📄 License

MIT

## ✅ Database Connection

**Important:** ✅ This app connects **only** to MongoDB → charturway001 using the MONGO_URI in /server/.env.

The application will refuse to start if the MONGO_URI is missing or incorrect, ensuring data integrity and security.

---

Built with ❤️ using React, Express, Socket.io, and MongoDB

