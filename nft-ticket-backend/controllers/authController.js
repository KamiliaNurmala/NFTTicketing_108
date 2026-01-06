const User = require('../models/User');
const jwt = require('jsonwebtoken');

class AuthController {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'All fields required' 
        });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already exists' 
        });
      }

      const user = await User.create({ name, email, password });

      res.json({
        success: true,
        userId: user.id,
        message: 'User registered successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      const isValid = await user.validatePassword(password);
      if (!isValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          walletAddress: user.walletAddress
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async connectWallet(req, res) {
    try {
      const { walletAddress } = req.body;
      const userId = req.user.id;
  
      // Normalize to lowercase for comparison
      const normalizedAddress = walletAddress.toLowerCase();
  
      // Check if wallet is already connected to ANOTHER user
      const { Op } = require('sequelize');
      const existingUser = await User.findOne({ 
        where: { 
          walletAddress: {
            [Op.ne]: null  // wallet not null
          }
        }
      });
  
      // Check all users with wallets for case-insensitive match
      const allUsersWithWallets = await User.findAll({
        where: {
          walletAddress: {
            [Op.ne]: null
          }
        }
      });
  
      const conflictUser = allUsersWithWallets.find(u => 
        u.walletAddress.toLowerCase() === normalizedAddress && u.id !== userId
      );
  
      if (conflictUser) {
        return res.status(400).json({
          success: false,
          message: 'This wallet is already connected to another account'
        });
      }
  
      await User.update(
        { walletAddress },
        { where: { id: userId } }
      );
  
      res.json({
        success: true,
        message: 'Wallet connected successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuthController();