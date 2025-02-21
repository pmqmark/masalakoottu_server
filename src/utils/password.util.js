const bcrypt = require('bcrypt');

// Function to hash a password
exports.hashPassword = async (plainPassword) => {
    try {
        const saltRounds = 10; 
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error("Error hashing password:", error);
    }
};
