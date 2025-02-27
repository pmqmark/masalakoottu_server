const { createUserCtrl, updateUserCtrl, updateUserStatusCtrl, getManyUsersCtrl, getUserByIdCtrl, getUserProfileByIdCtrl, registerUserCtrl, addToCartCtrl, getCartCtrl, removeFromCartCtrl, addToWishlistCtrl, getWishlistCtrl, removeFromWishlistCtrl, getUserAddresssesCtrl } = require("../controllers/user.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleChecker } = require("../middlewares/roleChecker.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { userValidator } = require("../validators/user.validator");

const userRouter = require("express").Router();

userRouter.post("/wishlists/add", addToWishlistCtrl);
userRouter.get("/wishlists/:userId", getWishlistCtrl);
userRouter.post("/wishlists/remove", removeFromWishlistCtrl);

userRouter.post("/carts/add", addToCartCtrl);
userRouter.get("/carts/:userId", getCartCtrl);
userRouter.post("/carts/remove", removeFromCartCtrl);

userRouter.post('/register', userValidator.create, validate, registerUserCtrl)

userRouter.use(authMiddleware)

userRouter.get('/addresses', roleChecker(['user']), getUserAddresssesCtrl)

userRouter.get('/profile/:id', roleChecker(['user']), getUserProfileByIdCtrl)
userRouter.put('/:id', userValidator.update, validate, updateUserCtrl)

userRouter.use(roleChecker(['admin']))

userRouter.post('', userValidator.create, validate, createUserCtrl)
userRouter.patch('/:id', updateUserStatusCtrl)
userRouter.get('', getManyUsersCtrl)
userRouter.get('/:id', getUserByIdCtrl)

module.exports = { userRouter }