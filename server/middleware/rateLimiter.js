import rateLimit from "express-rate-limit";

/**
 * General API rate limiter
 * 1000 requests per 15 minutes per IP (loosened for development)
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth rate limiter - stricter for login/register
 * 500 requests per 15 minutes per IP (loosened for development)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: {
    success: false,
    message:
      "Too many authentication attempts, please try again after 15 minutes",
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Message rate limiter
 * 30 messages per minute per user
 */
export const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    message: "Too many messages sent. Please slow down.",
  },
  standardHeaders: true,
});

/**
 * Post creation rate limiter
 * 50 posts per hour per user
 */
export const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: {
    success: false,
    message: "Too many posts created. Please wait before posting again.",
  },
  skip: () => false, // Don't skip any requests, but increase limit
});

/**
 * Friend request rate limiter
 * 20 friend requests per hour per user
 */
export const friendRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    success: false,
    message: "Too many friend requests sent. Please wait.",
  },
});

/**
 * Comment rate limiter
 * 50 comments per 10 minutes per user
 */
export const commentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50,
  message: {
    success: false,
    message: "Too many comments. Please slow down.",
  },
});

/**
 * Upload rate limiter
 * 20 uploads per 10 minutes per user
 */
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  message: {
    success: false,
    message: "Too many file uploads. Please wait.",
  },
});
