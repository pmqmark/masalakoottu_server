const { Address } = require("../models/address.model");
const { User } = require("../models/user.model");
const { hashPassword } = require("../utils/password.util");
const _ = require('lodash');

const normalizeVariations = (variations) => {
    return variations
        .map(v => ({
            variationId: v.variationId.toString(),
            optionId: v.optionId.toString(),
            additionalPrice: v.additionalPrice
        }))
        .sort((a, b) => a.variationId.localeCompare(b.variationId));
};


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
    return await User.find(filters, {password:0, cart:0});
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

exports.addToCart = async (userId, productId, quantity, variations=[]) => {
    const user = await User.findById(userId)
    let cart = user.cart;

    const itemIndex = cart.findIndex(item =>
        item.productId.toString() === productId &&
        _.isEqual(normalizeVariations(item.variations), normalizeVariations(variations))
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

exports.updateCart = async (userId, itemId, quantity) => {
    if (quantity < 0) {
        throw new Error("QUANTITY_CANNOT_BE_NEGATIVE");
    }

    const user = await User.findById(userId)
    let cart = user.cart;

    const itemIndex = cart.findIndex(item =>
        item._id.toString() === itemId
    );

    if (itemIndex > -1) {
        cart[itemIndex].quantity = quantity;
    } else {
        throw new Error("ITEM_NOT_IN_CART")
    }

    user.cart = cart;

    await user.save();
    return user.cart
}


exports.getCart = async (userId) => {
    const user = await User.findById(userId)
        .populate({
            path: 'cart.productId',
            select: 'name price thumbnail variations',
            populate: {
                path: 'variations.options',
                select: 'optionId additionalPrice'
            }
        })
        .populate('cart.variations.variationId', 'name')
        .populate('cart.variations.optionId', 'value')
        .lean();

    if (!user || !user.cart) return [];

    const cart = user.cart.map(item => {
        const product = item?.productId || {};
        const variations = product?.variations || [];

        const obj = {
            _id: item?._id,
            productId: product._id || null,
            quantity: item?.quantity || 1,
            name: product.name || "Unknown Product",
            price: product.price || 0,
            thumbnail: product.thumbnail || null,
            variations: []
        };

        const cartItemVariations = item.variations || [];

        obj.variations = cartItemVariations.map(elem => {
            const variationIdStr = elem.variationId?._id?.toString() || null;
            const optionIdStr = elem.optionId?._id?.toString() || null;

            const variation = variations?.find(v => v?.variationId?.toString() === variationIdStr) || {};
            const option = variation?.options?.find(opt => opt?.optionId?.toString() === optionIdStr) || {};

            return {
                name: elem?.variationId?.name || "Unknown Variation",
                value: elem?.optionId?.value || "Unknown Option",
                additionalPrice: option?.additionalPrice || 0,
                variationId: variationIdStr,
                optionId: optionIdStr,
            };
        });

        return obj;
    });

    return cart;
};


// exports.removeFromCart = async (userId, productId, variations=[]) => {
//     const user = await User.findById(userId);
//     if (!user || !Array.isArray(user?.cart)) throw new Error("Cart not found");

//     let cart = user?.cart;

//     const itemIndex = cart.findIndex(item =>
//         item.productId.toString() === productId &&
//         _.isEqual(normalizeVariations(item.variations), normalizeVariations(variations))
//     );

//     if (itemIndex > -1) {
//         cart.splice(itemIndex, 1);
//     } else {
//         throw new Error("Item not found in cart");
//     }

//     user.cart = cart;
//     await user.save();
//     return user.cart;
// };

exports.removeFromCart = async (userId, itemId) => {
    const user = await User.findById(userId);
    if (!user || !Array.isArray(user?.cart)) throw new Error("Cart not found");

    let cart = user?.cart;

    const itemIndex = cart.findIndex(item => item._id.toString() === itemId);

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

exports.fetchManyAddress = async (filters) => {
    return await Address.find(filters)
}

exports.fetchOneAddress = async (filters) => {
    return await Address.findOne(filters)
}


exports.fetchSingleAddress = async (id) => {
    return await Address.findById(id)
}

exports.createAddress = async (obj) => {
    return await Address.create(obj)
}

exports.updateAddress = async (id, obj) => {
    return await Address.findByIdAndUpdate(id, {
        $set: obj
    }, { new: true })
}

exports.deleteAddress = async (id) => {
    return await Address.findByIdAndDelete(id)
}

exports.countUsers = async (filters = {}) => {
    return await User.countDocuments(filters)
}