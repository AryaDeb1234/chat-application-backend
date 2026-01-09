# Chat Application - API Routes & Socket Events Documentation

## Overview
This document provides a comprehensive guide to all HTTP endpoints and WebSocket events in the chat application. It includes descriptions of when and how each route and event should be used.

---

## Table of Contents
1. [Authentication Routes](#authentication-routes)
2. [User Routes](#user-routes)
3. [Chat Routes](#chat-routes)
4. [Message Routes](#message-routes)
5. [Status Routes](#status-routes)
6. [WebSocket Events](#websocket-events)

---

## Authentication Routes

### 1. **POST /auth/login**
**Purpose:** Authenticate a user with username and password

**When to use:**
- When a user wants to log into their existing account
- Initial login screen on client application

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "username": "username"
  },
  "token": "jwt_token",
  "expires": "expiry_date"
}
```

**Response (Error - 401):**
- User not found or incorrect password

---

### 2. **POST /auth/register**
**Purpose:** Create a new user account

**When to use:**
- When a new user wants to sign up
- First-time user registration

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Registration successful!",
  "user": {
    "id": "user_id",
    "username": "username",
    "userCode": "unique_user_code"
  },
  "token": "jwt_token",
  "expires": "expiry_date"
}
```

**Authentication:** Not required

---

### 3. **GET /auth/current_user**
**Purpose:** Get the currently authenticated user's information

**When to use:**
- Verify if user is logged in on app startup
- Validate JWT token and get user info
- Check session status

**Authentication:** Required (JWT)

**Response (Success - 200):**
```json
{
  "loggedIn": true,
  "user": {
    "id": "user_id",
    "username": "username"
  }
}
```

---

## User Routes

### 1. **GET /user/me**
**Purpose:** Retrieve the current user's complete profile (excluding sensitive data)

**When to use:**
- Load user profile on app initialization
- Refresh user data in profile page
- Get current user's contacts list

**Authentication:** Required (JWT)

**Response (Success - 200):**
```json
{
  "_id": "user_id",
  "username": "string",
  "userCode": "unique_code",
  "email": "email@example.com",
  "phone": "phone_number",
  "avatar": "avatar_url",
  "bio": "user_bio",
  "contacts": ["user_id_1", "user_id_2"],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

### 2. **PUT /user/update_profile**
**Purpose:** Update user profile information and/or avatar

**When to use:**
- User edits their profile (username, phone, bio)
- User uploads/changes their profile picture
- Profile settings update

**Authentication:** Required (JWT)

**Request Body (Form Data):**
- `username`: string (optional)
- `phone`: string (optional)
- `bio`: string (optional)
- `avatar`: file (optional, image file)

**Response (Success - 200):**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "username": "updated_username",
    "phone": "updated_phone",
    "bio": "updated_bio",
    "avatar": "avatar_url"
  }
}
```

---

### 3. **GET /user/search**
**Purpose:** Search for a user by their unique user code

**When to use:**
- User enters another user's code to add them as contact
- Initiate new chat with unknown user
- Friend discovery feature

**Authentication:** Required (JWT)

**Query Parameters:**
- `code`: string (required) - The unique code of the user to search

**Response (Success - 200):**
```json
{
  "_id": "user_id",
  "username": "username",
  "avatar": "avatar_url",
  "userCode": "unique_code"
}
```

**Response (Error - 404):**
```json
{
  "message": "No user found with this code"
}
```

---

### 4. **GET /user/contact_search**
**Purpose:** Search within user's existing contacts by username

**When to use:**
- Search for a contact in user's contact list
- Filter/find contacts by name
- Contact list search functionality

**Authentication:** Required (JWT)

**Query Parameters:**
- `q`: string (required) - Search query (username)

**Response (Success - 200):**
```json
[
  {
    "_id": "user_id",
    "username": "contact_username",
    "avatar": "avatar_url"
  }
]
```

---

## Chat Routes

### 1. **POST /chat/create**
**Purpose:** Create a new one-to-one chat or return existing chat with another user

**When to use:**
- User clicks on a contact to open chat
- Initiate a new direct message conversation
- Access existing chat with a user

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "userId": "id_of_other_user"
}
```

**Response (Success - 200/201):**
```json
{
  "_id": "chat_id",
  "chatName": "sender",
  "isGroupChat": false,
  "users": [
    {
      "_id": "user_id_1",
      "username": "username1",
      "avatar": "avatar_url"
    },
    {
      "_id": "user_id_2",
      "username": "username2",
      "avatar": "avatar_url"
    }
  ],
  "latestMessage": "message_object",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Note:** Automatically adds both users to each other's contacts

---

### 2. **GET /chat/fetch**
**Purpose:** Retrieve all chats for the current user with latest messages

**When to use:**
- Load chat list on app startup
- Refresh chat list display
- Show all user conversations

**Authentication:** Required (JWT)

**Response (Success - 200):**
```json
[
  {
    "_id": "chat_id",
    "chatName": "sender",
    "isGroupChat": false,
    "users": [
      {
        "_id": "user_id",
        "username": "username",
        "avatar": "avatar_url"
      }
    ],
    "latestMessage": {
      "_id": "message_id",
      "content": "message_content",
      "createdAt": "timestamp"
    },
    "updatedAt": "timestamp"
  }
]
```

**Note:** Returns chats sorted by most recent first

---

## Message Routes

### 1. **POST /message/send**
**Purpose:** Send a new message in a chat (HTTP endpoint alternative)

**When to use:**
- Send message via HTTP (less common, WebSocket is preferred)
- Fallback when WebSocket is unavailable
- REST API message sending

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "content": "message_text",
  "chatId": "chat_id"
}
```

**Response (Success - 201):**
```json
{
  "_id": "message_id",
  "sender": {
    "_id": "user_id",
    "username": "username",
    "avatar": "avatar_url"
  },
  "chat": {
    "users": [
      {
        "_id": "user_id",
        "username": "username",
        "avatar": "avatar_url"
      }
    ]
  },
  "content": "message_text",
  "createdAt": "timestamp"
}
```

**Note:** Emits "message received" socket event to other chat users

---

### 2. **GET /message/:chatId**
**Purpose:** Retrieve all messages for a specific chat

**When to use:**
- Load chat history when opening a conversation
- Display all messages in a chat
- Initial message load or history pagination

**Authentication:** Required (JWT)

**URL Parameters:**
- `chatId`: string (required) - The ID of the chat

**Response (Success - 200):**
```json
[
  {
    "_id": "message_id",
    "sender": {
      "_id": "user_id",
      "username": "username",
      "avatar": "avatar_url"
    },
    "chat": "chat_id",
    "content": "message_content",
    "createdAt": "timestamp"
  }
]
```

**Note:** Returns messages sorted by creation time (oldest first)

---

## Status Routes

### 1. **POST /status/upload**
**Purpose:** Create and upload a new status with media file

**When to use:**
- User uploads a status (image/video)
- Create a story with optional caption
- Share status with contacts or everyone

**Authentication:** Required (JWT)

**Request Body (Form Data):**
- `media`: file (required) - Image or video file
- `caption`: string (optional) - Status caption/text
- `visibility`: string (optional) - "contacts" or "everyone" (default: "contacts")

**Response (Success - 201):**
```json
{
  "success": true,
  "status": {
    "_id": "status_id",
    "user": "user_id",
    "media": "cloudinary_url",
    "caption": "caption_text",
    "visibility": "contacts",
    "viewers": [],
    "expiresAt": "expiry_timestamp",
    "createdAt": "timestamp"
  }
}
```

**Note:** Status automatically expires after 24 hours

---

### 2. **GET /status/fetch**
**Purpose:** Retrieve all visible statuses for the current user

**When to use:**
- Load status feed
- Show statuses from contacts and public
- Display stories on status page

**Authentication:** Required (JWT)

**Response (Success - 200):**
```json
[
  {
    "_id": "status_id",
    "user": "user_id",
    "media": "cloudinary_url",
    "caption": "caption_text",
    "visibility": "contacts",
    "viewers": ["viewer_id_1"],
    "expiresAt": "expiry_timestamp",
    "createdAt": "timestamp"
  }
]
```

**Note:** Only returns non-expired statuses from user's contacts or public statuses

---

### 3. **POST /status/view/:statusId**
**Purpose:** Mark a status as viewed by current user

**When to use:**
- User clicks/opens a status
- Track who has viewed the status
- Update view count

**Authentication:** Required (JWT)

**URL Parameters:**
- `statusId`: string (required) - The ID of the status

**Response (Success - 200):**
```json
{
  "success": true
}
```

**Note:** Status owner receives "status viewed" socket event

---

### 4. **GET /status/viewers/:statusId**
**Purpose:** Get list of users who viewed a specific status

**When to use:**
- Status owner views who has seen their status
- Show view count and viewer list
- Status analytics

**Authentication:** Required (JWT)

**URL Parameters:**
- `statusId`: string (required) - The ID of the status

**Response (Success - 200):**
```json
{
  "count": 5,
  "viewers": [
    {
      "_id": "user_id",
      "username": "username",
      "avatar": "avatar_url"
    }
  ]
}
```

**Response (Error - 403):**
```json
{
  "message": "Not allowed"
}
```

**Note:** Only status owner can view the list

---

### 5. **GET /status/isonline/:userId**
**Purpose:** Check if a user is currently online

**When to use:**
- Show online status indicator
- Display "online" badge next to user name
- Determine if user is actively using app

**Authentication:** Not required

**URL Parameters:**
- `userId`: string (required) - The ID of the user to check

**Response (Success - 200):**
```json
{
  "success": true,
  "userId": "user_id",
  "online": true
}
```

---

## WebSocket Events

WebSocket events are used for real-time communication and are emitted/listened to on the client side.

### **Client → Server Events**

#### 1. **setup**
**Purpose:** Initialize user socket connection and register user as online

**When to use:**
- On app load, after user logs in
- Establish socket connection with user ID
- Mark user as online in Redis

**Emit:**
```javascript
socket.emit("setup", userId);
```

**Listens for:**
- `connected` event from server

**Backend Updates:**
- Stores user online status in Redis with 60-second expiry

---

#### 2. **heartbeat**
**Purpose:** Keep user's online status alive by extending Redis expiry

**When to use:**
- Periodically (every ~30 seconds) while app is running
- Prevent user from being marked offline
- Maintain active session indicator

**Emit:**
```javascript
socket.emit("heartbeat", userId);
```

**Backend Updates:**
- Extends online status expiry in Redis to 60 more seconds

---

#### 3. **send message**
**Purpose:** Send a message through WebSocket (real-time message delivery)

**When to use:**
- User sends a message in chat (preferred method)
- Real-time messaging instead of HTTP
- Instant message delivery to recipients

**Emit:**
```javascript
socket.emit("send message", {
  chat: chatId,
  content: "message_text"
});
```

**Handling:**
- Rate limited to 5 messages per 10 seconds per user
- Messages cached in Redis (last 50 per chat)
- Emits "message received" to other chat members

**Response on Error:**
```javascript
// Listen for
socket.on("error", (message) => {
  // "Too many messages, slow down!"
});
```

---

#### 4. **typing**
**Purpose:** Notify other users in chat that current user is typing

**When to use:**
- When user starts typing a message
- Real-time typing indicator
- Send on first keystroke in message input

**Emit:**
```javascript
socket.emit("typing", chatId);
```

**Broadcasting:**
- Sent to all users in the same chat room (except sender)

---

#### 5. **stop typing**
**Purpose:** Notify other users that current user stopped typing

**When to use:**
- When user finishes typing
- When message is sent
- When user clears input or loses focus
- After 3+ seconds of inactivity

**Emit:**
```javascript
socket.emit("stop typing", chatId);
```

**Broadcasting:**
- Sent to all users in the same chat room (except sender)

---

#### 6. **join chat**
**Purpose:** Join a specific chat room and request recent cached messages

**When to use:**
- User opens a chat conversation
- Switch between different chats
- Establish real-time connection to chat room

**Emit:**
```javascript
socket.emit("join chat", chatId);
```

**Backend Behavior:**
- Socket joins the chat room
- Retrieves last 50 cached messages from Redis
- Emits "recent messages" event with cached messages

---

### **Server → Client Events (Listening)**

#### 1. **connected**
**Purpose:** Confirmation that socket connection is established

**Listen:**
```javascript
socket.on("connected", () => {
  // Connection successful
});
```

**When received:**
- After emitting "setup" event
- User is now registered as online

---

#### 2. **message received**
**Purpose:** Receive a new message sent by another user in the chat

**Listen:**
```javascript
socket.on("message received", (message) => {
  // Add message to chat
});
```

**When received:**
- When another user sends a message in a chat you're part of
- Real-time message delivery
- Update chat UI with new message

**Message Object:**
```json
{
  "_id": "message_id",
  "sender": {
    "_id": "user_id",
    "username": "username",
    "avatar": "avatar_url"
  },
  "content": "message_text",
  "chat": "chat_id",
  "createdAt": "timestamp"
}
```

---

#### 3. **typing**
**Purpose:** Receive notification that another user is typing

**Listen:**
```javascript
socket.on("typing", (chatId) => {
  // Show typing indicator
});
```

**When received:**
- When another user starts typing in the same chat
- Display "user is typing..." indicator

---

#### 4. **stop typing**
**Purpose:** Receive notification that another user stopped typing

**Listen:**
```javascript
socket.on("stop typing", () => {
  // Hide typing indicator
});
```

**When received:**
- When another user stops typing in the chat
- Remove "user is typing..." indicator

---

#### 5. **recent messages**
**Purpose:** Receive cached messages when joining a chat room

**Listen:**
```javascript
socket.on("recent messages", (messages) => {
  // Display recent chat history
});
```

**When received:**
- After emitting "join chat" event
- Returns last 50 messages (most recent first)
- Use to populate chat history on chat open

**Messages Array:**
```json
[
  {
    "_id": "message_id",
    "sender": "user_id",
    "content": "message_text",
    "chat": "chat_id",
    "createdAt": "timestamp"
  }
]
```

---

#### 6. **new status**
**Purpose:** Receive notification of new status from contacts or yourself

**Listen:**
```javascript
socket.on("new status", (statusData) => {
  // Add to status feed
});
```

**When received:**
- When a contact or yourself uploads a new status
- Real-time status feed update

**Status Data:**
```json
{
  "userId": "user_id",
  "statusId": "status_id"
}
```

---

#### 7. **status viewed**
**Purpose:** Receive notification that someone viewed your status

**Listen:**
```javascript
socket.on("status viewed", (viewData) => {
  // Update view count
});
```

**When received:**
- When someone views one of your statuses
- Update status view count
- Add viewer to viewers list

**View Data:**
```json
{
  "statusId": "status_id",
  "viewerId": "user_id"
}
```

---

## Common Workflows

### **User Login & Initialization**
1. POST /auth/login → Get JWT token
2. GET /auth/current_user → Verify token
3. WebSocket "setup" → Register as online
4. GET /chat/fetch → Load chat list
5. WebSocket "heartbeat" → Keep alive (every 30s)

### **Start New Conversation**
1. GET /user/search?code=xxx → Find user by code
2. POST /chat/create → Create/get chat with user
3. WebSocket "join chat" → Join chat room
4. GET /message/:chatId → Load chat history

### **Send a Message**
1. WebSocket "send message" → Send message in real-time
2. Listen for "message received" on other clients
3. Message stored in MongoDB and cached in Redis

### **Share Status**
1. POST /status/upload → Upload status media
2. WebSocket "new status" → Broadcast to contacts
3. Contacts listen for "new status" event
4. POST /status/view/:statusId → Mark as viewed
5. Status owner receives "status viewed" event

### **Check User Online Status**
1. GET /status/isonline/:userId → Check Redis for user
2. Returns online: true/false

---

## Authentication

All routes except `/auth/register` and `/auth/login` require JWT authentication via the `protect` middleware.

**How to use:**
- Send JWT token in Authorization header: `Authorization: Bearer <token>`
- WebSocket authentication is handled by passing userId in "setup" event

---

## Error Handling

Common error responses:

- **400 Bad Request**: Missing or invalid parameters
- **401 Unauthorized**: Invalid credentials or expired token
- **403 Forbidden**: User not authorized for this action
- **404 Not Found**: Resource not found
- **500 Server Error**: Internal server error

---

## Performance Notes

- **Messages**: Cached in Redis (last 50 per chat) for quick retrieval
- **Online Status**: 60-second expiry in Redis, requires heartbeat to maintain
- **Statuses**: Auto-expire after 24 hours
- **Rate Limiting**: 5 messages per 10 seconds per user on WebSocket
- **Database**: MongoDB with indexes on userCode and status expiration

---

## Summary Table

| Feature | Type | Endpoint | Auth | Real-time |
|---------|------|----------|------|-----------|
| Login | REST | POST /auth/login | ❌ | ❌ |
| Register | REST | POST /auth/register | ❌ | ❌ |
| Current User | REST | GET /auth/current_user | ✅ | ❌ |
| Get Profile | REST | GET /user/me | ✅ | ❌ |
| Update Profile | REST | PUT /user/update_profile | ✅ | ❌ |
| Search Users | REST | GET /user/search | ✅ | ❌ |
| Search Contacts | REST | GET /user/contact_search | ✅ | ❌ |
| Create Chat | REST | POST /chat/create | ✅ | ❌ |
| Fetch Chats | REST | GET /chat/fetch | ✅ | ❌ |
| Send Message (REST) | REST | POST /message/send | ✅ | ❌ |
| Fetch Messages | REST | GET /message/:chatId | ✅ | ❌ |
| Upload Status | REST | POST /status/upload | ✅ | ❌ |
| Get Statuses | REST | GET /status/fetch | ✅ | ❌ |
| Mark Status Viewed | REST | POST /status/view/:statusId | ✅ | ❌ |
| Get Status Viewers | REST | GET /status/viewers/:statusId | ✅ | ❌ |
| Check Online | REST | GET /status/isonline/:userId | ❌ | ❌ |
| Setup Connection | WebSocket | "setup" | ✅ | ✅ |
| Heartbeat | WebSocket | "heartbeat" | ✅ | ✅ |
| Send Message (WS) | WebSocket | "send message" | ✅ | ✅ |
| Typing | WebSocket | "typing" | ✅ | ✅ |
| Stop Typing | WebSocket | "stop typing" | ✅ | ✅ |
| Join Chat | WebSocket | "join chat" | ✅ | ✅ |
