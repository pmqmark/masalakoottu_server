const bcrypt = require("bcrypt");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.util');
const { getUserByEmail, getUserByMobile, createUser } = require('../services/user.service');


// user LOGIN
exports.userLogin = async (req, res) => {
    const { email, mobile } = req.body;

    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const indianNumberRegex = /^(?:\+91[\s-]?|91[\s-]?)?[6-9]\d{9}$/;

        let user;
        if (emailRegex.test(email)) {
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
        else if (indianNumberRegex.test(mobile)) {
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


        const isValidPassword = await bcrypt.compare(req.body.password, user.password);
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



