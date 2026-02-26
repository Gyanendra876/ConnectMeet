import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../services/socket";


function Lobby() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");


  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    socket.auth = { token };

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      socket.emit("join-meeting", id);
    };

    const handleAllUsers = (usersList) => {
      setUsers(usersList);
    };

    const handleUserJoined = (user) => {
      setUsers((prev) => {
        const exists = prev.find((u) => u.id === user.id);
        if (exists) return prev;
        return [...prev, user];
      });
    };

    const handleUserLeft = (userId) => {
      setUsers((prev) =>
        prev.filter((u) => u.id !== userId)
      );
    };

    

    socket.on("connect", handleConnect);
    socket.on("all-users", handleAllUsers);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("all-users", handleAllUsers);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
    };
  }, [id, navigate]);

  function handleSend() {
    if (!input.trim()) return;

    socket.emit("send-message", {
      meetingId: id,
      message: input,
    });

    setInput("");
  }

  function handleLeave() {
    socket.disconnect();
    navigate("/Ma");
  }
  function  handleCreate(){
    navigate(`/Meeting/${id}`);
  }
  return (
  <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 overflow-hidden">

    {/* Background Glow */}
    <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400/30 blur-3xl rounded-full"></div>
    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-400/20 blur-3xl rounded-full"></div>

    {/* Main Container */}
    <div className="relative z-10 flex flex-col items-center px-6 py-12">

      {/* Title Section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Waiting Room
        </h1>
        <p className="text-gray-500 mt-2">
          Meeting ID: <span className="font-semibold text-blue-600">{id}</span>
        </p>
      </div>

      {/* Lobby Card */}
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-3xl border border-gray-200 p-10">

        {/* Users Section */}
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          Participants ({users.length})
        </h3>

        {users.length === 0 ? (
          <p className="text-gray-400">Waiting for others to join...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col items-center bg-gray-50 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold mb-3">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <p className="text-gray-700 font-medium">
                  {user.name}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-500 mt-6 text-center">{error}</p>
        )}

        {/* Buttons */}
        <div className="flex justify-center gap-6 mt-10">
          <button
            onClick={handleCreate}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-blue-500/40 transition"
          >
            🎥 Enter Meeting
          </button>

          <button
            onClick={handleLeave}
            className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  </div>
);

 

}

export default Lobby;
