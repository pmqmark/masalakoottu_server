const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.util');
const { getUserByEmail, getUserByMobile, createUser, getUserByGoogleId } = require('../services/user.service');
const { isValidObjectId } = require("mongoose");
const { validateMobile, validateEmail } = require("../utils/validate.util");
const { generateOTP } = require("../utils/helper.util");
const { sendOTPViaSMS, getOTPWithMobile, deleteOTP, createOTP, validateOTPWithMobile, verifyGoogleIdToken, getOTPWithEmail, sendOTPViaEmail, validateOTPWithEmail } = require("../services/auth.service");
const { comparePasswords } = require("../utils/password.util");


// user LOGIN
exports.userLogin = async (req, res) => {
    const { email, mobile } = req.body;

    try {
        let user;
        if (validateEmail(email)) {
            const emailCaseRegex = new RegExp(email, 'i')

            user = await getUserByEmail(emailCaseRegex)
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid credentials',
                    data: null,
                    error: 'BAD_REQUEST'
                })
            }
        }
        else if (validateMobile(mobile)) {
            user = await getUserByMobile(mobile)
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid credentials',
                    data: null,
                    error: 'BAD_REQUEST'
                })
            }
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'Invalid Credentials',
                data: null,
                error: 'BAD_REQUEST'
            })
        }


        const isValidPassword = await comparePasswords(req.body.password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials',
                data: null,
                error: 'BAD_REQUEST'
            })
        };

        const accessToken = generateAccessToken({ userId: user._id, role: user.role })

        const refreshToken = generateRefreshToken({ userId: user._id, role: user.role })

        const { password, ...userInfo } = user;

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { userInfo, accessToken, refreshToken },
            error: null
        });

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

// google auth
exports.googleHandler = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid id token',
                data: null,
                error: "INVALID_DATA"
            });
        }

        const ticket = await verifyGoogleIdToken(idToken)

        if (!ticket) {
            return res.status(401).json({
                success: false,
                message: "Invalid Google Token",
                data: null,
                error: "INVALID_TOKEN"
            });
        }

        const payload = ticket.getPayload();

        if (!payload) {
            return res.status(401).json({
                success: false,
                message: "Invalid Token Payload",
                data: null,
                error: "INVALID_PAYLOAD"
            });
        }

        const { sub, email, name } = payload;

        let user = await getUserByEmail(email);
        if (!user) {
            user = await getUserByGoogleId(sub);
        }

        if (user) {
            if (user.isBlocked) {
                return res.status(403).json({
                    success: false,
                    message: 'Blocked User',
                    data: null,
                    error: "ACCESS_DENIED"
                });
            }
        }
        else {
            const createObj = {
                googleId: sub,
                firstName: name,
                email,
                role: 'user',
            }

            const newUser = await createUser(createObj);

            if (!newUser) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to create user",
                    data: null,
                    error: "An unexpected error occurred. Please try again later."
                });
            }

            user = newUser.toObject();
        }

        const accessToken = generateAccessToken({ userId: user._id, role: user.role })
        const refreshToken = generateRefreshToken({ userId: user._id, role: user.role })

        const { password, ...userInfo } = user

        return res.status(200).json({
            success: true,
            message: "Success",
            data: { userInfo, accessToken, refreshToken },
            error: null
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null,
            error: "An unexpected error occurred. Please try again later."
        });
    }
};


exports.regenerateTokens = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        if (typeof refreshToken !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid Token',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const user = verifyRefreshToken(refreshToken);
        console.log({ user })


        const accessToken = generateAccessToken({ userId: user.userId, role: user.role });

        const rt = generateRefreshToken({ userId: user.userId, role: user.role })

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { accessToken, refreshToken: rt },
            error: null
        });

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


exports.sendOTPHandler = async (req, res) => {
    try {
        const { mobile, email } = req.body;

        if (!(validateMobile(mobile) || validateEmail(email))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid format',
                data: null,
                errors: {
                    code: "INVALID_DATA",
                    details: "Invalid Data."
                }
            })
        }

        // Create OTP, store OTP in db and Send OTP  
        let otpExisting;
        const otpObj = {};

        // adding creds to otpObj ;
        if (mobile) {
            otpObj.mobile = mobile;
            otpExisting = await getOTPWithMobile(mobile)
        }
        else if (email) {
            otpObj.email = email;
            otpExisting = await getOTPWithEmail(email)
        }

        // delete existing OTP;
        if (isValidObjectId(otpExisting?._id)) {
            await deleteOTP(otpExisting?._id);
        }

        const OTP = generateOTP();

        if (OTP) {
            otpObj.otp = OTP;
        }

        const otpDoc = await createOTP(otpObj)

        if (!otpDoc?._id) {
            return res.status(500).json({
                success: false,
                message: "Unable to generate OTP",
                data: null,
                error: "An unexpected error occurred. Please try again later."
            })
        }

        // sent otp to mail using fast2sms
        try {
            if (mobile) {
                await sendOTPViaSMS(mobile, OTP);
            }
            else if (email) {
                await sendOTPViaEmail(email, OTP)
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            return res.status(500).json({
                success: false,
                message: "Unable to send OTP",
                data: null,
                error: "An unexpected error occurred. Please try again later."
            })
        }

        return res.status(200).json({
            success: true,
            message: "success",
            data: null,
            error: null
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null,
            error: "An unexpected error occurred. Please try again later."
        })
    }
}

exports.verifyOTPHandler = async (req, res) => {
    try {
        const { otp, mobile, email } = req.body;

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: 'OTP is required',
                data: null,
                error: "INVALID_DATA"
            });
        }

        if (!(validateMobile(mobile) || validateEmail(email))) {
            return res.status(400).json({
                success: false,
                message: 'Email or mobile number is required',
                data: null,
                error: "INVALID_DATA"
            });
        }

        // Validate OTP 
        let validOtp;

        if (mobile) {
            validOtp = await validateOTPWithMobile({ mobile, otp });
        }
        else if (email) {
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

        await deleteOTP(validOtp._id);

        let user;

        if (mobile) {
            user = await getUserByMobile(mobile);
        }
        else if (email) {
            user = await getUserByEmail(email)
        }

        if (user) {
            if (user.isBlocked) {
                return res.status(403).json({
                    success: false,
                    message: 'Blocked User',
                    data: null,
                    error: "ACCESS_DENIED"
                });
            }
        }
        else {
            const createObj = { role: 'user' }
            if (mobile) { createObj.mobile = mobile }
            else if (email) { createObj.email = email }

            const newUser = await createUser(createObj);
            user = await newUser.save();
        }

        const accessToken = generateAccessToken({ userId: user._id, role: user.role });
        const refreshToken = generateRefreshToken({ userId: user._id, role: user.role });

        const { password, ...userInfo } = user.toObject()

        return res.status(user.name ? 200 : 201).json({
            success: true,
            message: "Success",
            data: { userInfo, accessToken, refreshToken },
            error: null
        });

    } catch (error) {
        console.error("verifyOTPHandler Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null,
            error: "An unexpected error occurred. Please try again later."
        });
    }
};




