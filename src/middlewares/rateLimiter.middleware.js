const { default: rateLimit } = require("express-rate-limit");

exports.ratelimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 5,
    keyGenerator: (req, res) => {
        return req?.body?.email || req?.body?.mobile || req.ip;
    },
    message: {
        success: false,
        message: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
