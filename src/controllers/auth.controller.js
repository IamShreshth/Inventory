const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require('../utils/paseto.util');

// Mock database for demonstration purposes. 
// In a real app, replace this with your actual DB queries.
const mockUsers = [
  {
    id: '1a2b3c4d-1111-2222-3333-444444444444',
    full_name: 'Test User',
    institute_email: 'test@institute.edu',
    password_hash: bcrypt.hashSync('password123', 10),
    is_active: true,
  },
];

const formatError = (code, message, details = []) => ({
  error: { code, message, details },
});

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json(formatError('VALIDATION_ERROR', 'Email and password are required'));
    }

    const user = mockUsers.find((u) => u.institute_email === email && u.is_active);
    if (!user) {
      return res.status(401).json(formatError('UNAUTHORIZED', 'Invalid credentials'));
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json(formatError('UNAUTHORIZED', 'Invalid credentials'));
    }

    const userPayload = { sub: user.id, email: user.institute_email };

    const token = await generateToken(userPayload, process.env.ACCESS_TOKEN_EXPIRY || '15m');
    const refresh_token = await generateToken({ ...userPayload, type: 'refresh' }, process.env.REFRESH_TOKEN_EXPIRY || '7d');

    return res.status(200).json({
      token,
      refresh_token,
      user: { id: user.id, full_name: user.full_name, institute_email: user.institute_email },
    });
  } catch (error) {
    return res.status(500).json(formatError('INTERNAL_ERROR', 'An unexpected error occurred'));
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(422).json(formatError('VALIDATION_ERROR', 'Refresh token is required'));
    }

    const payload = await verifyToken(refresh_token);
    if (payload.type !== 'refresh') {
      return res.status(401).json(formatError('UNAUTHORIZED', 'Invalid refresh token'));
    }

    const newAccessToken = await generateToken({ sub: payload.sub, email: payload.email }, process.env.ACCESS_TOKEN_EXPIRY || '15m');

    return res.status(200).json({ token: newAccessToken });
  } catch (error) {
    return res.status(401).json(formatError('UNAUTHORIZED', 'Invalid or expired refresh token'));
  }
};

exports.logout = async (req, res) => {
  // Stateless logout. Client should discard the token.
  return res.status(204).send();
};

exports.forgotPassword = async (req, res) => {
  // Always return 200 to prevent email enumeration
  return res.status(200).json({ message: 'If the email exists, a reset link has been sent.' });
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(422).json(formatError('VALIDATION_ERROR', 'Token and new password are required'));
    }

    // Verify the reset token
    await verifyToken(token);

    // TODO: Hash new password and update DB here
    // const hashedPassword = await bcrypt.hash(password, 10);
    // await db.users.update(...)

    return res.status(204).send();
  } catch (error) {
    return res.status(401).json(formatError('UNAUTHORIZED', 'Invalid or expired reset token'));
  }
};