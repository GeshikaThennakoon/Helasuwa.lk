const JWT_SECRET = process.env.JWT_SECRET;
const JWT_TTL = process.env.JWT_TTL || '15m';

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('Secure JWT_SECRET (>=256-bit) is required');
}

module.exports = { secretKey, JWT_TTL };
