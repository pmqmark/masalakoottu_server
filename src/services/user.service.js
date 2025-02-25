const { Address } = require("../models/address.model");
const { User } = require("../models/user.model");
const { hashPassword } = require("../utils/password.util");
const _ = require('lodash');

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

exports.addToCart = async (userId, productId, quantity, variations) => {
    const user = await User.findById(userId)
    let cart = user.cart;

    const itemIndex = cart.findIndex(item =>
        item.productId.toString() === productId &&
        _.isEqual(item.variations, variations)
    );

    if (itemIndex > -1) {
        cart[itemIndex].quantity += quantity;
    } else {
        cart.push({ productId, quantity, variations })
    }

    user.cart = cart;

    await user.save();
    return user.cart
}

exports.getCart = async (userId) => {
    const user = await User.findById(userId)
        .populate('cart.productId', 'name price thumbnail');

    const cart = user?.cart?.map(item => (
        {
            productId: item?.productId?._id,
            quantity: item?.quantity,
            variations: item?.variations,

            name: item?.productId?.name,
            price: item?.productId?.price,
            thumbnail: item?.productId?.thumbnail,
        }
    ))

    return cart
}

exports.removeFromCart = async (userId, productId, variations) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    let cart = user.cart;

    const itemIndex = cart.findIndex(item =>
        item.productId.toString() === productId &&
        _.isEqual(item.variations, variations)
    );

    if (itemIndex > -1) {
        cart.splice(itemIndex, 1);
    } else {
        throw new Error("Item not found in cart");
    }

    user.cart = cart;
    await user.save();
    return user.cart;
};

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

exports.fetchUserAddresses = async (userId) => {
    const user = await User.findById(userId)
    return await Address.find({ _id: { $in: user?.addresses } })
}


exports.fetchSingleAddress = async (id) => {
    return await Address.findById(id)
}