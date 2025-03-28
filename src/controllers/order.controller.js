const { isValidObjectId } = require("mongoose");
const { payModeList, payStatusList, orderStatusList, deliveryTypeList } = require("../config/data");
const { saveOrder, onlinePayment, updateOrder, findManyOrders, getOrderById,
    cancelMyOrder, returnMyOrder, clearCart, checkOrderPayStatusWithPG,
    sendRefundRequestToPhonepe,
    fetchRefundStatusFromPhonepe } = require("../services/order.service");
const { decrementProductQty, getBuyNowItem, stockChecker } = require("../services/product.service");
const { getCart, getUserById } = require("../services/user.service");
const { addUserIdToCoupon, applyAutomaticDiscounts, applyCouponDiscount } = require("../services/discount.service");
const moment = require("moment");


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

        const removedItems = [];

        items = items.filter((item) => {
            if (item.stockStatus === 'OUT_OF_STOCK') {
                removedItems.push(item.name);
                return false
            }
            return true
        }
        )

        if (removedItems.length > 0) {
            return res.status(400).json({
                success: false,
                message: `The following items are out of stock: ${removedItems.join(", ")}`,
                error: 'OUT_OF_STOCK'
            });
        }

        items = items.map((item) => {
            if (item.stockStatus === 'INSUFFICIENT') {
                item.quantity = Math.max(item.stock, 1);
            }

            return item
        })

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Empty Cart', error: 'BAD_REQUEST' });
        }

        let subTotal = items.reduce((total, item) => {
            const extraCharges = item.variations?.reduce((acc, elem) => acc + elem?.additionalPrice, 0) || 0;
            return total + ((item.price + extraCharges) * item.quantity);
        }, 0);

        const totalTax = items.reduce((total, item) => {
            const extraCharges = item.variations?.reduce((acc, elem) => acc + elem?.additionalPrice, 0) || 0;
            return total + (((item.price + extraCharges) * item.quantity) * (item.tax / 100));
        }, 0);


        let discountAmount = 0;
        const { autoDiscountAmt, autoDiscountMsg } = await applyAutomaticDiscounts(items)
        console.log({ autoDiscountMsg })

        if (typeof autoDiscountAmt === "number" && autoDiscountAmt > 0) {
            discountAmount += autoDiscountAmt;
        }

        if (couponCode?.trim()) {
            const { couponDiscountAmt, couponDiscountMsg } = await applyCouponDiscount(userId, couponCode, (subTotal + totalTax))
            console.log({ couponDiscountMsg })

            if (typeof couponDiscountAmt === "number" && couponDiscountAmt > 0) {
                discountAmount += couponDiscountAmt
            }

        }

        const orderAmount = subTotal + totalTax + Math.max(0, deliveryCharge) - discountAmount;

        const prefix = 'ORDID';
        const value = moment().add(10, 'seconds').unix();
        const merchantOrderId = `${prefix}${value}`;

        const orderObj = {
            payMode,
            buyMode,
            couponCode,
            totalTax,
            discount: discountAmount,
            deliveryCharge: Math.max(0, deliveryCharge),
            subTotal,
            amount: orderAmount,
            items,
            userId,
            billAddress,
            shipAddress,
            deliveryType,
            merchantOrderId
        };

        const order = await saveOrder(orderObj);
        if (!order) {
            return res.status(500).json({ success: false, message: 'Failed to save Order', error: 'INTERNAL_SERVER_ERROR' });
        }

        if (payMode === 'COD') {

            if (couponCode) {
                await addUserIdToCoupon(couponCode, userId);
            }

            await decrementProductQty(items);
            if (buyMode === "later") await clearCart(userId);

            return res.status(201).json({ success: true, message: "Order placed successfully", data: { order } });
        }

        const paymentResponse = await onlinePayment(merchantOrderId, user, orderAmount);
        if (paymentResponse?.status !== 200) {
            return res.status(500).json({ success: false, message: 'Failed to initiate payment', error: 'FAILED_PAYMENT_INITIATION' });
        }

        return res.status(200).json({
            success: true,
            message: "Order placed successfully",
            data: { redirectUrl: paymentResponse?.data?.redirectUrl }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error?.message ?? "Internal Server Error",
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
};


exports.checkOrderPayStatusCtrl = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await getOrderById(orderId);

        const response = await checkOrderPayStatusWithPG(order?.merchantOrderId)

        if (!response) {
            return res.status(500).json({
                success: false,
                message: "failed",
                data: null,
                error: null,
            })
        }

        return res.status(200).json({
            success: true,
            message: "success",
            data: { response },
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
            return res.status(500).json({
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

exports.refundRequestToPGCtrl = async (req, res) => {
    try {
        const { orderId, amount } = req.body;

        if (!isValidObjectId(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Id",
                data: null,
                error: "INVALID_ID"
            })
        }

        const order = await getOrderById(orderId)

        if (!order || order?.payStatus !== "completed") {
            return res.status(400).json({
                success: false,
                message: "Invalid Order",
                data: null,
                error: "BAD_REQUEST"
            })
        }

        const prefix = 'RFDID';
        const value = moment().add(10, 'seconds').unix();
        const merchantRefundId = `${prefix}${value}`;

        const postObj = {
            merchantRefundId: merchantRefundId,
        }

        if (order?.merchantOrderId) {
            postObj.originalMerchantOrderId = order?.merchantOrderId
        }

        // if an amount is specified in req use it else use order amount
        if (amount && !isNaN(amount)) {
            postObj.amount = amount
        }
        else {
            postObj.amount = order?.amount;
        }

        const response = await sendRefundRequestToPhonepe(postObj)

        console.log({ response })

        if (response.status === 200) {
            const refundId = response?.data?.refundId;
            await updateOrder(orderId, { refundId })
        }
        else {
            return res.status(500).json({
                success: false,
                message: "Failed to send refund request to PG",
                data: null,
                error: null,
            })
        }

        return res.status(200).json({
            success: true,
            message: "success",
            data: { result: response?.data },
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


exports.getRefundStatusCtrl = async (req, res) => {
    try {
        const { merchantRefundId } = req.params;

        if (!merchantRefundId?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Invalid Merchant refund Id",
                data: null,
                error: "BAD_REQUEST",
            })
        }

        const response = await fetchRefundStatusFromPhonepe(merchantRefundId)

        if (response.status !== 200) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch refund status from PG",
                data: null,
                error: null,
            })
        }

        return res.status(200).json({
            success: true,
            message: "success",
            data: { result: response?.data },
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