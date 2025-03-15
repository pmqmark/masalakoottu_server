const { default: axios } = require("axios");
const { Order } = require("../models/order.model");
const { User } = require("../models/user.model");
const crypto = require("crypto");
const { orderStatusList } = require("../config/data");

const ServerURL = process.env.ServerURL;

const salt_key = process.env.SALT_KEY;
const merchant_id = process.env.MERCHANT_ID
const NODE_ENV = process.env.NODE_ENV;
const DEV_BASE_URL_PHONEPE = process.env.DEV_BASE_URL_PHONEPE;
const PROD_BASE_URL_PHONEPE = process.env.PROD_BASE_URL_PHONEPE;


exports.saveOrder = async (obj) => {
    return await Order.create(obj);
}

exports.clearCart = async (userId) => {
    return await User.findByIdAndUpdate(userId, {
        $set: { cart: [] }
    }, { new: true })
}

exports.onlinePayment = async (transactionId, user, amount) => {

    const merchantUserId = "MUID" + Date.now();

    const phonePeObj = {
        name: `${user?.firstName} ${user?.lastName}`,
        amount: amount,
        number: user?.mobile,
        MUID: merchantUserId,
        transactionId: transactionId
    }

    const data = {
        merchantId: merchant_id,
        merchantTransactionId: transactionId,
        merchantUserId: merchantUserId,
        amount: phonePeObj.amount * 100,
        redirectUrl: `${ServerURL}/orders/check-pay-status/${transactionId}`,
        redirectMode: 'POST',
        callbackUrl: `${ServerURL}/orders/check-pay-status/${transactionId}`,
        mobileNumber: phonePeObj.number,
        paymentInstrument: {
            type: 'PAY_PAGE'
        }
    };

    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString('base64');
    const keyIndex = 1;
    const string = payloadMain + '/pg/v1/pay' + salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;

    const CURRENT_URL = NODE_ENV === "development" ? `${DEV_BASE_URL_PHONEPE}pay` : `${PROD_BASE_URL_PHONEPE}pay`;

    const options = {
        method: 'POST',
        url: CURRENT_URL,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum
        },
        data: {
            request: payloadMain
        }
    };

    const response = await axios.request(options);

    return response;
}


exports.checkPayStatusWithPhonepeAPI = async (merchantTransactionId) => {
    const merchantId = merchant_id

    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;

    const CURRENT_URL = NODE_ENV === development
        ? `${DEV_BASE_URL_PHONEPE}status/${merchantId}/${merchantTransactionId}`
        : `${PROD_BASE_URL_PHONEPE}status/${merchantId}/${merchantTransactionId}`;

    const options = {
        method: 'GET',
        url: CURRENT_URL,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': `${merchantId}`
        }
    };

    return await axios.request(options);

}

exports.updateOrder = async (id, updateObj) => {
    return await Order.findByIdAndUpdate(id, {
        $set: updateObj
    }, { new: true })
}

exports.getOrderByTxnId = async (transactionId) => {
    return await Order.findOne({ transactionId }).lean()
}

exports.getOrderById = async (id) => {
    return await Order.findById(id).lean()
}


exports.findManyOrders = async (filters) => {
    return await Order.find(filters).sort({createdAt: -1})
}


exports.cancelMyOrder = async (orderId) => {
    return await Order.findByIdAndUpdate(orderId, {
        $set: { status: 'cancelled' }
    }, { new: true })
}

exports.returnMyOrder = async (orderId) => {
    return await Order.findByIdAndUpdate(orderId, {
        $set: { status: 'returned' }
    }, { new: true })
}

exports.countOrders = async (filters = {}) => {
    return await Order.countDocuments(filters)
}

exports.orderStatusAndCountHandler = async () => {
    if (!Array.isArray(orderStatusList) || orderStatusList.length === 0) {
        throw new Error("orderStatusList is empty or not an array");
    }

    const dbqueries = orderStatusList.map((item) => (
        Order.countDocuments({ status: item })
    ))

    const countArr = await Promise.all(dbqueries)

    // const statusVsCount = orderStatusList.map((item, index) => (
    //     { [item]: countArr[index] }
    // ))

    return {
        statuses: orderStatusList,
        counts: countArr
    }
}
