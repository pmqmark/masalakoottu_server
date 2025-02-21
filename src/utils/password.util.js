const bcrypt = require('bcrypt');

// Function to hash a password
exports.hashPassword = async (plainPassword) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
};

exports.comparePasswords = async (inputpwd, storedpwd) => {
    return await bcrypt.compare(inputpwd, storedpwd);
}
