const { userLogin, regenerateTokens, google } = require("../controllers/auth.controller");

const authRouter = require("express").Router();

authRouter.post('/login', userLogin)
authRouter.post('/regenerate-token', regenerateTokens)

module.exports = { authRouter };