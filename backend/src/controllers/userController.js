const { User } = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        login: user.login,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { login, email, password, firstName, lastName, phone, role } = req.body;
    if (!login || !email || !password) {
      return res.status(400).json({ message: 'Login, email, and password are required.' });
    }
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { login }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email or login already exists.' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      login,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role
    });
    await user.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
