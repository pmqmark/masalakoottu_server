const { Coupon } = require("../models/coupon.model");

exports.findCouponWithCode = async (code) => {
    return await Coupon.findOne({ code });
}

exports.fetchCouponById = async (id) => {
    return await Coupon.findById(id)
}

exports.fetchCoupons = async (filters) => {
    return await Coupon.find(filters, { userList: 0 })
}

exports.addUserToCouponUsersList = async (userId, couponId) => {
    return await Coupon.findByIdAndUpdate(couponId, {
        $push: { userList: userId }
    }, { new: true })
}

exports.createCoupon = async (obj) => {
    return await Coupon.create(obj)
}

exports.updateCoupon = async (id, obj) => {
    return await Coupon.findByIdAndUpdate(id, {
        $set: obj
    }, { new: true })
}