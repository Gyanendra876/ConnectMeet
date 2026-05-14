 ConnectMeet – Real-Time Video Conferencing Platform

ConnectMeet is a full-stack real-time video conferencing application built using WebRTC and Socket.io. It enables secure multi-user meetings with live video/audio streaming, screen sharing, and real-time chat.

🚀 Live Demo

🔹 Frontend: https://connectmeet-client.onrender.com

🔹 Backend API: https://connectmeet-server.onrender.com


✨ Features

🔐 JWT-based Authentication (Login / Signup)

🎥 Real-time Video & Audio Streaming (WebRTC)

💬 Live Chat inside meeting rooms

👥 Multi-user meeting support

🔊 Mute / Unmute functionality

📷 Camera On / Off control

🖥 Screen Sharing (Dynamic track replacement)

📅 Instant & Scheduled Meeting creation

🔁 Real-time participant join/leave updates

🎨 Modern Responsive UI (Tailwind CSS)

🏗 Architecture Overview

Frontend (React)
⬇
Socket.io (Signaling Server)
⬇
WebRTC Peer-to-Peer Connections
⬇
MongoDB (User & Meeting Data)

WebRTC handles media streaming.

Socket.io handles signaling (offer/answer/ICE exchange).

Express.js handles REST APIs.

JWT secures protected routes.

🛠 Tech Stack

Frontend:

React.js

Tailwind CSS

Socket.io-client

WebRTC

Backend:

Node.js

Express.js

MongoDB

Socket.io

JWT Authentication

CORS & Middleware

Deployment:

Render (Frontend & Backend)

⚙️ Installation & Setup (Local Development)
1️⃣ Clone Repository
git clone https://github.com/your-username/ConnectMeet.git
cd ConnectMeet
2️⃣ Setup Backend
cd server
npm install

Create .env file inside server folder:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173

Run backend:

npm run dev
3️⃣ Setup Frontend
cd client
npm install

Create .env file:

VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

Run frontend:

npm run dev
🌐 Production Environment Variables

Backend (Render):

PORT=10000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_URL=https://your-frontend-link.onrender.com

Frontend:

VITE_API_URL=https://your-backend-link.onrender.com/api
VITE_SOCKET_URL=https://your-backend-link.onrender.com
📡 How WebRTC Signaling Works

User joins meeting

Socket emits join-meeting

Existing users create peer connection

Offer → Answer exchange

ICE candidates exchanged

Direct peer-to-peer media streaming established

🔒 Security

Password hashing

JWT token verification

Protected meeting routes

CORS configuration

Authenticated Socket connections

📦 Project Structure
ConnectMeet/
│
├── client/         # React frontend
├── server/         # Node.js backend
└── README.md
🚀 Future Improvements

Recording meetings

Meeting chat history storage

Host controls

Waiting room approval

Raise hand feature

Performance scaling with TURN servers

👨‍💻 Author

Gyanendra Sinha
GitHub: https://github.com/Gyanendra876
