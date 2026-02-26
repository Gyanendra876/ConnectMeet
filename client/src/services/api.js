const API_URL = "http://localhost:5000/api";

// token header helper
export const getTokenHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
};

// GET helper
export const getData = async (endpoint) => {
  const res = await fetch(`${API_URL}/${endpoint}`, {
    headers: { "Content-Type": "application/json", ...getTokenHeader() },
        credentials: "include", // ✅ good practice

  });
  return res.json();
};

// POST helper
export const postData = async (endpoint, data = {}) => {
  const res = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getTokenHeader() },
        credentials: "include", // ✅ ADD THIS

    body: JSON.stringify(data),
  });
  return res.json();
};

