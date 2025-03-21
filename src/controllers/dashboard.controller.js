const { countOrders, orderStatusAndCountHandler, findManyOrders } = require("../services/order.service");
const { getManyProducts } = require("../services/product.service");
const { countUsers } = require("../services/user.service");

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc.js');
const timezone = require('dayjs/plugin/timezone.js');
const { User } = require("../models/user.model");
dayjs.extend(utc);
dayjs.extend(timezone);

exports.dashboardMetricsCtrl = async (req, res) => {
    try {
        const totalUsers = await countUsers()
        const totalOrders = await countOrders();

        const deliveredOrders = await findManyOrders({ status: "delivered" });
        const totalSale = deliveredOrders.reduce((total, order) => total + parseFloat(order.amount), 0);
        const totalRevenue = deliveredOrders.reduce((total, order) => total + parseFloat(order.amount) - parseFloat(order.deliveryCharge), 0);
        const allProducts = await getManyProducts({}, { stock: 1 })
        const totalItems = allProducts.reduce((acc, item) => { return acc + item?.stock }, 0)

        const cancelledOrders = await countOrders({ status: "cancelled" });

        return res.status(200).json({
            success: true,
            message: 'success',
            data: {
                totalSale,
                totalOrders,
                totalItems,
                totalRevenue,
                totalUsers,
            },
            error: null
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: 'INTERNAL_SERVER_ERROR' });
    }
};


exports.orderStatusesAndCountsCtrl = async (req, res) => {
    try {
        const orderStatusesAndCounts = await orderStatusAndCountHandler()

        return res.status(200).json({
            success: true,
            message: 'success',
            data: {
                orderStatusesAndCounts,
            },
            error: null
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: 'INTERNAL_SERVER_ERROR' });
    }
}

exports.getRecentOrders = async (req, res) => {
    try {
        const sevenDaysAgo = dayjs().subtract(7, 'day').toDate();

        const allOrders = await findManyOrders({ createdAt: { $gte: sevenDaysAgo } }, { items: 1 })

        const arr = allOrders?.map((elem) => elem.items)

        const flatArr = arr.flat();
        const limited = flatArr.length > 10 ? flatArr.slice(0, 10) : flatArr;

        return res.status(200).json({
            success: true,
            message: 'success',
            data: {
                result: limited
            },
            error: null
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: 'INTERNAL_SERVER_ERROR' });
    }
}

exports.getUserAddedCount = async (req, res) => {
    try {
        const dayCount = 7

        const sevenDaysAgo = dayjs().subtract(dayCount, 'day').startOf('day').toDate();

        const results = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.day": 1 }
            }
        ]);

        const formattedResults = [];

        for (let i = dayCount; i >= 1; i--) {
            const day = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
            const found = results.find(r => r._id.day === day);
            formattedResults.push({
                day: `D-${i}`,
                userCount: found ? found.count : 0
            });
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: {
                result: formattedResults
            },
            error: null
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: 'INTERNAL_SERVER_ERROR' });
    }
}