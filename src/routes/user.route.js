const { createUserCtrl, updateUserCtrl, updateUserStatusCtrl, getManyUsersCtrl, getUserByIdCtrl, getUserProfileByIdCtrl, registerUserCtrl } = require("../controllers/user.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleChecker } = require("../middlewares/roleChecker.middleware");

const userRouter = require("express").Router();

userRouter.post('/register', registerUserCtrl)

userRouter.use(authMiddleware)

userRouter.get('/profile/:id', roleChecker(['user']), getUserProfileByIdCtrl)

userRouter.use(roleChecker(['admin']))

userRouter.post('', createUserCtrl)
userRouter.put('/:id', updateUserCtrl)
userRouter.patch('/:id', updateUserStatusCtrl)
userRouter.get('', getManyUsersCtrl)
userRouter.get('/:id', getUserByIdCtrl)

module.exports = {userRouter}