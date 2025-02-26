const { findCouponWithCode, addUserToCouponUsersList } = require("../services/coupon.service");
const { saveOrder, onlinePayment, getOrderByTxnId, checkPayStatusWithPhonepeAPI, updateOrder, findManyOrders, getOrderById, cancelMyOrder, returnMyOrder } = require("../services/order.service");
const { decrementProductQty } = require("../services/product.service");
const { getCart, getUserById } = require("../services/user.service");

const ClientURL = process.env.ClientURL;


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
        const { orderId } = req.params;
        const updateObj = req.body;

        const updatedOrder = await updateOrder(orderId, updateObj)

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
        const { orderId } = req.params;

        const order = await getOrderById(orderId)

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

exports.getMySingleOrderCtrl = async (req, res) => {
    try {
        const { userId } = req.user;
        const { orderId } = req.params;

        const order = await getOrderById(orderId);
        if (order?.userId?.toString() !== userId) {
            res.status(500).json({
                success: false,
                message: "Unauthorised",
                data: null,
                error: 'Unauthorised'
            })
        }

        res.status(200).json({
            success: true,
            message: "success",
            data: { order },
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

exports.getMyOrdersCtrl = async (req, res) => {
    try {
        const { userId } = req.user;

        const filters = { userId }
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

// *** Add Code to refund payment ***
exports.cancelMyOrderCtrl = async (req, res) => {
    try {
        const { userId } = req.user;
        const { orderId } = req.params;

        const order = await getOrderById(orderId);
        if (order?.userId?.toString() !== userId) {
            res.status(500).json({
                success: false,
                message: "Unauthorised",
                data: null,
                error: 'Unauthorised'
            })
        }

        if (['delivered', 'cancelled', 'returned']?.includes(order?.status)) {
            return res.status(400).json({
                success: false,
                message: 'Order is either delivered , cancelled or returned',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const cancelledOrder = await cancelMyOrder(orderId)

        if (cancelledOrder?.status !== 'cancelled') {
            return res.status(500).json({
                success: false,
                message: "Failed to cancel",
                data: null,
                error: 'INTERNAL_SERVER_ERROR'
            })
        }

        res.status(200).json({
            success: true,
            message: "success",
            data: { order: cancelledOrder },
            error: null,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

// *** Add Code to refund payment ***
exports.returnMyOrderCtrl = async (req, res) => {
    try {
        const { userId } = req.user;
        const { orderId } = req.params;

        const order = await getOrderById(orderId);
        if (order?.userId?.toString() !== userId) {
            res.status(500).json({
                success: false,
                message: "Unauthorised",
                data: null,
                error: 'Unauthorised'
            })
        }

        if (!['delivered']?.includes(order?.status)) {
            return res.status(400).json({
                success: false,
                message: 'Order is not delivered',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const returnedOrder = await returnMyOrder(orderId)

        if (returnedOrder?.status !== 'returned') {
            return res.status(500).json({
                success: false,
                message: "Failed to return",
                data: null,
                error: 'INTERNAL_SERVER_ERROR'
            })
        }

        res.status(200).json({
            success: true,
            message: "success",
            data: { order: returnedOrder },
            error: null,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}