import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import nodemailer from 'nodemailer'; // Added nodemailer import

const router = express.Router();

// Configure Nodemailer transporter with Gmail credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'projects0802@gmail.com',
    pass: 'ugav mzve iamo sivh', 
  },
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'Participant' } = req.body;

    // Check if user exists
    const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (email, password, name, role, status) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, name, role, 'active']
    );

    // Generate token
    const token = jwt.sign(
      { userId: result.insertId, role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Send Welcome Email
    const mailOptions = {
      from: '"Planora Team" <projects0802@gmail.com>',
      to: email,
      subject: 'Welcome to Planora!',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Welcome to Planora</title>
        </head>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); padding: 30px;">
            <tr>
              <td style="text-align: center; padding-bottom: 20px;">
                <h1 style="color: #333333; margin: 0; font-size: 24px;">Welcome to Planora!</h1>
              </td>
            </tr>
            <tr>
              <td>
                <p style="font-size: 16px; color: #555555; line-height: 1.5;">Dear ${name},</p>
                <p style="font-size: 16px; color: #555555; line-height: 1.5;">Thank you for registering with Planora. We are thrilled to have you on board!</p>
                <p style="font-size: 16px; color: #555555; line-height: 1.5;">With Planora, you can easily discover, manage, and attend unforgettable events that perfectly match your interests and needs.</p>
                <p style="font-size: 16px; color: #555555; line-height: 1.5; margin-top: 20px;">If you have any questions or need assistance, feel free to contact our support team.</p>
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e5e5; margin-top: 20px;">
                <p style="font-size: 14px; color: #999999; margin: 0;">Best regards,<br>Planora Team</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Let the registration succeed even if email fails to send
    }

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: result.insertId, email, name, role, status: 'active' }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Update preference
router.patch('/update-preference', async (req, res) => {
  try {
    const { email, preference } = req.body;

    // Verify token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Update preference
    const [result] = await db.execute(
      'UPDATE users SET preference = ? WHERE email = ?',
      [preference, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Preference updated successfully' });
  } catch (error) {
    console.error('Preference update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// In-memory OTP store (for production, use Redis or a DB table)
const otpStore = new Map();

// Generate OTP helper
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      // Don't reveal if user exists or not for security, but here we can just return 404 for UX
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    // Store OTP with 10 minutes expiry
    otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

    const mailOptions = {
      from: '"Planora Team" <projects0802@gmail.com>',
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto; text-align: center;">
            <h2 style="color: #4B2E2B;">Password Reset</h2>
            <p style="font-size: 16px; color: #555;">You requested to reset your password. Use the OTP below to proceed:</p>
            <div style="margin: 20px 0; padding: 15px; background-color: #FFF8F0; border: 2px dashed #C08552; display: inline-block; border-radius: 8px;">
               <h1 style="margin: 0; color: #8C5A3C; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p style="font-size: 14px; color: #888;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);

  if (!record || record.expires < Date.now()) {
    return res.status(400).json({ message: 'OTP expired or invalid' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: 'Incorrect OTP' });
  }

  res.json({ message: 'OTP verified successfully' });
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const record = otpStore.get(email);

    if (!record || record.expires < Date.now() || record.otp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the database
    await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    // Clear the OTP
    otpStore.delete(email);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

export default router;