const { isValidObjectId } = require("mongoose");
const { createUser, updateUser, updateUserStatus, getUserById, getManyUsers, getUserByMobile,
    getUserByEmail, addToCart, removeFromCart, getCart, removeFromWishlist, getWishlist,
    addToWishlist, createAddress, updateAddress, deleteAddress, fetchManyAddress,
    fetchSingleAddress,
    updateCart,
    fetchOneAddress,
    setCart, } = require("../services/user.service");
const { hashPassword } = require("../utils/password.util");
const { validateEmail, validateMobile } = require("../utils/validate.util");
const { validateOTPWithMobile, validateOTPWithEmail, OTPVerificationStatus } = require("../services/auth.service");
const { genderList, roleList } = require("../config/data");
const { checkIfVariationExists, getProductById } = require("../services/product.service");
const { findManyOrders } = require("../services/order.service");

// Accessible to Public
module.exports.registerUserCtrl = async (req, res) => {
    try {
        const { firstName, lastName, gender,
            email, mobile, password, credType, otp } = req.body;

        if (!otp?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'OTP is required',
                data: null,
                error: "INVALID_DATA"
            });
        }

        if (!['email', 'mobile']?.includes(credType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credential type',
                data: null,
                error: "INVALID_DATA"
            });
        }

        let validOtp;
        let existingUser;
        if (credType === 'mobile') {
            validOtp = await validateOTPWithMobile({ mobile, otp });
            existingUser = await getUserByMobile(mobile)
        }
        else if (credType === 'email') {
            validOtp = await validateOTPWithEmail({ email, otp });
            existingUser = await getUserByEmail(email)
        }

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists',
                data: null,
                error: null,
            })
        }

        if (validOtp) {
            const isOTPVerified = await OTPVerificationStatus(validOtp?._id)

            if (!isOTPVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'OTP is not verified',
                    data: null,
                    error: "UNVERIFIED_OTP"
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP',
                data: null,
                error: "INVALID_DATA"
            });
        }

        if (!firstName?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Firstname is required',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const createObj = {
            firstName, lastName, role: 'user', credType
        }

        if (genderList?.includes(gender)) {
            createObj.gender = gender
        }

        if (validateMobile(mobile)) {
            createObj.mobile = mobile;
        }

        if (validateEmail(email)) {
            createObj.email = email;
        }


        if (password?.trim()) {
            const hashedPassword = await hashPassword(password)
            createObj.password = hashedPassword
        }

        const user = await createUser(createObj)

        if (!user) {
            throw new Error('FAILED')
        }

        // const { password: pwd, ...userInfo } = user?.toObject()

        return res.status(201).json({
            success: true,
            message: 'success',
            data: null,
            error: null
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

// Accessible to user
module.exports.getUserProfileByIdCtrl = async (req, res, next) => {
    try {
        const { userId } = req.user;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const user = await getUserById(userId)

        if (!user) {
            throw new Error('FAILED')
        }

        const { password, ...userInfo } = user

        const filters = { userId }

        const addresses = await fetchManyAddress(filters)

        return res.status(201).json({
            success: true,
            message: 'success',
            data: { user: userInfo, addresses },
            error: null
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

// Access to Admin only
module.exports.createUserCtrl = async (req, res) => {
    try {
        const { firstName, lastName, gender,
            email, mobile, password, credType } = req.body;


        if (!firstName?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Firstname is required',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const createObj = {
            firstName, lastName, role: 'user', credType
        }

        if (genderList?.includes(gender)) {
            createObj.gender = gender
        }

        if (validateMobile(mobile)) {
            createObj.mobile = mobile;
        }

        if (validateEmail(email)) {
            createObj.email = email;
        }


        if (password?.trim()) {
            const hashedPassword = await hashPassword(password)
            createObj.password = hashedPassword
        }

        const user = await createUser(createObj)

        if (!user) {
            throw new Error('FAILED')
        }

        return res.status(201).json({
            success: true,
            message: 'success',
            data: { user },
            error: null
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

module.exports.updateUserCtrl = async (req, res, next) => {
    try {
        const { userId } = req.user;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const { firstName, lastName, gender, email, mobile, password } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const indianNumberRegex = /^(?:\+91[\s-]?|91[\s-]?)?[6-9]\d{9}$/;

        const updateObj = {}

        if (firstName?.trim()) {
            updateObj.firstName = firstName;
        }

        if (lastName?.trim()) {
            updateObj.lastName = lastName;
        }

        if (genderList?.includes(gender)) {
            updateObj.gender = gender
        }

        if (emailRegex.test(email)) {
            updateObj.email = email;
        }

        if (indianNumberRegex.test(mobile)) {
            updateObj.mobile = mobile;
        }

        if (password?.trim()) {
            console.log({ password })

            const hashedPassword = await hashPassword(password)
            updateObj.password = hashedPassword
        }

        const user = await updateUser(userId, updateObj)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null,
                error: 'USER_NOT_FOUND'
            })
        }

        const { password: pwd, ...userInfo } = user.toObject()

        return res.status(201).json({
            success: true,
            message: 'success',
            data: { user: userInfo },
            error: null
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

module.exports.updateUserStatusCtrl = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const { status } = req.body;
        if (!['blocked', 'unblocked']?.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        let isBlocked;
        if (status === 'blocked') {
            isBlocked = true;
        }
        else {
            isBlocked = false;
        }

        const user = await updateUserStatus(id, isBlocked)

        if (!user) {
            throw new Error('FAILED')
        }

        return res.status(201).json({
            success: true,
            message: 'success',
            data: { user },
            error: null
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}


module.exports.getUserByIdCtrl = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const user = await getUserById(id)
        const address = await fetchOneAddress({ userId: user?._id })
        const orderHistory = await findManyOrders({ userId: user?._id })

        if (!user) {
            throw new Error('User not found')
        }

        return res.status(201).json({
            success: true,
            message: 'success',
            data: { user, address, orderHistory },
            error: null
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: error?.message || "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}



module.exports.getManyUsersCtrl = async (req, res, next) => {
    try {
        let { page, entries } = req.query;
        page = parseInt(page);
        entries = parseInt(entries)
        const { gender, role, status } = req.query;

        const filters = {};

        if (genderList?.includes?.(gender)) {
            filters.gender = gender
        }

        if (roleList?.includes?.(role)) {
            filters.role = role
        }

        if (['blocked', 'unblocked']?.includes(status)) {
            filters.isBlocked = status === 'blocked';
        }

        console.log({ filters })
        let result = await getManyUsers(filters)
        console.log({ result })

        if (page && entries) {
            result = result.slice((page - 1) * entries, page * entries)
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { users: result },
            error: null
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

module.exports.setCartCtrl = async (req, res) => {
    try {
        const { userId } = req.user;
        const { cart = [] } = req.body;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            });
        }

        if (!Array.isArray(cart)) {
            return res.status(400).json({
                success: false,
                message: 'Cart must be an array',
                data: null,
                error: 'BAD_REQUEST'
            });
        }

        const user = await getUserById(userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found',
                data: null,
                error: 'BAD_REQUEST'
            });
        }

        for (const { productId, variations = [] } of cart) {
            if (!productId || !isValidObjectId(productId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID in cart item',
                    data: null,
                    error: 'BAD_REQUEST'
                });
            }

            const product = await getProductById(productId)

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product not found: ${productId}`,
                    data: null,
                    error: 'BAD_REQUEST'
                });
            }

            if (!Array.isArray(variations)) {
                return res.status(400).json({
                    success: false,
                    message: 'Variations must be an array',
                    data: null,
                    error: 'BAD_REQUEST'
                });
            }

            if (variations?.length > 0) {
                const existingVariation = await checkIfVariationExists(productId, variations);
                if (!existingVariation) {
                    return res.status(400).json({
                        success: false,
                        message: `Variation doesn't exist in product: ${productId}`,
                        data: null,
                        error: 'BAD_REQUEST'
                    });
                }
            }
        }

        await setCart(userId, cart);
        const updatedCart = await getCart(userId);

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { cart: updatedCart },
            error: null
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error?.message || "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
};


module.exports.addToCartCtrl = async (req, res) => {
    try {
        const { userId } = req.user;

        const { productId, quantity, variations = [] } = req.body;

        if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const existingVariation = await checkIfVariationExists(productId, variations)

        if (!existingVariation) {
            return res.status(400).json({
                success: false,
                message: 'Variation doesn\'t exist in product',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        console.log({ userId, productId, quantity, variations })

        await addToCart(userId, productId, quantity, variations);

        const cart = await getCart(userId)

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { cart },
            error: null
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: error?.message || "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

module.exports.getCartCtrl = async (req, res) => {
    try {
        const { userId } = req.user;

        const cart = await getCart(userId)
        res.status(200).json({
            success: true,
            message: 'success',
            data: { cart },
            error: null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
};

module.exports.updateCartCtrl = async (req, res) => {
    try {
        const { userId } = req.user;

        const { itemId, quantity } = req.body;

        if (!isValidObjectId(userId) || !isValidObjectId(itemId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        await updateCart(userId, itemId, quantity);

        const cart = await getCart(userId)

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { cart },
            error: null
        })

    } catch (error) {
        console.log(error)
        const msg = error?.message;

        return res.status(500).json({
            success: false,
            message: msg ?? "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

module.exports.removeFromCartCtrl = async (req, res) => {
    try {
        const { userId } = req.user;

        const { itemId } = req.body;

        if (!isValidObjectId(userId) || !isValidObjectId(itemId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        await removeFromCart(userId, itemId);

        const cart = await getCart(userId)

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { cart },
            error: null
        })

    } catch (error) {
        console.log(error)
        const msg = error?.message;

        return res.status(500).json({
            success: false,
            message: msg ?? "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}


module.exports.addToWishlistCtrl = async (req, res) => {
    try {
        const { userId } = req.user;
        const { productId } = req.body;

        if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const updatedUser = await addToWishlist(userId, productId);

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { wishlist: updatedUser?.wishlist },
            error: null
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

module.exports.getWishlistCtrl = async (req, res) => {
    try {
        const { userId } = req.user;

        const wishlist = await getWishlist(userId)
        res.status(200).json({
            success: true,
            message: 'success',
            data: { wishlist },
            error: null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
};

module.exports.removeFromWishlistCtrl = async (req, res) => {
    try {
        const { userId } = req.user;

        const { productId } = req.body;

        if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const updatedUser = await removeFromWishlist(userId, productId);

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { wishlist: updatedUser?.wishlist },
            error: null
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

module.exports.getUserAddresssesCtrl = async (req, res) => {
    try {
        const { userId } = req.user;

        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Not Found',
                data: null,
                error: 'NOT_FOUND'
            })
        }

        const filters = { userId }

        const addresses = await fetchManyAddress(filters)

        return res.status(200).json({
            success: true,
            message: "success",
            data: { result: addresses },
            error: null,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

module.exports.getAllAddresssesCtrl = async (req, res) => {
    try {
        const filters = {}

        const addresses = await fetchManyAddress(filters)

        return res.status(200).json({
            success: true,
            message: "success",
            data: { addresses },
            error: null,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

module.exports.getOneAddressCtrl = async (req, res) => {
    try {
        const { addressId } = req.params;

        const address = await fetchSingleAddress(addressId)

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Not Found',
                data: null,
                error: "NOT_FOUND"
            })
        }

        return res.status(200).json({
            success: true,
            message: "success",
            data: { address },
            error: null,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

module.exports.postAddresssesCtrl = async (req, res) => {
    try {
        const { userId } = req.user;
        const createObj = req.body;

        const address = await createAddress({ ...createObj, userId })

        return res.status(200).json({
            success: true,
            message: "success",
            data: { address },
            error: null,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

module.exports.updateAddresssesCtrl = async (req, res) => {
    try {
        const { addressId } = req.params;
        const updateObj = req.body;

        const address = await updateAddress(addressId, updateObj)

        return res.status(200).json({
            success: true,
            message: "success",
            data: { address },
            error: null,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

module.exports.deleteAddresssesCtrl = async (req, res) => {
    try {
        const { addressId } = req.params;

        const address = await deleteAddress(addressId)

        if (!address) {
            throw new Error('Failed')
        }

        return res.status(200).json({
            success: true,
            message: "success",
            data: null,
            error: null,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}



