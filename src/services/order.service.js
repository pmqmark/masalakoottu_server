const { Order } = require("../models/order.model");
const { User } = require("../models/user.model");
const { orderStatusList } = require("../config/data");
const { phonePeApi } = require("../services/pg.service")

const ClientURL = process.env.ClientURL;

exports.saveOrder = async (obj) => {
    return await Order.create(obj);
}

exports.clearCart = async (userId) => {
    return await User.findByIdAndUpdate(userId, {
        $set: { cart: [] }
    }, { new: true })
}

exports.onlinePayment = async (merchantOrderId, user, amount) => {

    const payload = {
        "merchantOrderId": `${merchantOrderId}`,
        "amount": amount * 100,
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


exports.checkOrderPayStatusWithPG = async (merchantOrderId) => {
    const response = await phonePeApi.get(`/checkout/v2/order/${merchantOrderId}/status`)

    return response
}

exports.updateOrder = async (id, updateObj) => {
    return await Order.findByIdAndUpdate(id, {
        $set: updateObj
    }, { new: true })
}

exports.getOrderByMOId = async (merchantOrderId) => {
    return await Order.findOne({ merchantOrderId }).lean()
}

exports.getOrderById = async (id) => {
    return await Order.findById(id).lean()
}


exports.findManyOrders = async (filters) => {
    return await Order.find(filters).sort({ createdAt: -1 })
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

    return {
        statuses: orderStatusList,
        counts: countArr
    }
}
