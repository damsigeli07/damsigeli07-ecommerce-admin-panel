import express from 'express';
import { Order, User } from '../models/index.js';
import { comparePassword, hashPassword } from '../utils/passwordUtils.js';
import { generateToken } from '../utils/tokenUtils.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/login
 * Authenticate user and return JWT token
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'email', 'password', 'role', 'name', 'isActive']
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Return token and user info (excluding password)
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
});

/**
 * GET /api/me
 * Get current user info (protected route)
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // Get full user info with relationships
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'role', 'name', 'isActive', 'createdAt'],
      include: [
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'totalAmount', 'status', 'createdAt'],
          limit: 5,
        }
      ],
      order: [[{ model: Order, as: 'orders' }, 'createdAt', 'DESC']]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/profile
 * Update user profile (name, email, password)
 * Body: { name, email, currentPassword?, newPassword? }
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Find user
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'password', 'name', 'role']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed to one that already exists
    if (email !== user.email) {
      const existingUser = await User.findOne({
        where: { email },
        attributes: ['id']
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Prepare update data
    const updateData = {
      name: name.trim(),
      email: email.trim().toLowerCase()
    };

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change password'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      updateData.password = await hashPassword(newPassword);
    }

    // Update user
    await user.update(updateData);

    // Return updated user info (excluding password)
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        email: updateData.email,
        name: updateData.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
});

/**
 * POST /api/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

export default router;
