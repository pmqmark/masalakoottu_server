const { createUserCtrl, updateUserCtrl, updateUserStatusCtrl, getManyUsersCtrl, getUserByIdCtrl, getUserProfileByIdCtrl, registerUserCtrl, addToCartCtrl, getCartCtrl, removeFromCartCtrl, addToWishlistCtrl, getWishlistCtrl, removeFromWishlistCtrl } = require("../controllers/user.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleChecker } = require("../middlewares/roleChecker.middleware");

const userRouter = require("express").Router();

userRouter.post("/wishlists/add", addToWishlistCtrl);
userRouter.get("/wishlists/:userId", getWishlistCtrl);
userRouter.post("/wishlists/remove", removeFromWishlistCtrl);

userRouter.post("/carts/add", addToCartCtrl);
userRouter.get("/carts/:userId", getCartCtrl);
userRouter.post("/carts/remove", removeFromCartCtrl);

userRouter.post('/register', registerUserCtrl)

userRouter.use(authMiddleware)

userRouter.get('/profile/:id', roleChecker(['user']), getUserProfileByIdCtrl)
userRouter.put('/:id', updateUserCtrl)

userRouter.use(roleChecker(['admin']))

userRouter.post('', createUserCtrl)
userRouter.patch('/:id', updateUserStatusCtrl)
userRouter.get('', getManyUsersCtrl)
userRouter.get('/:id', getUserByIdCtrl)

module.exports = { userRouter }