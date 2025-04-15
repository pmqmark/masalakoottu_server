const { createUserCtrl, updateUserCtrl, updateUserStatusCtrl, getManyUsersCtrl, getUserByIdCtrl, getUserProfileByIdCtrl, registerUserCtrl, addToCartCtrl, getCartCtrl, removeFromCartCtrl, addToWishlistCtrl, getWishlistCtrl, removeFromWishlistCtrl, getUserAddresssesCtrl, getAllAddresssesCtrl, getOneAddressCtrl, postAddresssesCtrl, updateAddresssesCtrl, deleteAddresssesCtrl, updateCartCtrl, setCartCtrl } = require("../controllers/user.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleChecker } = require("../middlewares/roleChecker.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { validateCreateAddress, validateUpdateAddress } = require("../validators/address.validator");
const { userValidator } = require("../validators/user.validator");

const userRouter = require("express").Router();


userRouter.post('/register', userValidator.create, validate, registerUserCtrl)

userRouter.use(authMiddleware)

userRouter.post("/wishlists/add", addToWishlistCtrl);
userRouter.post("/wishlists/remove", removeFromWishlistCtrl);

userRouter.post("/carts/set", setCartCtrl);
userRouter.post("/carts/add", addToCartCtrl);
userRouter.put("/carts/update", updateCartCtrl);
userRouter.post("/carts/remove", removeFromCartCtrl);

userRouter.get("/wishlists", getWishlistCtrl);
userRouter.get("/carts", getCartCtrl);

userRouter.post('/addresses', validateCreateAddress, validate, postAddresssesCtrl)
userRouter.put('/addresses/:addressId', validateUpdateAddress, validate, updateAddresssesCtrl)
userRouter.delete('/addresses/:addressId', deleteAddresssesCtrl)

userRouter.get('/addresses/own', roleChecker(['user']), getUserAddresssesCtrl)
userRouter.get('/addresses/all', roleChecker(['admin']), getAllAddresssesCtrl)
userRouter.get('/addresses/:addressId', getOneAddressCtrl)

userRouter.get('/profile', roleChecker(['user']), getUserProfileByIdCtrl)
userRouter.put('', userValidator.update, validate, updateUserCtrl)

userRouter.use(roleChecker(['admin']))

userRouter.post('', userValidator.create, validate, createUserCtrl)
userRouter.patch('/:id', updateUserStatusCtrl)
userRouter.get('', getManyUsersCtrl)
userRouter.get('/:id', getUserByIdCtrl)

module.exports = { userRouter }