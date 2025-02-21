const { uploadSingleFile, uploadMultipleFile } = require("../controllers/upload.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleChecker } = require("../middlewares/roleChecker.middleware");

const uploadRouter = require("express").Router();

uploadRouter.use(authMiddleware)
uploadRouter.use(roleChecker(['admin']))

uploadRouter.post('/single', uploadSingleFile)
uploadRouter.post('/multiple', uploadMultipleFile)

module.exports = { uploadRouter }