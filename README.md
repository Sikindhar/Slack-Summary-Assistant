# Todo Summary Assistant

A full-stack application that helps users manage their todos and automatically generates summaries using AI, with Slack integration for team collaboration.

## Features

- 🔐 User authentication with Firebase
- ✏️ Create, read, update, and delete todos
- ✅ Mark todos as complete/incomplete
- 🤖 AI-powered todo summarization using Cohere
- 📱 Slack integration for sharing summaries
- 🎨 Modern, responsive UI with smooth animations
- 📱 Mobile-friendly design

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- ShadCn for necessary components
- Radix UI for accessible components
- Firebase Authentication
- Sonner for toast notifications

### Backend
- Node.js with Express
- TypeScript
- Firebase Admin SDK
- Cohere AI for text generation
- Slack API integration

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Cohere AI account
- Slack workspace with webhook access

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd todo-summary-assistant
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both client and server directories
   - Fill in the required values (see Environment Variables section)

4. Start the development servers:
```bash
# Start the backend server (from server directory)
npm run dev

# Start the frontend development server (from client directory)
npm run dev
```

## Environment Variables

### Client (.env)

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5000
```

### Server (.env)

```
PORT=5000
FIREBASE_SERVICE_ACCOUNT=your_service_account_json
COHERE_API_KEY=your_cohere_api_key_here
SLACK_WEBHOOK_URL=your_slack_webhook_url_here
```

## Setting Up External Services

### Firebase Setup
1. Create a new Firebase project
2. Enable Authentication (Email/Password)
3. Create a web app in your Firebase project
4. Get the configuration values from Firebase Console
5. For server-side, generate a new private key from Project Settings > Service Accounts

### Cohere AI Setup
1. Sign up for a Cohere account
2. Generate an API key from the dashboard
3. The API key will be used for generating todo summaries

### Slack Setup
1. Create a new Slack app in your workspace
2. Enable Incoming Webhooks
3. Create a new webhook URL for your channel
4. Copy the webhook URL to your server's .env file

## Architecture Decisions

### Frontend Architecture
- **Component Structure**: Used a modular approach with separate components for different features
- **State Management**: Leveraged React's built-in state management with hooks
- **UI Components**: Used Radix UI for accessible, unstyled components with Tailwind CSS for styling
- **Form Handling**: Implemented controlled components for form management
- **Error Handling**: Implemented toast notifications for user feedback

### Backend Architecture
- **API Design**: RESTful API design with proper HTTP methods
- **Authentication**: Firebase Admin SDK for secure token verification - used simple email auth
- **Database**: Firebase Firestore for real-time data storage
- **Error Handling**: Comprehensive error handling with proper status codes
- **Middleware**: Custom middleware for authentication and request validation

### Security Considerations
- JWT-based authentication
- Environment variables for sensitive data
- Input validation on both client and server
- CORS configuration
- Rate limiting (to be implemented)



## Acknowledgments

- [Firebase](https://firebase.google.com/)
- [Cohere AI](https://cohere.ai/)
- [Slack API](https://api.slack.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)