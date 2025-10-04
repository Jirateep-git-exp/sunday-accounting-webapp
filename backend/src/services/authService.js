const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  async register(userData) {
    try {
      const existingUser = await User.findOne({ 
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      const user = new User(userData);
      await user.save();

      const token = this.generateToken(user);
      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      const token = this.generateToken(user);
      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  generateToken(user) {
    return jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '6h' }
    );
  }
}

module.exports = new AuthService();
