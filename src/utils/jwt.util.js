const jwt = require("jsonwebtoken");

const expiryAccessToken = "1d";
const expiryRefreshToken = "7d";

//Create Access Token;
exports.generateAccessToken = (userInfo) => {
    return jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET, { expiresIn: expiryAccessToken })
}

//Create Refresh Token;
exports.generateRefreshToken = (userInfo) => {
    return jwt.sign(userInfo, process.env.REFRESH_TOKEN_SECRET, { expiresIn: expiryRefreshToken })
}


exports.verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
};

exports.verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
};