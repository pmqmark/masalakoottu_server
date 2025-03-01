const { isValidObjectId } = require("mongoose");
const { payModeList, payStatusList, orderStatusList, deliveryTypeList } = require("../config/data");
const { saveOrder, onlinePayment, getOrderByTxnId, checkPayStatusWithPhonepeAPI, updateOrder, findManyOrders, getOrderById, cancelMyOrder, returnMyOrder, clearCart } = require("../services/order.service");
const { decrementProductQty, getBuyNowItem } = require("../services/product.service");
const { getCart, getUserById } = require("../services/user.service");
const { calculateDiscount, addUserIdToCoupon, applyAutomaticDiscounts, applyCouponDiscount } = require("../services/discount.service");

const ClientURL = process.env.ClientURL;


exports.checkoutCtrl = async (req, res) => {
    try {
        const {
            billAddress, shipAddress, payMode, deliveryType, deliveryCharge = 0,
            couponCode, buyMode, productId, quantity, variations
        } = req.body;

        const { userId } = req.user;
        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found', error: 'NOT_FOUND' });
        }

        let items = [];

        if (buyMode === "later") {
            items = await getCart(userId);
            if (!items || items.length === 0) {
                return res.status(400).json({ success: false, message: 'Empty Cart', error: 'BAD_REQUEST' });
            }
        } else if (buyMode === "now") {
            if (!isValidObjectId(productId) || quantity <= 0) {
                return res.status(400).json({ success: false, message: 'Invalid Product Id or Quantity', error: 'BAD_REQUEST' });
            }
            const buyNowItem = await getBuyNowItem(productId, quantity, variations);
            if (!buyNowItem) {
                return res.status(400).json({ success: false, message: 'Unable to fetch item', error: 'BAD_REQUEST' });
            }
            items = [buyNowItem];
        } else {
            return res.status(400).json({ success: false, message: 'Invalid Buy Mode', error: 'BAD_REQUEST' });
        }

        let amount = items.reduce((total, item) => {
            const extraCharges = item.variations?.reduce((acc, elem) => acc + elem?.additionalPrice, 0) || 0;
            return total + extraCharges + (item.price * item.quantity);
        }, 0);

        let discountAmount = 0;
        const { autoDiscountAmt, autoDiscountMsg } = await applyAutomaticDiscounts(items)
        console.log({ autoDiscountMsg })

        if (typeof autoDiscountAmt === "number" && autoDiscountAmt > 0) {
            discountAmount += autoDiscountAmt;
        }

        if (couponCode?.trim()) {
            const { couponDiscountAmt, couponDiscountMsg } = await applyCouponDiscount(userId, couponCode, amount)
            console.log({ couponDiscountMsg })

            if (typeof couponDiscountAmt === "number" && couponDiscountAmt > 0) {
                discountAmount += couponDiscountAmt
            }
        }

        const orderAmount = amount + Math.max(0, deliveryCharge) - discountAmount;
        const transactionId = "Masalakoottu_T" + Date.now();

        const orderObj = {
            payMode,
            amount: orderAmount,
            items,
            userId,
            billAddress,
            shipAddress,
            discount: discountAmount,
            deliveryType,
            deliveryCharge,
            transactionId
        };

        const order = await saveOrder(orderObj);
        if (!order) {
            return res.status(500).json({ success: false, message: 'Failed to save Order', error: 'INTERNAL_SERVER_ERROR' });
        }

        if (couponCode) {
            await addUserIdToCoupon(couponCode, userId);
        }

        if (payMode === 'COD') {
            await decrementProductQty(items);
            if (buyMode === "later") await clearCart(userId);

            return res.status(201).json({ success: true, message: "Order placed successfully", data: { order } });
        }

        const paymentResponse = await onlinePayment(transactionId, user, orderAmount);
        if (!paymentResponse?.success) {
            return res.status(500).json({ success: false, message: 'Failed to initiate payment', error: 'FAILED_PAYMENT_INITIATION' });
        }

        await decrementProductQty(items);
        if (buyMode === "later") await clearCart(userId);

        return res.status(200).json({
            success: true,
            message: "Order placed successfully",
            data: { instrument_response: paymentResponse?.data?.data?.instrumentResponse }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: 'INTERNAL_SERVER_ERROR' });
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

exports.getAllOrdersCtrl = async (req, res) => {
    try {
        const { payMode, payStatus, status, deliveryType } = req.query;
        const filters = {}

        if (payModeList?.includes(payMode)) {
            filters.payMode = payMode;
        }
        if (payStatusList?.includes(payStatus)) {
            filters.payStatus = payStatus;
        }
        if (orderStatusList?.includes(status)) {
            filters.status = status;
        }
        if (deliveryTypeList?.includes(deliveryType)) {
            filters.deliveryType = deliveryType;
        }

        const orders = await findManyOrders(filters)

        res.status(200).json({
            success: true,
            message: "success",
            data: { orders },
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

        if (['delivered', 'cancelled', 'returned', 'refunded']?.includes(order?.status)) {
            return res.status(400).json({
                success: false,
                message: 'Unable to cancel the order',
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