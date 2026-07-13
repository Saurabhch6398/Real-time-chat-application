# Real-Time Chat Application 💬🚀

A high-fidelity, real-time chat application featuring a beautiful **Expo (React Native) Frontend** and a robust **Node.js / Express / Socket.io Backend**. The app simulates interactive, real-time conversations with an AI bot (Ananya Sarkar) and other concurrent users, wrapped in a premium dark-themed glassmorphism interface.

---

## 🌟 Key Features & Bonus Implementations

- **Real-Time Communication**: Zero-refresh text updates powered by **Socket.io**.
- **Dummy Username-Based Login**: Set a custom nickname and select a vibrant avatar profile to enter the chat room.
- **Dynamic Typing Indicators**: Live visibility of who is typing in the chat room (e.g., "Ananya Sarkar is typing...").
- **Online/Offline User Status**: High-fidelity indicator showing the connection status of participants.
- **Message Delivered Status**: High-fidelity double tick marks (`✓✓`) displayed on user-sent messages to represent successful delivery.
- **Database Persistence**: Messages are saved in a local JSON database ([database.json](file:///c:/Users/chauh/OneDrive/Desktop/RealTime%20_Chatbot/backend/database.json)) on the server, retaining full chat history upon refresh or reconnection.
- **Automated Socket/API Verification**: Includes an end-to-end integration test runner ([verify-socket.js](file:///c:/Users/chauh/OneDrive/Desktop/RealTime%20_Chatbot/backend/verify-socket.js)) to validate REST APIs, WebSockets, database persistence, and bot responses.

---

## 📁 Repository Structure

```
RealTime_Chatbot/
├── backend/                  # Node.js + Express + Socket.io Server
│   ├── routes/
│   │   └── messages.js       # REST endpoints for fetching and posting message history
│   ├── socket/
│   │   └── chat.js           # Real-time WebSocket event triggers and bot reply flow
│   ├── db.js                 # Lowdb-style JSON file storage handler
│   ├── database.json         # Local message persistence store
│   ├── verify-socket.js      # Automated end-to-end testing script
│   ├── package.json
│   └── server.js             # Main server entrypoint (Port 5000)
│
├── frontend/                 # Expo (React Native) Client Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── _layout.tsx   # Root navigation layout
│   │   │   └── index.tsx     # Main Chatroom interface
│   │   ├── components/
│   │   │   ├── LoginScreen.tsx   # Custom nickname & avatar setup screen
│   │   │   ├── ChatHeader.tsx    # Header showing status & exit option
│   │   │   ├── MessageBubble.tsx # Animated text bubbles with timestamp & delivery tick marks
│   │   │   └── TypingIndicator.tsx # Custom micro-animated typing pulses
│   │   └── constants/
│   └── package.json
```

---

## ⚙️ Environment Variables & Configs

The backend server is designed to work out of the box with zero complex environment configurations:
- **`PORT`**: Defaults to `5000` (can be configured via your system env variables, e.g., `PORT=8080`).
- **Backend Server URL Configuration (Frontend)**: When launching the frontend, the app automatically attempts to resolve your local network IP (for physical device debugging over Wi-Fi). If needed, you can manually type or adjust the **Backend Server URL** on the Login Screen (e.g., `http://192.168.x.x:5000` or `http://localhost:5000`).

---

## 🚀 Project Setup & Execution

### 1. Prerequisites
Make sure you have **Node.js (v18+)** and **npm** installed.

---

### 2. Run the Backend Server

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Start the backend development server (runs nodemon for hot-reloads):
   ```bash
   npm run dev
   ```
   *The server will start on port `5000` and will log your Local Host URL as well as your Network IP Address.*

---

### 3. Run the Frontend Client

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npm run web
   ```
   *To run on physical mobile devices, download the **Expo Go** app and scan the QR code from the Expo terminal window. For desktop browsers, simply press `w` to launch on Expo Web.*

---

### 4. Run Integration Verification Tests
The backend features an automated WebSocket and API integration test suite.
1. Make sure you are in the `backend` directory.
2. Run the automated tests:
   ```bash
   node verify-socket.js
   ```
   *This starts an isolated test server on port `5001`, instantiates a websocket client, executes join, send, typing indicator, auto-reply, database save, and REST fetch assertions, prints a step-by-step log, and returns a clean checkmark confirmation (`ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY! ✅`).*

---

## 🎨 Design Decisions

1. **Rich & Premium Visuals**: 
   - Crafted a dark theme tailored around deep twilight tones (`#070C18` and Slate `#1E293B`) to avoid typical flat UI look.
   - Incorporated subtle, translucent glassmorphism container panels utilizing border highlights (`rgba(255,255,255,0.08)`) and ambient background mesh glows (Purple & Indigo glows) to give the application a premium, modern aesthetic.
2. **Smooth Micro-Animations**:
   - Implemented dynamic slide-up & fade-in transitions for incoming messages using the React Native `Animated` API to make conversations feel organic.
   - Built a custom pulsing chat typing indicator using a keyframe-like loop to reflect real-time activity.
3. **Data Integrity & Efficiency**:
   - Integrated REST APIs for loading historical chat threads on mount, preventing performance lag from loading large datasets over WebSockets.
   - Used WebSocket events strictly for light-weight real-time streams (message broadcasting, active statuses, and typing indicators).

---

## 🧠 Assumptions Made

1. **Global Chat Room**: The application assumes all users connect to a single, shared global lobby room.
2. **Ananya Sarkar (Bot)**: 
   - A simulated chatbot named **Ananya Sarkar** stays persistent in the lobby.
   - She reacts to specific user text triggers like `hello`, `socket`, `persist`, or `how are you` to answer questions, or sends a randomly selected conversational prompt when no matches occur.
3. **Dummy Auth**: The application relies on local client state to store user profiles (nicknames and emojis). It does not persist full user user accounts on the server to keep user setup simple and instant.
4. **Local Network Resolution**: The Expo config uses local host uri splits to automatically resolve IP addresses for cross-device synchronization on local Wi-Fi connections.

---

## 🌐 Step-by-Step Render Deployment Guide (Backend)

To deploy the Node.js/Express backend on **Render**, follow these precise steps:

### 1. Push Latest Changes to GitHub
Ensure all your project files (including the root-level `README.md`) are pushed to your GitHub repository:
```bash
git add .
git commit -m "docs: Update README with deployment and project setup instructions"
git push origin main
```

### 2. Create a Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com/) and log in (using your GitHub account).
2. Click the **New +** button in the top navigation bar and select **Web Service**.
3. Select your repository `Saurabhch6398/Real-time-chat-application` (if it's not visible, click "Configure GitHub App" to grant Render access).

### 3. Configure the Deployment Settings
On the Web Service configuration page, enter the following settings:
- **Name**: `realtime-chat-backend` (or any name of your choice)
- **Region**: Select the region closest to you (e.g., `Singapore` or `Oregon`)
- **Branch**: `main`
- **Root Directory**: `backend` *(CRITICAL: Since your backend is in a subfolder, setting this tells Render to run build/start commands inside `backend/`)*
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### 4. Deploy!
- Click **Create Web Service** at the bottom of the page.
- Render will pull your repository, enter the `backend` subdirectory, install dependencies, and spin up the server.
- Once deployed, Render will provide you with a live URL (e.g., `https://realtime-chat-backend.onrender.com`).

> [!WARNING]
> **Ephemeral Storage Warning**: On Render's Free tier, the server instance spins down after a period of inactivity, and the file system is ephemeral. Any data saved to `database.json` will reset upon restarts. For persistent production use, you should modify [db.js](file:///c:/Users/chauh/OneDrive/Desktop/RealTime%20_Chatbot/backend/db.js) to connect to a cloud database (such as MongoDB Atlas or SQLite hosted on a persistent disk).

### 5. Update the Frontend URL
Once your backend is live:
1. Open [index.tsx](file:///c:/Users/chauh/OneDrive/Desktop/RealTime%20_Chatbot/frontend/src/app/index.tsx) in your editor.
2. In the `getBackendUrl` or fallback configuration, update the server URL to point to your live Render URL instead of `localhost:5000`:
   ```typescript
   // In frontend/src/app/index.tsx
   const BACKEND_URL = 'https://realtime-chat-backend.onrender.com';
   ```

