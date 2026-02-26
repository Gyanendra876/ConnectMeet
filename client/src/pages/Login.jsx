import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postData } from "../services/api";
import banner from "../assets/login.png";

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "auth/login" : "auth/register";
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : form;

      const res = await postData(endpoint, payload);

      if (!res.success) {
        setError(res.message || "Something went wrong");
        return;
      }

      if (res.token) {
        localStorage.setItem("token", res.token);
      }

      navigate("/Ma");
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE - IMAGE SECTION */}
      <div className="hidden lg:flex w-1/2 relative">
        <img
          src={banner}
          alt="Connect Banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* RIGHT SIDE - FORM SECTION */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 bg-white px-8">

        <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">

          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
            {isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
          </h2>

          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-full p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`w-1/2 py-2 rounded-full font-medium transition ${
                isLogin
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600"
              }`}
            >
              Login
            </button>

            <button
              onClick={() => setIsLogin(false)}
              className={`w-1/2 py-2 rounded-full font-medium transition ${
                !isLogin
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600"
              }`}
            >
              Signup
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            )}

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Login"
                : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Secure & Reliable WebRTC Platform
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;