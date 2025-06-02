# Chat Application

## Technology Stack

### Frontend
- **React** - User interface framework
- **Zustand** - State management
- **Axios** - HTTP client for API requests
- **Socket.io** - Real-time communication

### Backend
- **Node.js** - Server runtime
- **Socket.io** - Real-time WebSocket handling
- **JWT** - Authentication tokens
- **Cloudinary** - File/image storage (pre-configured)

## Architecture

### API Structure
- **REST API** - Used for opening chats and general data fetching
- **Socket API** - Used for real-time messaging, editing messages, and live interactions

### Middleware
- **Authentication Middleware** - JWT token validation
- **Data Validation Middleware** - Request data validation

## Routes Structure

All route handlers are organized in the `/routes` directory:

- **Authentication Routes** - User login/signup
- **User Routes** - Profile management (get/update profile)  
- **Suggestions Routes** - Chat suggestions functionality
- **Refresh Token Routes** - Token management
- **Chat Routes** - Chat-related operations

## Frontend Configuration

### API Integration
- Centralized API configuration file for all HTTP requests
- Axios instance with base configuration

### Environment Variables
```
REACT_APP_API_URL=your_api_base_url/api
REACT_APP_SOCKET_URL=your_socket_server_url
```

**Note:** The API URL includes `/api` namespace for organized endpoint routing, separate from Socket.io connections.

## Setup Instructions

### Backend
1. Install dependencies: `npm install`
2. Configure environment variables (Cloudinary config included)
3. Start server: `npm start`

### Frontend  
1. Install dependencies: `npm install`
2. Set environment variables in `.env`
3. Start development server: `npm start`

## Real-time Features

The application uses Socket.io for real-time communication:
- Message sending/receiving
- Message editing
- Live chat updates
- Real-time user interactions