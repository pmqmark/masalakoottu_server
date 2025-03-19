const crypto = require('crypto');
const { getOrderByMOId, updateOrder, clearCart } = require('./order.service');
const { addUserIdToCoupon } = require('./discount.service');
const { decrementProductQty } = require('./product.service');

exports.verifyPhonePeHash = async (phonePeHash) => {
    const username = process.env.PG_USERNAME;
    const password = process.env.PG_PASSWORD;

    const data = `${username}:${password}`
    const hash = crypto.createHash('sha256').update(data).digest('hex')

    if (hash === phonePeHash) {
        return true
    }
    else {
        return false
    }
}


exports.checkoutOrderCompletedHandler = async (payload) => {
    console.log({ payload })

    const { merchantOrderId, orderId, paymentDetails } = payload;
    const order = await getOrderByMOId(merchantOrderId);

    if (!order) {
        throw new Error('Order not found')
    }

    const { _id, couponCode, userId, items, buyMode } = order

    const updateObj = {
        payStatus: 'completed', pgOrderId: orderId
    }

    if (paymentDetails[0]?.transactionId?.trim()) {
        updateObj.transactionId = paymentDetails[0]?.transactionId
    }

    await updateOrder(_id, updateObj)

    if (couponCode) {
        await addUserIdToCoupon(couponCode, userId);
    }

    await decrementProductQty(items);
    if (buyMode === "later") await clearCart(userId);
}


exports.checkoutOrderFailedHandler = async (payload) => {
    console.log({ payload })

    const { merchantOrderId, orderId, paymentDetails } = payload;
    const order = await getOrderByMOId(merchantOrderId);

    if (!order) {
        throw new Error('Order not found')
    }

    const { _id } = order

    const updateObj = {
        payStatus: 'failed', pgOrderId: orderId
    }

    if (paymentDetails[0]?.transactionId?.trim()) {
        updateObj.transactionId = paymentDetails[0]?.transactionId
    }

    await updateOrder(_id, updateObj)

}

exports.pgRefundAcceptedHandler = async (payload) => {
    console.log({ payload })

    const { originalMerchantOrderId, paymentDetails, amount } = payload;
    const order = await getOrderByMOId(originalMerchantOrderId);

    if (!order) {
        throw new Error('Order not found')
    }

    const { _id } = order

    const updateObj = {
        refundStatus: 'in_process',
        refundAmount: amount / 100,
    }

    if (paymentDetails[0]?.transactionId?.trim()) {
        updateObj.refundTransactionId = paymentDetails[0]?.transactionId
    }

    await updateOrder(_id, updateObj)

}

exports.pgRefundCompletedHandler = async (payload) => {
    console.log({ payload })

    const { originalMerchantOrderId, paymentDetails, amount } = payload;
    const order = await getOrderByMOId(originalMerchantOrderId);

    if (!order) {
        throw new Error('Order not found')
    }

    const { _id } = order

    const updateObj = {
        refundStatus: 'completed',
        refundAmount: amount / 100,
        payStatus: 'refunded',
    }

    if (paymentDetails[0]?.transactionId?.trim()) {
        updateObj.refundTransactionId = paymentDetails[0]?.transactionId
    }

    await updateOrder(_id, updateObj)

}

exports.pgRefundFailedHandler = async (payload) => {
    console.log({ payload })

    const { originalMerchantOrderId, paymentDetails, amount } = payload;
    const order = await getOrderByMOId(originalMerchantOrderId);

    if (!order) {
        throw new Error('Order not found')
    }

    const { _id } = order

    const updateObj = {
        refundStatus: 'failed',
        refundAmount: amount / 100,
    }

    if (paymentDetails[0]?.transactionId?.trim()) {
        updateObj.refundTransactionId = paymentDetails[0]?.transactionId
    }

    await updateOrder(_id, updateObj)

}

