const { userLogin, regenerateTokens, sendOTPHandler, verifyOTPHandler, googleHandler, resetPassword } = require("../controllers/auth.controller");
const { ratelimiter } = require("../middlewares/rateLimiter.middleware");

const authRouter = require("express").Router();

authRouter.post('/login', userLogin)
authRouter.post("/google", googleHandler)

authRouter.post('/regenerate-token', regenerateTokens)

authRouter.post('/send-otp', ratelimiter, sendOTPHandler)
authRouter.post('/verify-otp', verifyOTPHandler)

// forgot password
authRouter.post('/reset-password', resetPassword)

module.exports = { authRouter };