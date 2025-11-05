# 💬 Real-Time Chat Application

A modern, full-featured real-time chat application built with React, TypeScript, Node.js, Express, Socket.io, and MongoDB. Features a beautiful glassmorphism UI with micro-animations, AI-powered features, and comprehensive real-time messaging capabilities.

## ✨ Features

### Core Features
- ✅ **Real-time Messaging** - Low-latency WebSocket communication
- ✅ **User Authentication** - JWT-based auth with refresh tokens (optional)
- ✅ **Conversations** - Unified DM and Group chat system
- ✅ **Message Features** - Edit, delete, react, reply, pin, archive
- ✅ **Typing Indicators** - Real-time typing status
- ✅ **Read Receipts** - Delivered and read status tracking
- ✅ **File Uploads** - Image and file sharing
- ✅ **Voice Messages** - Audio recording via MediaRecorder API
- ✅ **Search** - Instant message search with previews
- ✅ **Presence** - Online/offline status and last seen
- ✅ **Block/Unblock** - User blocking functionality
- ✅ **E2E Encryption Indicators** - Placeholder for future encryption

### Advanced Features
- ✅ **AI-Powered** - Conversation summaries, smart reply suggestions
- ✅ **Translation** - Auto-translate messages
- ✅ **Polls** - Create and vote on polls with real-time results
- ✅ **Moments/Stories** - Ephemeral status updates
- ✅ **Friends System** - Friend requests and management
- ✅ **Notifications** - Real-time notifications
- ✅ **Themes** - Dark/light mode with custom themes
- ✅ **Admin Dashboard** - User and content management

## 🛠️ Tech Stack

### Frontend
- **React 18+** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for routing
- **Zustand** or **Redux Toolkit** for state management
- **React Query** or **SWR** for data fetching
- **Lucide React** for icons
- **Socket.io Client** for real-time communication

### Backend
- **Node.js** with TypeScript
- **Express** web framework
- **Socket.io** for WebSocket communication
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads

### Testing
- **Jest** for unit tests
- **Playwright** or **Cypress** for E2E tests

## 📁 Project Structure

```
chat-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   ├── utils/          # Utilities
│   │   └── types/          # TypeScript types
│   ├── package.json
│   └── tsconfig.json
│
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # Express routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utilities
│   │   └── types/          # TypeScript types
│   ├── package.json
│   └── tsconfig.json
│
├── .env.example            # Environment variables template
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance

### 1. Clone the Repository

```bash
git clone <repository-url>
cd chat-app
```

### 2. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd ../client
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```bash
cp .env.example server/.env
```

Edit `server/.env` and set your values:

```env
# MongoDB Connection (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (REQUIRED - generate a strong random string)
JWT_SECRET=yourSuperSecretKeyHere

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Optional: AI Features
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Translation
GOOGLE_API_KEY=your_google_api_key_here
```

**Important:** The application uses `MONGODB_URI` from your `.env` file. Do NOT overwrite or regenerate the connection string if it's already configured.

### 4. Seed Database (Optional)

To populate the database with sample users and conversations:

```bash
cd server
npm run seed
```

This creates:
- 4 test users (alice, bob, charlie, diana)
- Sample conversations
- Default password: `password123`

### 5. Start the Application

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```

You should see:
```
✅ Connected to MongoDB Atlas → database_name
🚀 Server running on port 5000
```

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
```

The app will be available at `http://localhost:5173`

## 📡 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user

### Conversation Endpoints

- `GET /api/conversations` - Get user's conversations (protected)
- `POST /api/conversations` - Create new conversation (protected)
  ```json
  {
    "type": "dm" | "group",
    "participants": ["userId1", "userId2"],
    "title": "string" // required for groups
  }
  ```
- `GET /api/conversations/:id` - Get conversation details (protected)
- `PUT /api/conversations/:id` - Update conversation (protected)
- `DELETE /api/conversations/:id` - Delete conversation (protected)
- `POST /api/conversations/:id/archive` - Archive conversation (protected)
- `POST /api/conversations/:id/pin` - Pin conversation (protected)

### Message Endpoints

- `GET /api/conversations/:id/messages` - Get messages (protected, cursor-based pagination)
  ```
  Query params: ?cursor=<messageId>&limit=50
  ```
- `POST /api/conversations/:id/messages` - Send message (protected)
  ```json
  {
    "content": "string",
    "messageType": "text" | "image" | "file" | "audio",
    "replyToMessageId": "messageId",
    "attachments": []
  }
  ```
- `PUT /api/messages/:id` - Edit message (protected)
- `DELETE /api/messages/:id` - Delete message (protected)
- `POST /api/messages/:id/pin` - Pin message (protected)
- `POST /api/messages/:id/react` - React to message (protected)
  ```json
  {
    "emoji": "👍"
  }
  ```
- `POST /api/messages/:id/read` - Mark as read (protected)

### User Endpoints

- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get user profile (protected)
- `PUT /api/users/:id` - Update profile (protected)
- `POST /api/users/:id/block` - Block user (protected)
- `POST /api/users/:id/unblock` - Unblock user (protected)

## 🔌 WebSocket Events

### Client → Server

- `conversation:join` - Join conversation room
  ```json
  { "conversationId": "string" }
  ```
- `conversation:leave` - Leave conversation room
- `message:send` - Send message
  ```json
  {
    "conversationId": "string",
    "content": "string",
    "messageType": "text",
    "replyToMessageId": "string"
  }
  ```
- `typing:start` - Start typing indicator
  ```json
  { "conversationId": "string" }
  ```
- `typing:stop` - Stop typing indicator
- `message:read` - Mark message as read
  ```json
  { "messageId": "string", "conversationId": "string" }
  ```
- `message:react` - React to message
  ```json
  { "messageId": "string", "emoji": "👍" }
  ```
- `presence:update` - Update presence status
  ```json
  { "status": "online" | "offline" | "away" }
  ```

### Server → Client

- `message:new` - New message received
- `message:edited` - Message edited
- `message:deleted` - Message deleted
- `message:reacted` - Message reaction updated
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `presence:update` - User presence updated
- `conversation:updated` - Conversation updated
- `notification:new` - New notification

## 🎨 UI Components

### Core Components
- `AppShell` - Main application layout
- `ConversationList` - List of conversations
- `ChatWindow` - Main chat interface
- `MessageBubble` - Individual message display
- `Composer` - Message input component
- `ProfileCard` - User profile display
- `SettingsModal` - Settings interface
- `Notifications` - Notification system
- `PresenceAvatar` - Avatar with presence indicator

### Design System
- **Color Scheme:**
  - Primary: Deep purple → cyan (#6366f1 → #06b6d4)
  - Secondary: Warm coral → pink (#f97316 → #ec4899)
  - Dark mode: True black with accent glows
  - Light mode: Soft white with colored shadows

- **Glassmorphism:** Backdrop blur effects with transparent backgrounds
- **Micro-animations:** Smooth transitions and hover effects
- **Responsive:** Mobile-first design

## 🧪 Testing

### Unit Tests
```bash
cd server
npm test
```

### E2E Tests
```bash
cd client
npm run test:e2e
```

## 📝 Database Models

### User
```typescript
{
  _id: ObjectId,
  username: String,
  email: String,
  passwordHash: String,
  avatarUrl: String,
  status: 'online' | 'offline' | 'away',
  lastSeen: Date,
  settings: Object,
  blockedUsers: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation
```typescript
{
  _id: ObjectId,
  type: 'dm' | 'group',
  title: String,
  participants: [ObjectId],
  pinnedBy: [ObjectId],
  archivedBy: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```typescript
{
  _id: ObjectId,
  conversationId: ObjectId,
  senderId: ObjectId,
  content: String,
  media: [Object],
  replyToMessageId: ObjectId,
  editedAt: Date,
  deletedAt: Date,
  reactions: Object,
  deliveredTo: [ObjectId],
  readBy: [ObjectId],
  isPinned: Boolean,
  isEncrypted: Boolean,
  createdAt: Date,
  lastModified: Date
}
```

## 🔒 Security

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Input sanitization
- ✅ CORS configuration
- ✅ File upload validation
- ✅ Rate limiting
- ✅ HTTPS enforcement (production)

## 🚀 Deployment

### Backend (Render/Railway/Heroku)
1. Set environment variables in deployment platform
2. Ensure `MONGODB_URI` is set
3. Deploy with `npm start`

### Frontend (Netlify/Vercel)
1. Set build command: `npm run build`
2. Set output directory: `dist`
3. Set environment variables for API URL

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

**Built with 💜 using React, TypeScript, Node.js, Socket.io, and MongoDB**
