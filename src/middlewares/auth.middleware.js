const { verifyAccessToken } = require("../utils/jwt.util");

exports.authMiddleware = (req, res, next) => {

    try {
        const authHeader = req?.headers?.authorization || req?.headers?.Authorization;
        // console.log("authHeader", authHeader)
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                data: null,
                error: 'UNAUTHORIZED'
            })
        }

        const acccessToken = authHeader.split(' ')[1];
        // console.log("acccessToken", acccessToken);

        // if the acccessToken is present 
        const user = verifyAccessToken(acccessToken)
        if (user) {
            req.user = user;
            next();
        }
    } catch (error) {
        console.log(error)

        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
            data: null,
            error: 'UNAUTHORIZED'
        })
    }

};
