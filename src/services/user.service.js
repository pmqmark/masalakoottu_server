const { User } = require("../models/user.model");
const { hashPassword } = require("../utils/password.util");

exports.createUser = async (createObj) => {
    return await User.create(createObj)
}

exports.getUserByEmail = async (email) => {
    return await User.findOne({ email }).lean();
}

exports.getUserByMobile = async (mobile) => {
    return await User.findOne({ mobile }).lean();
}

exports.getUserByGoogleId = async (sub) => {
    return await User.findOne({ googleId: sub }).lean();
}

exports.getUserById = async (id) => {
    return await User.findById(id).lean();
}

exports.getManyUsers = async (filters) => {
    return await User.find(filters);
}

exports.updateUser = async (id, updateObj) => {
    return await User.findByIdAndUpdate(id, {
        $set: updateObj
    }, { new: true })
}

exports.updateUserStatus = async (id, isBlocked) => {
    return await User.findByIdAndUpdate(id, {
        $set: { isBlocked }
    }, { new: true })
}

exports.updatePassword = async (id, password) => {
    const hashedPassword = await hashPassword(password)
    return await User.findByIdAndUpdate(id, {
        $set: { password: hashedPassword }
    }, { new: true })
}