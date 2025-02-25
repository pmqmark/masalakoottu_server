const { Coupon } = require("../models/coupon.model");
const { Order } = require("../models/order.model");
const { User } = require("../models/user.model");

exports.findCouponWithCode = async (code) => {
    return await Coupon.findOne({ code });
}

exports.addUserToCouponUsersList = async (userId, couponId) => {
    await Coupon.findByIdAndUpdate(couponId, {
        $push: { userList: userId }
    }, { new: true })
}

exports.saveOrder = async (obj) => {
    return await Order.create(obj);
}

exports.clearCart = async (userId) => {
    return await User.findByIdAndUpdate(userId, {
        $set: { cart: [] }
    }, { new: true })
}