import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../services/socket";
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiMonitor,
  FiPhoneOff,
  FiSend,
} from "react-icons/fi";

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function Meeting() {
  const { id } = useParams();
  const navigate = useNavigate();

  // CHAT
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  // WEBRTC
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerRef = useRef({});
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [muteStatus, setMuteStatus] = useState({});
  const [cameraStatus, setCameraStatus] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeScreen, setActiveScreen] = useState(null);
  const [showChat, setShowChat] = useState(false);
  

  // ================== START MEDIA FIRST ==================
  useEffect(() => {
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localStreamRef.current = stream;
        localVideoRef.current.srcObject = stream;

        socket.emit("join-meeting", id);
      } catch (err) {
        console.log("Media error:", err);
      }
    }

    init();
  }, [id]);

  // ================== SOCKET ==================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    socket.auth = { token };
    if (!socket.connected) socket.connect();

    // CHAT
    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // EXISTING USERS
    socket.on("all-users", async (users) => {
      const others = users.filter((u) => u.id !== socket.id);

      for (let user of others) {
        const peer = createPeer(user.id);

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit("offer", {
          offer,
          to: user.id,
        });
      }
    });

    // NEW USER JOINED
    socket.on("user-joined", async (user) => {
      const peer = createPeer(user.id);

    });
    // MUTE STATUS LISTENER
socket.on("mute-status", ({ userId, isMuted }) => {
  setMuteStatus((prev) => ({
    ...prev,
    [userId]: isMuted,
  }));
});

// CAMERA STATUS LISTENER
socket.on("camera-status", ({ userId, isCameraOff }) => {
  setCameraStatus((prev) => ({
    ...prev,
    [userId]: isCameraOff,
  }));
});

    // RECEIVE OFFER
    socket.on("offer", async ({ offer, from }) => {
      const peer = createPeer(from);

      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("answer", {
        answer,
        to: from,
      });
    });

    // RECEIVE ANSWER
    socket.on("answer", async ({ answer, from }) => {
      if (peerRef.current[from]) {
        await peerRef.current[from].setRemoteDescription(answer);
      }
    });

    // RECEIVE ICE
    socket.on("ice-candidate", async ({ candidate, from }) => {
      if (peerRef.current[from]) {
        await peerRef.current[from].addIceCandidate(candidate);
      }
    });

    // USER LEFT
    socket.on("user-left", (userId) => {
      if (peerRef.current[userId]) {
        peerRef.current[userId].close();
        delete peerRef.current[userId];
      }

      setRemoteStreams((prev) =>
        prev.filter((user) => user.id !== userId)
      );
    });

    return () => {
      socket.off("receive-message");
      socket.off("all-users");
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-left");
      socket.off("mute-status");
      socket.off("camera-status");
    };
  }, [id, navigate]);

  // ================== CREATE PEER ==================
  function createPeer(userId) {
    if (peerRef.current[userId]) {
      return peerRef.current[userId];
    }

    const peer = new RTCPeerConnection(configuration);
    peerRef.current[userId] = peer;

    // Add local tracks
    localStreamRef.current
      ?.getTracks()
      .forEach((track) => {
        peer.addTrack(track, localStreamRef.current);
      });

    // Remote stream
    peer.ontrack = (event) => {
  const stream = event.streams[0];

  const videoTrack = stream.getVideoTracks()[0];

  // If screen share (display track label usually includes "screen")
  if (videoTrack.label.toLowerCase().includes("screen")) {
    setActiveScreen({ id: userId, stream });
  }

  setRemoteStreams((prev) => {
    const exists = prev.find((u) => u.id === userId);
    if (exists) return prev;
    return [...prev, { id: userId, stream }];
  });
};

    // ICE
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          to: userId,
        });
      }
    };

    return peer;
  }
  function toggleMute() {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;
    const muted = !audioTrack.enabled;

    setIsMuted(muted);

    socket.emit("mute-status", {
      meetingId: id,
      isMuted: muted,
    });
  }

  // ================== TOGGLE CAMERA ==================
  function toggleCamera() {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;
    const cameraOff = !videoTrack.enabled;

    setIsCameraOff(cameraOff);

    socket.emit("camera-status", {
      meetingId: id,
      isCameraOff: cameraOff,
    });
  }
async function startScreenShare() {
  try {
    const screenStream =
      await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

    const screenTrack = screenStream.getVideoTracks()[0];

    // Replace track in ALL peers
    Object.values(peerRef.current).forEach((peer) => {
      const sender = peer
        .getSenders()
        .find((s) => s.track.kind === "video");

      if (sender) {
        sender.replaceTrack(screenTrack);
      }
    });

    // Replace local preview
    localVideoRef.current.srcObject = screenStream;

    setIsScreenSharing(true);

    // When user stops sharing from browser UI
    screenTrack.onended = () => {
      stopScreenShare();
    };

  } catch (err) {
    console.log(err);
  }
}
function stopScreenShare() {
  const cameraTrack =
    localStreamRef.current.getVideoTracks()[0];

  Object.values(peerRef.current).forEach((peer) => {
    const sender = peer
      .getSenders()
      .find((s) => s.track.kind === "video");

    if (sender) {
      sender.replaceTrack(cameraTrack);
    }
  });

  localVideoRef.current.srcObject = localStreamRef.current;
  setIsScreenSharing(false);
}

  // ================== CHAT SEND ==================
  function handleSend() {
    if (!input.trim()) return;

    socket.emit("send-message", {
      meetingId: id,
      message: input,
    });

    setInput("");
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
return (
  <div className="h-screen w-full flex flex-col bg-white text-gray-800">

    {/* HEADER */}
    <div className="flex justify-between items-center px-6 py-4 bg-white border-b">
      <h1 className="text-lg font-semibold text-indigo-600">
        ConnectMeet
      </h1>

      <button
        onClick={() => setShowChat(!showChat)}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition"
      >
        Chat
      </button>
    </div>

    {/* MAIN */}
    <div className="flex flex-1 relative overflow-hidden">

      {/* FULL SCREEN LOCAL VIDEO */}
      <div className="flex-1 bg-black relative">

        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Remote Videos Bottom Right */}
        {/* Remote Videos Bottom Right - 2 Column Layout */}
<div className="absolute bottom-6 right-6 grid grid-cols-2 gap-4 max-w-[420px]">

  {remoteStreams.map((user, index) => (
    <div
      key={user.id}
      className="relative w-40 aspect-video bg-black rounded-xl overflow-hidden shadow-lg border"
    >
      {cameraStatus[user.id] ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          <FiVideoOff size={26} className="text-gray-600" />
        </div>
      ) : (
        <video
          autoPlay
          playsInline
          ref={(video) => {
            if (video) video.srcObject = user.stream;
          }}
          className="w-full h-full object-cover"
        />
      )}

      {muteStatus[user.id] && (
        <div className="absolute top-2 right-2 bg-red-500 p-1 rounded-full text-white">
          <FiMicOff size={14} />
        </div>
      )}
    </div>
  ))}

</div>
              </div>

      {/* CHAT SLIDE PANEL */}
      <div
        className={`absolute top-0 right-0 h-full w-80 bg-white border-l shadow-xl transform transition-transform duration-300 ${
          showChat ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b font-semibold text-gray-800">
          Chat
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className="bg-gray-100 p-3 rounded-lg text-sm shadow-sm"
            >
              <div className="font-semibold text-indigo-600">
                {msg.senderName}
              </div>
              <div>{msg.message}</div>
              <div className="text-xs text-gray-400 mt-1">
                {msg.time}
              </div>
            </div>
          ))}
          <div ref={bottomRef}></div>
        </div>

        <div className="p-4 border-t flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type message..."
            className="flex-1 px-3 py-2 bg-gray-100 rounded-lg focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </div>

    {/* CONTROL BAR */}
    <div className="flex justify-center items-center py-5 bg-white border-t">

      <div className="flex items-center gap-6 bg-gray-100 px-8 py-3 rounded-full shadow">

        <button
          onClick={toggleMute}
          className={`p-3 rounded-full ${
            isMuted
              ? "bg-red-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-3 rounded-full ${
            isCameraOff
              ? "bg-red-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {isCameraOff ? <FiVideoOff size={20} /> : <FiVideo size={20} />}
        </button>

        <button
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          className="p-3 rounded-full bg-gray-200 hover:bg-gray-300"
        >
          <FiMonitor size={20} />
        </button>

        <button
          onClick={() => navigate("/") }
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white"
        >
          <FiPhoneOff size={20} />
        </button>

      </div>
    </div>
  </div>
);
}

export default Meeting;
