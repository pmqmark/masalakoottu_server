const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.util');
const { getUserByEmail, getUserByMobile, createUser, getUserByGoogleId, updatePassword, getUserById } = require('../services/user.service');
const { isValidObjectId } = require("mongoose");
const { validateMobile, validateEmail, credTypeFinder } = require("../utils/validate.util");
const { generateOTP } = require("../utils/helper.util");
const { sendOTPViaSMS, getOTPWithMobile, deleteOTP, createOTP, validateOTPWithMobile, verifyGoogleIdToken, getOTPWithEmail, sendOTPViaEmail, validateOTPWithEmail, verifyOTP, OTPVerificationStatus } = require("../services/auth.service");
const { comparePasswords } = require("../utils/password.util");


// user LOGIN
exports.userLogin = async (req, res) => {
    const { credential, password } = req.body;

    try {
        const credType = credTypeFinder(credential);

        if(!credType){
            return res.status(400).json({
                success: false,
                message: 'Invalid Credentials',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        let user;
        if (credType === 'email' && validateEmail(credential)) {
            const emailCaseRegex = new RegExp(credential, 'i')

            user = await getUserByEmail(emailCaseRegex)

        }
        else if (credType === 'mobile' && validateMobile(credential)) {
            user = await getUserByMobile(credential)
        }

        if (user) {
            if (user?.credType !== credType) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid Credentials',
                    data: null,
                    error: 'BAD_REQUEST'
                })
            }

            if (user?.isBlocked) {
                return res.status(403).json({
                    success: false,
                    message: 'Blocked User',
                    data: null,
                    error: "ACCESS_DENIED"
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid Credentials',
                data: null,
                error: 'BAD_REQUEST'
            })
        }


        const isValidPassword = await comparePasswords(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials',
                data: null,
                error: 'BAD_REQUEST'
            })
        };

        const accessToken = generateAccessToken({ userId: String(user._id), role: user.role })

        const refreshToken = generateRefreshToken({ userId: String(user._id), role: user.role })

        const { password:pwd, credType:ctype, cart, ...userInfo } = user;

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
                credType: 'googleId',
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

        const accessToken = generateAccessToken({ userId: String(user._id), role: user.role })
        const refreshToken = generateRefreshToken({ userId: String(user._id), role: user.role })

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

// mobile/email
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
        if (validateMobile(mobile)) {
            otpObj.mobile = mobile;
            otpExisting = await getOTPWithMobile(mobile)
        }
        else if (validateEmail(email)) {
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

        // sent otp to mobile/mail using fast2sms/nodemailer
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

// mobile/email & otp
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

        if (validateMobile(mobile)) {
            validOtp = await validateOTPWithMobile({ mobile, otp });
        }
        else if (validateEmail(email)) {
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

        await verifyOTP(validOtp?._id)

        return res.status(200).json({
            success: true,
            message: "Success",
            data: null,
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

// In Forgot password ?
// mobile/email & otp & password
exports.resetPassword = async (req, res) => {
    try {
        const { otp, mobile, email, password } = req.body;
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
        let credType;
        if (validateMobile(mobile)) {
            validOtp = await validateOTPWithMobile({ mobile, otp });
            credType = 'mobile';
        }
        else if (validateEmail(email)) {
            validOtp = await validateOTPWithEmail({ email, otp });
            credType = 'email'
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

        let user;
        if (credType === 'mobile') {
            user = await getUserByMobile(mobile)
        }
        else if (credType === 'email') {
            user = await getUserByEmail(email)
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: null,
                error: "NOT_FOUND"
            });
        }

        await updatePassword(user?._id, password)

        return res.status(200).json({
            success: true,
            message: 'success',
            data: null,
            error: null
        })

    } catch (error) {
        console.error("resetPassword Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null,
            error: "An unexpected error occurred. Please try again later."
        });
    }
}




