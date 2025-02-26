const { fetchCoupons, fetchCouponById, createCoupon, updateCoupon } = require("../services/coupon.service");

exports.fetchAvailableCouponsCtrl = async (req, res) => {
    try {
        const { userId } = req.user;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const filters = { userId: { $nin: [userId] }, isAvailable: true, expiryDate: { $gte: new Date() } }

        const availableCoupons = await fetchCoupons(filters)

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

exports.fetchAllCouponsCtrl = async (req, res) => {
    try {
        const filters = {}

        const allCoupons = await fetchCoupons(filters)

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { coupons: allCoupons },
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

exports.fetchCouponByIdCtrl = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const coupon = await fetchCouponById(id)
        const { userList, ...couponData } = coupon.toObject()

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { coupon: couponData },
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

exports.createCouponCtrl = async (req, res) => {
    try {
        const { code, value, expiryDate } = req.body;

        if (!code?.trim() || isNaN(value) || expiryDate < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const createObj = req.body;

        const coupon = await createCoupon(createObj)
        if (!coupon) {
            return res.status(500).json({
                success: false,
                message: "Failed",
                data: null,
                error: 'INTERNAL_SERVER_ERROR'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { coupon },
            error: null
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

exports.updateCouponCtrl = async (req, res) => {
    try {
        const updateObj = req.body;

        const coupon = await updateCoupon(updateObj)
        if (!coupon) {
            return res.status(500).json({
                success: false,
                message: "Failed",
                data: null,
                error: 'INTERNAL_SERVER_ERROR'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { coupon },
            error: null
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}