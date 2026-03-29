import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';

export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('Email already registered');
  }

  const user = new User({ name, email, password });
  await user.save();

  const token = generateToken(user._id);
  return { user: user.toJSON(), token };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user._id);
  return { user: user.toJSON(), token };
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
};
