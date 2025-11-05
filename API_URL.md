# API Base URL

## Default API URL
```
http://localhost:5000/api
```

## Environment Variable
The API URL can be customized by setting the `VITE_API_URL` environment variable in your `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### User Preferences
- **GET** `/api/users/preferences` - Get user preferences
- **PATCH** `/api/users/preferences` - Update user preferences
- **POST** `/api/users/preferences/reset` - Reset preferences to defaults

### User Profile
- **GET** `/api/users/profile` - Get user profile
- **PATCH** `/api/users/profile` - Update user profile

### Authentication
- **POST** `/api/auth/login` - Login
- **POST** `/api/auth/register` - Register
- **POST** `/api/auth/2fa/setup` - Setup 2FA
- **POST** `/api/auth/2fa/verify` - Verify 2FA code
- **POST** `/api/auth/2fa/disable` - Disable 2FA
- **POST** `/api/auth/2fa/send-code` - Resend 2FA code

### Upload
- **POST** `/api/upload/avatar` - Upload profile picture
- **POST** `/api/upload/file` - Upload file

### Friends
- **POST** `/api/friends/request/:recipientId` - Send friend request
- **POST** `/api/friends/accept/:requestId` - Accept friend request
- **POST** `/api/friends/reject/:requestId` - Reject friend request
- **GET** `/api/friends/requests/pending` - Get pending requests
- **GET** `/api/friends/list` - Get friends list
- **GET** `/api/friends/search` - Search users

## Server Configuration
The server runs on port 5000 by default. You can change this in your `.env` file:

```env
PORT=5000
```









