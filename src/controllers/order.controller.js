const { findCouponWithCode, addUserToCouponUsersList, saveOrder, onlinePayment, getOrderByTxnId, checkPayStatusWithPhonepeAPI, updateOrder, findAnOrder, findManyOrders } = require("../services/order.service");
const { decrementProductQty } = require("../services/product.service");
const { getCart, getUserById } = require("../services/user.service");

const ClientURL = process.env.ClientURL;

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

exports.checkoutCtrl = async (req, res) => {

    try {
        const { userId, billAddress, shipAddress, payMode, deliveryType,
            deliveryCharge, couponCode } = req.body;

        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Not Found',
                data: null,
                error: 'NOT_FOUND'
            })
        }

        let cart = await getCart(userId);
        if (!cart || cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Empty Cart',
                data: null,
                error: 'BAD_REQUEST'
            });
        }

        let amount = cart.reduce((total, item) => {
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
            couponId: coupon?._id,
        };

        const transactionId = "Masalakoottu_T" + Date.now();

        if (payMode !== 'COD') {
            orderObj.transactionId = transactionId;
        }

        const order = await saveOrder(orderObj)

        if (order) {
            await decrementProductQty(cart)
            await clearCart(userId);
        }

        if (payMode === 'COD') {
            return res.status(201).json({
                success: true,
                message: "Order placed successfully",
                data: { order },
                error: null
            })
        }

        const response = await onlinePayment(transactionId, user, amount)

        return res.status(200).json({
            success: true,
            message: "Order placed successfully",
            data: { instrument_response: response?.data.data.instrumentResponse },
            error: null
        }
        );

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
};


exports.checkPaymentStatusCtrl = async (req, res) => {
    try {
        const merchantTransactionId = req.params.txnId

        console.log({ merchantTransactionId })

        if (!merchantTransactionId) {
            return res.redirect(`${ClientURL}/checkout`);
        }

        const order = await getOrderByTxnId(merchantTransactionId)

        if (!order || !order?.userId) {
            return res.redirect(`${ClientURL}/checkout`);
        }

        const response = await checkPayStatusWithPhonepeAPI(merchantTransactionId);

        console.log("response check", response?.data)

        if (response?.data.success === true && response?.data.code === 'PAYMENT_SUCCESS') {

            const updatedOrder = await updateOrder(order?._id, { payStatus: 'success' })

            console.log('Order payStatus updated successfully:', updatedOrder);

            return res.redirect(`${ClientURL}/profile#order`)
        }
        else {
            console.log({ "Failed Payment , merchantTransactionId: ": merchantTransactionId })
            return res.redirect(`${ClientURL}/checkout`)
        }
    } catch (error) {
        console.error(error);
        return res.redirect(`${ClientURL}/checkout`)
    }
}


exports.updateOrderCtrl = async (req, res) => {
    try {
        const { id } = req.params;
        const updateObj = req.body;

        const updatedOrder = await updateOrder(id, updateObj)

        res.status(200).json({
            success: true,
            message: "success",
            data: { order: updatedOrder },
            error: null,
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

exports.getOrderCtrl = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await findAnOrder(id)

        res.status(200).json({
            success: true,
            message: "success",
            data: { order: order },
            error: null,
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

exports.getManyOrdersCtrl = async (req, res) => {
    try {
        const filters = {}
        const orders = await findManyOrders(filters)

        res.status(200).json({
            success: true,
            message: "success",
            data: { orders: orders },
            error: null,
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