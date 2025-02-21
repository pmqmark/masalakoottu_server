const { isValidObjectId } = require("mongoose");
const { createUser, updateUser, updateUserStatus, getUserById, getManyUsers } = require("../services/user.service");
const { hashPassword } = require("../utils/password.util");
const { validateEmail, validateMobile } = require("../utils/validate.util");
const { validateOTPWithMobile, validateOTPWithEmail } = require("../services/auth.service");


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

        if (credType === 'mobile') {
            validOtp = await validateOTPWithMobile({ mobile, otp });
        }
        else if (credType === 'email') {
            validOtp = await validateOTPWithEmail({ email, otp });
        }

        if (!validOtp) {
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
            firstName, lastName, role: 'user'
        }

        if (['male', 'female', 'other']?.includes(gender)) {
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
            email, mobile, password } = req.body;


        if (!firstName?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Firstname is required',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const createObj = {
            firstName, lastName, role: 'user'
        }

        if (['male', 'female', 'other']?.includes(gender)) {
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

        if (['male', 'female', 'other']?.includes(gender)) {
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

        const filters = { gender, role, isBlocked: status === 'blocked' };

        let result = await getManyUsers(filters)

        if (page && entries) {
            result = result.slice((page - 1) * entries, page * entries)
        }

        return res.status(201).json({
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