const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const { JWT_SECRET, BCrypt_SALT_ROUNDS } = require('../config/env');

class AuthController {
  
  static async register(req, res) {
    try {
      const { username, email, password } = req.body;

      
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists.'
        });
      }

      const existingUsername = await UserModel.findByUsername(username);
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: 'Username is already taken.'
        });
      }

      
      const hashedPassword = await bcrypt.hash(password, BCrypt_SALT_ROUNDS);

      
      const user = await UserModel.create({
        username,
        email,
        password: hashedPassword
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Error registering user.',
        error: error.message
      });
    }
  }

  
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

  
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email, is_admin: user.is_admin || false },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            is_admin: user.is_admin || false, // Included in response for frontend tracking
            created_at: user.created_at
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error logging in.',
        error: error.message
      });
    }
  }
}

module.exports = AuthController;