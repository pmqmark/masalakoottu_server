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

exports.addToCart = async (userId, productId, quantity) => {
    const user = await User.findById(userId)
    let cart = user.cart;
    const itemIndex = cart.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += quantity;
    } else {
        cart.push({ productId, quantity })
    }

    user.cart = cart;

    return await user.save();
}

exports.getCart = async (userId) => {
    const user = await User.findById(userId);
    return user.cart
}

exports.removeFromCart = async (userId, productId) => {
    const user = await User.findById(userId)
    let cart = user.cart;

    cart = cart.filter(item => item.productId.toString() !== productId)

    user.cart = cart;

    return await user.save();
}

exports.addToWishlist = async (userId, productId) => {
    const user = await User.findById(userId)
    let wishlist = user.wishlist;
    
    wishlist.push(productId)

    user.wishlist = wishlist;

    return await user.save();
}

exports.getWishlist = async (userId) => {
    const user = await User.findById(userId);
    return user.wishlist
}

exports.removeFromWishlist = async (userId, productId) => {
    const user = await User.findById(userId)
    let wishlist = user.wishlist;

    wishlist = wishlist.filter(item => item.productId.toString() !== productId)

    user.wishlist = wishlist;

    return await user.save();
}