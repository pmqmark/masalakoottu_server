const { Order } = require("../models/order.model");
const { User } = require("../models/user.model");
const { orderStatusList } = require("../config/data");
const { phonePeApi } = require("../services/pg.service");
const { Zone } = require("../models/zone.model");
const { Charge } = require("../models/charge.model");

const ClientURL = process.env.ClientURL;

module.exports.saveOrder = async (obj) => {
    return await Order.create(obj);
}

module.exports.clearCart = async (userId) => {
    return await User.findByIdAndUpdate(userId, {
        $set: { cart: [] }
    }, { new: true })
}

module.exports.onlinePayment = async (merchantOrderId, user, amount) => {

    const payload = {
        "merchantOrderId": `${merchantOrderId}`,
        "amount": (amount * 100).toFixed(2),
        "expireAfter": 1200,
        "metaInfo": {
            "name": `${user?.firstName} ${user?.lastName}`,
            "amount": amount,
            "number": user?.mobile,
        },
        "paymentFlow": {
            "type": "PG_CHECKOUT",
            "message": "Payment message used for collect requests",
            "merchantUrls": {
                "redirectUrl": ClientURL
            }
        }
    }

    // Initiate Payment
    const response = await phonePeApi.post("/checkout/v2/pay", payload)
    console.log(response)

    return response;
}


module.exports.checkOrderPayStatusWithPG = async (merchantOrderId) => {
    const response = await phonePeApi.get(`/checkout/v2/order/${merchantOrderId}/status`)

    return response
}

module.exports.updateOrder = async (id, updateObj) => {
    return await Order.findByIdAndUpdate(id, {
        $set: updateObj
    }, { new: true })
}

module.exports.getOrderByMOId = async (merchantOrderId) => {
    return await Order.findOne({ merchantOrderId }).lean()
}

module.exports.getOrderById = async (id) => {
    return await Order.findById(id)
        .populate("userId", "firstName lastName email mobile")
        .populate("billAddress")
        .populate("shipAddress")
        .lean()
}


module.exports.findManyOrders = async (filters = {}, project = {}) => {
    return await Order.find(filters, project)
        .populate("userId", "firstName lastName email mobile")
        .populate("billAddress")
        .populate("shipAddress")
        .sort({ createdAt: -1 })
}


module.exports.cancelMyOrder = async (orderId) => {
    return await Order.findByIdAndUpdate(orderId, {
        $set: { status: 'cancelled' }
    }, { new: true })
}

module.exports.returnMyOrder = async (orderId) => {
    return await Order.findByIdAndUpdate(orderId, {
        $set: { status: 'returned' }
    }, { new: true })
}

module.exports.countOrders = async (filters = {}) => {
    return await Order.countDocuments(filters)
}

module.exports.orderStatusAndCountHandler = async () => {
    if (!Array.isArray(orderStatusList) || orderStatusList.length === 0) {
        throw new Error("orderStatusList is empty or not an array");
    }

    const dbqueries = orderStatusList.map((item) => (
        Order.countDocuments({ status: item })
    ))

    const countArr = await Promise.all(dbqueries)

    return {
        statuses: orderStatusList,
        counts: countArr
    }
}


module.exports.sendRefundRequestToPhonepe = async (postObj) => {
    const response = await phonePeApi.post("/payments/v2/refund", postObj)

    return response
}

module.exports.fetchRefundStatusFromPhonepe = async (merchantRefundId) => {
    const response = await phonePeApi.get(`/payments/v2/refund/${merchantRefundId}/status`)

    return response
}


// The following are services to fetch serviceable pincodes and Shipping charges from db (Use Delhivery APIs instead);

module.exports.getStaticPincodeServicibility = async (pincode) => {
    console.log({ pincode })

    const zone = await Zone.findOne({ pincodes: { $in: [pincode] } })

    if (zone) {
        return true
    }
    else {
        return false
    }
}

module.exports.calculateStaticShipCostByWt = async (pincode, weight) => {
    console.log({weight})
    const zone = await Zone.findOne({ pincodes: { $in: [pincode] } }) || await Zone.findOne({ name: 'default' });

    if (!zone) throw new Error('Zone not found');

    const charge = await Charge.findOne({ kind: "shipping", basis: "weight", zone: zone?._id });

    if (!charge || !Array.isArray(charge.criteria)) throw new Error('Invalid Charge');

    const sortedList = charge.criteria.sort((a, b) => a.value - b.value);

    const item = sortedList.find(item => item?.value >= weight);

    if (!item || isNaN(item.price)) throw new Error('Invalid Shipping Price');

    return item.price;
}