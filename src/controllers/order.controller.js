const { findCouponWithCode, addUserToCouponUsersList, saveOrder } = require("../services/order.service");
const { getProductById } = require("../services/product.service");
const { getCart, getUserById, fetchUserAddresses, fetchSingleAddress } = require("../services/user.service");


exports.fetchAvailableCoupons = async (req, res) => {
    try {
        const userId = req.user.userId;

        const availableCoupons = await Coupon.find({ userId: { $nin: [userId] }, isAvailable: true, expiryDate: { $gte: new Date() } })

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { coupons: availableCoupons },
            error: null
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}


exports.calculateCouponCtrl = async (req, res) => {
    const { userId, couponCode, amount } = req.body;

    try {
        const coupon = await findCouponWithCode(couponCode);

        if (!coupon || coupon.expiryDate < new Date() || coupon.userList?.includes(userId)
            || amount < coupon.minValue) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired coupon',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        let discountAmount = (coupon.value / 100) * amount;

        discountAmount = Math.min(discountAmount, coupon.maxValue)

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { discountAmount },
            error: null
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
};

exports.checkout = async (req, res) => {

    try {
        const { userId, billAddress, shipAddress, payMode, deliveryType,
            deliveryCharge, couponCode } = req.body;

        let cart = await getCart(userId);
        if (!cart || cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Empty Cart',
                data: null,
                error: 'BAD_REQUEST'
            });
        }

        let amount = cart.reduce(async (total, item) => {
            return (total + item?.price * item.quantity)
        }, 0);

        const coupon = await findCouponWithCode(couponCode);

        if (!coupon || coupon.expiryDate < new Date() || coupon.userList?.includes(userId)
            || amount < coupon.minValue) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired coupon',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        let discountAmount = (coupon.value / 100) * amount;

        discountAmount = Math.min(discountAmount, coupon.maxValue)

        amount = amount - discountAmount;

        await addUserToCouponUsersList(userId, coupon?._id)

        const orderObj = {
            payMode,
            amount,
            items: cart,
            userId,
            billAddress,
            shipAddress,
            discount,
            deliveryType,
            deliveryCharge,
            coupon: coupon?._id,
        };

        const order = await saveOrder(orderObj)

        if (order) {
            await clearCart(userId);
        }

        return res.status(201).json({
            success: false,
            message: "Order placed successfully",
            data: { order },
            error: null
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
};