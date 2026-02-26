const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
        console.log("REGISTER BODY:", req.body); // 👈 ADD THIS

    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password required' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
  console.error("REGISTER ERROR:", err); // 👈 ADD THIS
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("LOGIN BODY:", req.body); // 👈 ADD

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    console.log("USER FOUND:", user); // 👈 ADD

    if (!user)
      return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    console.log("PASSWORD MATCH:", match); // 👈 ADD

    if (!match)
      return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err); // 👈 ADD
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.logout = (req, res) => {
  return res.json({
    success: true,
    message: "Logged out. Delete token on frontend."
  });
};
