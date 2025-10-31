const crypto = require('crypto');
const nodemailer = require('nodemailer');

// In-memory store for verification codes (use Redis in production)
const verificationCodes = new Map();

// Generate a random 6-digit code
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store verification code
const storeCode = (userId, code, method) => {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  verificationCodes.set(`${userId}-${method}`, {
    code,
    method,
    expiresAt,
    attempts: 0
  });
  
  // Clean up expired codes after 10 minutes
  setTimeout(() => {
    verificationCodes.delete(`${userId}-${method}`);
  }, 10 * 60 * 1000);
};

// Verify code
const verifyCode = (userId, code, method) => {
  const key = `${userId}-${method}`;
  const stored = verificationCodes.get(key);
  
  if (!stored) {
    return { valid: false, error: 'Code not found or expired' };
  }
  
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(key);
    return { valid: false, error: 'Code expired' };
  }
  
  if (stored.attempts >= 5) {
    verificationCodes.delete(key);
    return { valid: false, error: 'Too many attempts. Please request a new code' };
  }
  
  stored.attempts++;
  
  if (stored.code !== code) {
    return { valid: false, error: 'Invalid code' };
  }
  
  // Code is valid, remove it
  verificationCodes.delete(key);
  return { valid: true };
};

// Send email verification code
const sendEmailCode = async (email, code, username) => {
  try {
    // Create transporter (you'll need to configure this with your email service)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || `Chaturway <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Two-Factor Authentication Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Chaturway Security</h2>
          <p>Hello ${username},</p>
          <p>Your two-factor authentication verification code is:</p>
          <div style="background: #f97316; color: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 8px;">
            ${code}
          </div>
          <p style="color: #666; font-size: 12px;">This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email or contact support.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 11px;">This is an automated message. Please do not reply.</p>
        </div>
      `
    };

    // Only send if SMTP is configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email verification code sent to ${email}`);
      return { success: true };
    } else {
      // Development mode - log code instead
      console.log(`📧 [DEV] Email verification code for ${email}: ${code}`);
      console.log(`⚠️  Configure SMTP settings (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) to send real emails`);
      return { success: true, devMode: true, code };
    }
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email');
  }
};

// Send SMS verification code (mock implementation - integrate with Twilio, AWS SNS, etc.)
const sendSMSCode = async (phoneNumber, code, username) => {
  try {
    // In production, integrate with:
    // - Twilio: https://www.twilio.com/docs/sms
    // - AWS SNS: https://docs.aws.amazon.com/sns/
    // - MessageBird: https://developers.messagebird.com/api/sms-messaging/
    
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      // Twilio integration would go here
      const twilio = require('twilio');
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      
      await client.messages.create({
        body: `Your Chaturway verification code is: ${code}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      console.log(`✅ SMS verification code sent to ${phoneNumber}`);
      return { success: true };
    } else {
      // Development mode - log code instead
      console.log(`📱 [DEV] SMS verification code for ${phoneNumber}: ${code}`);
      console.log(`⚠️  Configure Twilio (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) to send real SMS`);
      return { success: true, devMode: true, code };
    }
  } catch (error) {
    console.error('SMS send error:', error);
    throw new Error('Failed to send SMS');
  }
};

module.exports = {
  generateCode,
  storeCode,
  verifyCode,
  sendEmailCode,
  sendSMSCode
};






