const { isValidObjectId } = require("mongoose");
const { createUser, updateUser, updateUserStatus, getUserById, getManyUsers, getUserByMobile, getUserByEmail, addToCart, removeFromCart, getCart, removeFromWishlist, getWishlist, addToWishlist, findCouponWithCode, addUserToCouponUserList, addUserToCouponUsersList } = require("../services/user.service");
const { hashPassword } = require("../utils/password.util");
const { validateEmail, validateMobile } = require("../utils/validate.util");
const { validateOTPWithMobile, validateOTPWithEmail, OTPVerificationStatus } = require("../services/auth.service");
const { genderList, roleList } = require("../config/data");
const { Coupon } = require("../models/coupon.model");


// Accessible to Public
exports.registerUserCtrl = async (req, res) => {
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

        const { password: pwd, ...userInfo } = user?.toObject()

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

// Accessible to user
exports.getUserProfileByIdCtrl = async (req, res, next) => {
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

        const userId = String(req.user.userId);

        if (id !== userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                data: null,
                error: 'UNAUTHORIZED'
            })
        }

        const user = await getUserById(id)

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

// Access to Admin only
exports.createUserCtrl = async (req, res) => {
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

exports.updateUserCtrl = async (req, res, next) => {
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
            const hashedPassword = await hashPassword(password)
            updateObj.password = hashedPassword
        }

        const user = await updateUser(id, updateObj)

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

exports.updateUserStatusCtrl = async (req, res, next) => {
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


exports.getUserByIdCtrl = async (req, res, next) => {
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



exports.getManyUsersCtrl = async (req, res, next) => {
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

exports.addToCartCtrl = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const updatedUser = await addToCart(userId, productId, quantity);

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { cart: updatedUser?.cart },
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

exports.getCartCtrl = async (req, res) => {
    try {
        const { userId } = req.body;

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

exports.removeFromCartCtrl = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const updatedUser = await removeFromCart(userId, productId);

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { cart: updatedUser?.cart },
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


exports.addToWishlistCtrl = async (req, res) => {
    try {
        const { userId, productId } = req.body;

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

exports.getWishlistCtrl = async (req, res) => {
    try {
        const { userId } = req.body;

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

exports.removeFromWishlistCtrl = async (req, res) => {
    try {
        const { userId, productId } = req.body;

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


exports.applyCoupon = async (req, res) => {
    const { userId, couponCode, amount } = req.body;

    try {
        const coupon = await findCouponWithCode(couponCode);

        if (!coupon || coupon.expiryDate < new Date() || coupon.userList?.includes(userId)
            || amount < coupon.minValue) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired coupon',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        let discountAmount = (coupon.value / 100) * amount;

        discountAmount = Math.min(discountAmount, coupon.maxValue)

        const finalAmount = amount - discountAmount;

        await addUserToCouponUsersList(userId, coupon?._id)

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { discountAmount, finalAmount },
            error: null
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
};
