const { userLogin, regenerateTokens, sendOTPHandler, verifyOTPHandler, googleHandler } = require("../controllers/auth.controller");
const { ratelimiter } = require("../middlewares/rateLimiter.middleware");

const authRouter = require("express").Router();

authRouter.post('/login', userLogin)
authRouter.post("/google", googleHandler)

authRouter.post('/regenerate-token', regenerateTokens)

authRouter.post('/send-otp', ratelimiter, sendOTPHandler)
authRouter.post('/verify-otp', verifyOTPHandler)


module.exports = { authRouter };