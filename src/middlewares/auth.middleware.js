import { verifyToken } from '../utils/paseto.util.js';

const formatError = (code, message) => ({
  error: { code, message, details: [] },
});

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(formatError('UNAUTHORIZED', 'Missing or invalid authorization header'));
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);

    // Attach user info to request object
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json(formatError('UNAUTHORIZED', 'Invalid or expired token'));
  }
};

export default authenticate;