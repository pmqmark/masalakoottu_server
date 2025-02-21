const { createUserCtrl } = require("../controllers/user.controller");

const userRouter = require("express").Router();

userRouter.post('', createUserCtrl)

module.exports = {userRouter}