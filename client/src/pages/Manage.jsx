import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getData, postData } from "../services/api";
import meetingImg from "../assets/Manage.png";


function Manage() {
  const navigate = useNavigate();
  const [Id, setId] = useState("");
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const endpoint = "lobby";
      const payload = { Id };
      const res = await postData(endpoint, payload);
      if (!res.success) {
        setError(res.message || "Something went wrong");
        return;
      }
      navigate(`/lobby/${Id}`);
    } catch (err) {
      setError("Server error");
    }
  }

  async function handleCreateInstant() {
    try {
      const res = await postData("lobby/create-meeting");
      if (!res.success) {
        setError(res.message || "Something went wrong");
        return;
      }
      navigate(`/lobby/${res.meetingId}`);
    } catch (err) {
      setError("Server error");
    }
  }

  async function handleCreateLater() {
    try {
      const res = await postData("lobby/create-meeting-later");
      if (!res.success) {
        setError(res.message || "Something went wrong");
        return;
      }
      navigate(`/lobby/${res.meetingId}`);
    } catch (err) {
      setError("Server error");
    }
  }

  

 return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 overflow-hidden">

      {/* Background Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400/30 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-400/20 blur-3xl rounded-full"></div>

      {/* Subtle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-12 py-6">
        <h1 className="text-3xl font-bold tracking-wide text-gray-900">
          Connect<span className="text-blue-600">Meet</span>
        </h1>
       
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-12 py-16 gap-16">

        {/* LEFT SIDE */}
        <div className="flex-1 max-w-xl">

          <h2 className="text-5xl font-bold leading-tight mb-6 text-gray-900">
            Connect With Anyone, <br />
            <span className="text-blue-600">Anywhere Instantly</span>
          </h2>

          <p className="text-gray-600 text-lg mb-10">
            Secure, high-quality meetings with instant rooms,
            smart scheduling and real-time collaboration.
          </p>

          {/* Meeting Card */}
          <div className="relative bg-white shadow-2xl rounded-3xl p-10 border border-gray-200">

            {/* New Meeting */}
            <div className="relative mb-6">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-blue-500/40 transition"
              >
                + Start New Meeting
              </button>

              {showDropdown && (
                <div className="absolute w-full mt-3 rounded-xl bg-white border border-gray-200 shadow-xl overflow-hidden">
                  <div
                    onClick={handleCreateInstant}
                    className="px-5 py-3 hover:bg-gray-100 cursor-pointer transition"
                  >
                    ⚡ Start Instantly
                  </div>
                  <div
                    onClick={handleCreateLater}
                    className="px-5 py-3 hover:bg-gray-100 cursor-pointer transition"
                  >
                    📅 Schedule Meeting
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Join Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                name="Id"
                value={Id}
                placeholder="Enter Meeting ID"
                onChange={(e) => setId(e.target.value)}
                className="border border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                className="py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-green-500/40 transition"
              >
                Join Meeting
              </button>
            </form>

            {error && (
              <p className="text-red-500 text-sm mt-5 text-center">{error}</p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="flex-1 relative flex justify-center items-center">

          <div className="absolute w-96 h-96 bg-blue-400/30 blur-3xl rounded-full"></div>

          <img
            src={meetingImg}
            alt="Meeting Illustration"
            className="relative w-full max-w-lg drop-shadow-2xl"
          />

          {/* Floating badges */}
          <div className="absolute top-10 left-10 bg-white shadow-md px-4 py-2 rounded-xl text-sm">
            🔒 Secure
          </div>

          <div className="absolute bottom-10 right-10 bg-white shadow-md px-4 py-2 rounded-xl text-sm">
            🎥 HD Video
          </div>
        </div>

      </section>
      
    </div>
  ); 
}

export default Manage;