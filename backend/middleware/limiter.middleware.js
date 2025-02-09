import rateLimit from "express-rate-limit";

const message = "Too many requests, try again later.";

// General rate limiter middleware
export const apiRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 500, // Allow 500 requests per 10 minutes
  keyGenerator: (req) => (req.userId ? `${req.userId}` : req.ip),
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message,
    });
  },
  legacyHeaders: false,
});

// Stricter rate limiter for sensitive routes
export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Allow 10 requests per hour
  keyGenerator: (req) => (req.userId ? `${req.userId}` : req.ip),
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message,
    });
  },
  legacyHeaders: false,
});
