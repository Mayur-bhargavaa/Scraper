import * as authService from '../services/auth.service.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const result = await authService.registerUser({ name, email, password });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const result = await authService.loginUser({ email, password });
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

export const updateSettings = async (req, res) => {
  try {
    const { apiKeys } = req.body;
    const user = req.user;
    user.apiKeys = { ...user.apiKeys, ...apiKeys };
    await user.save();
    res.json({ message: 'Settings updated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
