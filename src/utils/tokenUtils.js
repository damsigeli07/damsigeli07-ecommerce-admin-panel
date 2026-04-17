import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with id, email, role
 * @returns {string} - JWT token
 */
export const generateToken = (user) => {
  try {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h', // Token expires in 24 hours
      issuer: 'ecommerce-admin-panel',
      audience: 'ecommerce-users'
    });

    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Token generation failed');
  }
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'ecommerce-admin-panel',
      audience: 'ecommerce-users'
    });

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      console.error('Error verifying token:', error);
      throw new Error('Token verification failed');
    }
  }
};
