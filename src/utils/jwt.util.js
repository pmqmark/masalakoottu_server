const jwt = require("jsonwebtoken");

const expiryAccessToken = "1d";
const expiryRefreshToken = "7d";

//Create Access Token;
module.exports.generateAccessToken = (userInfo) => {
    return jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET, { expiresIn: expiryAccessToken })
}

//Create Refresh Token;
module.exports.generateRefreshToken = (userInfo) => {
    return jwt.sign(userInfo, process.env.REFRESH_TOKEN_SECRET, { expiresIn: expiryRefreshToken })
}


module.exports.verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
};

module.exports.verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
};