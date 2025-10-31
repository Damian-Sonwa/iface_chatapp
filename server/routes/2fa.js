const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const User = require('../models/User');
const { generateCode, storeCode, verifyCode, sendEmailCode, sendSMSCode } = require('../utils/twoFactor');

// All routes require authentication except send-code which might be called during login
// We'll handle auth per route where needed

/**
 * POST /api/auth/2fa/setup
 * Start 2FA setup - generate and send verification code
 * Requires authentication
 */
router.post('/setup', authController.verifyToken, async (req, res) => {
  try {
    const { method } = req.body; // 'email' or 'phone'
    const userId = req.userId;

    if (!['email', 'phone'].includes(method)) {
      return res.status(400).json({ error: 'Method must be email or phone' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate user has the required contact method
    if (method === 'email' && !user.email) {
      return res.status(400).json({ error: 'Email address not set' });
    }
    if (method === 'phone' && !user.phoneNumber) {
      return res.status(400).json({ error: 'Phone number not set' });
    }

    // Generate verification code
    const code = generateCode();
    
    // Store code
    storeCode(userId, code, method);

    // Send code
    try {
      if (method === 'email') {
        await sendEmailCode(user.email, code, user.username);
      } else {
        await sendSMSCode(user.phoneNumber, code, user.username);
      }

      res.json({
        success: true,
        message: `Verification code sent to your ${method}`,
        method,
        // Include code in dev mode for testing
        ...(process.env.NODE_ENV === 'development' && { devCode: code })
      });
    } catch (error) {
      console.error('Send code error:', error);
      res.status(500).json({ error: `Failed to send ${method} code` });
    }
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/auth/2fa/send-code
 * Resend verification code (can be used during login)
 */
router.post('/send-code', async (req, res) => {
  try {
    const { method, email } = req.body;
    let userId = req.userId; // From auth middleware if logged in

    // If not authenticated, we need email to find user (for login flow)
    if (!userId && email) {
      const user = await User.findOne({ email });
      if (user) {
        userId = user._id.toString();
      } else {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required or provide email' });
    }

    if (!['email', 'phone'].includes(method)) {
      return res.status(400).json({ error: 'Method must be email or phone' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new code
    const code = generateCode();
    storeCode(userId, code, method);

    // Send code
    try {
      if (method === 'email') {
        await sendEmailCode(user.email, code, user.username);
      } else {
        await sendSMSCode(user.phoneNumber, code, user.username);
      }

      res.json({
        success: true,
        message: `New verification code sent to your ${method}`,
        ...(process.env.NODE_ENV === 'development' && { devCode: code })
      });
    } catch (error) {
      console.error('Send code error:', error);
      res.status(500).json({ error: `Failed to send ${method} code` });
    }
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/auth/2fa/verify
 * Verify code and enable 2FA
 * Requires authentication
 */
router.post('/verify', authController.verifyToken, async (req, res) => {
  try {
    const { code, method } = req.body;
    const userId = req.userId;

    if (!code || code.length !== 6) {
      return res.status(400).json({ error: 'Invalid code format' });
    }

    if (!['email', 'phone'].includes(method)) {
      return res.status(400).json({ error: 'Method must be email or phone' });
    }

    // Verify code
    const verification = verifyCode(userId, code, method);
    
    if (!verification.valid) {
      return res.status(400).json({ error: verification.error });
    }

    // Enable 2FA
    const user = await User.findByIdAndUpdate(
      userId,
      {
        twoFactorEnabled: true,
        twoFactorMethod: method,
        twoFactorSecret: crypto.randomBytes(32).toString('hex') // Generate secret
      },
      { new: true }
    ).select('-password -twoFactorSecret');

    console.log(`✅ 2FA enabled for user ${userId} via ${method}`);

    res.json({
      success: true,
      message: 'Two-factor authentication enabled successfully',
      user
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA
 * Requires authentication
 */
router.post('/disable', authController.verifyToken, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ error: 'Two-factor authentication is not enabled' });
    }

    // If code provided, verify it
    if (code) {
      const method = user.twoFactorMethod || 'email';
      const verification = verifyCode(userId, code, method);
      
      if (!verification.valid) {
        return res.status(400).json({ error: verification.error || 'Invalid verification code' });
      }
    } else {
      // Code not provided - send one first
      const method = user.twoFactorMethod || 'email';
      const verificationCode = generateCode();
      storeCode(userId, verificationCode, method);

      try {
        if (method === 'email') {
          await sendEmailCode(user.email, verificationCode, user.username);
        } else {
          await sendSMSCode(user.phoneNumber, verificationCode, user.username);
        }

        return res.json({
          requiresCode: true,
          message: `Verification code sent to your ${method}. Please verify to disable 2FA.`,
          ...(process.env.NODE_ENV === 'development' && { devCode: verificationCode })
        });
      } catch (error) {
        console.error('Send code error:', error);
        return res.status(500).json({ error: 'Failed to send verification code' });
      }
    }

    // Code verified (or not required) - disable 2FA
    await User.findByIdAndUpdate(
      userId,
      {
        twoFactorEnabled: false,
        twoFactorMethod: null,
        twoFactorSecret: null
      }
    );

    console.log(`✅ 2FA disabled for user ${userId}`);

    res.json({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/auth/2fa/status
 * Get 2FA status
 * Requires authentication
 */
router.get('/status', authController.verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('twoFactorEnabled twoFactorMethod email phoneNumber');
    
    res.json({
      twoFactorEnabled: user?.twoFactorEnabled || false,
      method: user?.twoFactorMethod || null,
      hasEmail: !!user?.email,
      hasPhone: !!user?.phoneNumber
    });
  } catch (error) {
    console.error('Get 2FA status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

