const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'yourSuperSecretKeyHere';

// Register
exports.register = async (req, res) => {
  try {
    const { username, email, password, phoneNumber } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, ...(phoneNumber ? [{ phoneNumber: phoneNumber.replace(/\s+/g, '').replace(/-/g, '') }] : [])]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists (username, email, or phone number already in use)' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Clean phone number if provided
    const cleanedPhone = phoneNumber ? phoneNumber.replace(/\s+/g, '').replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '') : null;

    // Create user
    const user = await User.create({
      username,
      email,
      passwordHash: hashedPassword,
      password: hashedPassword, // Legacy field for backward compatibility
      ...(cleanedPhone && { phoneNumber: cleanedPhone })
    });

    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: `Welcome to Chaturway, ${username}! 🎉 Your account has been created successfully. Please check your email to confirm your account.`,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({ 
        error: `Your account has been banned. ${user.banReason ? `Reason: ${user.banReason}` : ''}` 
      });
    }

    // Check if user is suspended
    if (user.isSuspended) {
      const now = new Date();
      if (user.suspendedUntil && new Date(user.suspendedUntil) > now) {
        const daysLeft = Math.ceil((new Date(user.suspendedUntil) - now) / (1000 * 60 * 60 * 24));
        return res.status(403).json({ 
          error: `Your account is suspended. ${user.suspensionReason ? `Reason: ${user.suspensionReason}. ` : ''}Suspension expires in ${daysLeft} day(s).` 
        });
      } else {
        // Suspension expired, clear it
        user.isSuspended = false;
        user.suspendedUntil = null;
        user.suspensionReason = null;
        await user.save();
      }
    }

    // Verify password (check passwordHash first, fallback to password for backward compatibility)
    const passwordToCheck = user.passwordHash || user.password;
    const isValidPassword = await bcrypt.compare(password, passwordToCheck);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Migrate password to passwordHash if needed
    if (!user.passwordHash && user.password) {
      user.passwordHash = user.password;
      await user.save();
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // 2FA verification required
      if (!twoFactorCode) {
        // Automatically send code when 2FA is required
        const { generateCode, storeCode, sendEmailCode, sendSMSCode } = require('../utils/twoFactor');
        const method = user.twoFactorMethod || 'email';
        const code = generateCode();
        storeCode(user._id.toString(), code, method);
        
        try {
          if (method === 'email') {
            await sendEmailCode(user.email, code, user.username);
          } else {
            await sendSMSCode(user.phoneNumber, code, user.username);
          }
        } catch (error) {
          console.error('Failed to send 2FA code:', error);
          // Continue even if send fails (code is still stored)
        }
        
        return res.status(200).json({
          requires2FA: true,
          message: 'Two-factor authentication code required',
          method: method,
          ...(process.env.NODE_ENV === 'development' && { devCode: code })
        });
      }

      // Verify 2FA code
      const { verifyCode } = require('../utils/twoFactor');
      const verification = verifyCode(user._id.toString(), twoFactorCode, user.twoFactorMethod || 'email');
      
      if (!verification.valid) {
        return res.status(401).json({ 
          error: verification.error || 'Invalid verification code',
          requires2FA: true,
          method: user.twoFactorMethod || 'email'
        });
      }
    }

    // Update status to online
    user.status = 'online';
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Verify token middleware
exports.verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user is banned or suspended
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.isBanned) {
      return res.status(403).json({ 
        error: `Your account has been banned. ${user.banReason ? `Reason: ${user.banReason}` : ''}` 
      });
    }

    if (user.isSuspended) {
      const now = new Date();
      if (user.suspendedUntil && new Date(user.suspendedUntil) > now) {
        const daysLeft = Math.ceil((new Date(user.suspendedUntil) - now) / (1000 * 60 * 60 * 24));
        return res.status(403).json({ 
          error: `Your account is suspended. ${user.suspensionReason ? `Reason: ${user.suspensionReason}. ` : ''}Suspension expires in ${daysLeft} day(s).` 
        });
      } else {
        // Suspension expired, clear it
        user.isSuspended = false;
        user.suspendedUntil = null;
        user.suspensionReason = null;
        await user.save();
      }
    }

    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash -password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

