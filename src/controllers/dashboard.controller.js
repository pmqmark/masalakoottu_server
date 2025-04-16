const { countOrders, orderStatusAndCountHandler, findManyOrders } = require("../services/order.service");
const { getManyProducts } = require("../services/product.service");
const { countUsers } = require("../services/user.service");

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc.js');
const timezone = require('dayjs/plugin/timezone.js');
const { User } = require("../models/user.model");
const { Order } = require("../models/order.model");
dayjs.extend(utc);
dayjs.extend(timezone);

module.exports.dashboardMetricsCtrl = async (req, res) => {
    try {
        const totalUsers = await countUsers()
        const totalOrders = await countOrders();

        const deliveredOrders = await findManyOrders({ status: "delivered" });
        const totalSale = deliveredOrders.reduce((total, order) => total + parseFloat(order.amount), 0);
        const totalRevenue = deliveredOrders.reduce((total, order) => total + parseFloat(order.amount) - parseFloat(order.deliveryCharge), 0);
        const allProducts = await getManyProducts()
        const totalItems = allProducts.reduce((acc, item) => {
            const prodQty = item?.batches?.reduce((com, elem) => com + elem?.quantity, 0) || 0;
            return acc + prodQty
        }, 0)

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


module.exports.orderStatusesAndCountsCtrl = async (req, res) => {
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

module.exports.getRecentOrders = async (req, res) => {
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

module.exports.getUserAddedCount = async (req, res) => {
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


module.exports.getBestSellingProducts = async (req, res) => {
    try {
        const thirtyDaysAgo = dayjs().subtract(30, 'day').startOf('day').toDate();

        const bestSellingProducts = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },

            {
                $unwind: "$items"
            },

            {
                $group: {
                    _id: "$items.productId",
                    totalQuantity: { $sum: "$items.quantity" }
                }
            },

            {
                $sort: { totalQuantity: -1 }
            },

            {
                $limit: 10
            },

            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },

            {
                $unwind: "$product"
            },

            {
                $project: {
                    _id: 0,
                    productId: "$_id",
                    productName: "$product.name",
                    totalQuantity: 1,
                    thumbnail: "$product.thumbnail",
                    price: "$product.price"
                }
            }
        ])

        return res.status(200).json({
            success: true,
            message: 'success',
            data: {
                result: bestSellingProducts
            },
            error: null
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: 'INTERNAL_SERVER_ERROR' });
    }
}


module.exports.getSaleAnalytics = async (req, res) => {
    try {
        const past12Months = dayjs().subtract(11, 'months').startOf('month').toDate();

        const deliveredPipeline = [
            {
                $match: {
                    status: 'delivered',
                    orderDate: { $gte: past12Months }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$orderDate" },
                        month: { $month: "$orderDate" }
                    },
                    totalRevenue: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]

        const cancelledPipeline = [
            {
                $match: {
                    status: 'cancelled',
                    orderDate: { $gte: past12Months }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$orderDate" },
                        month: { $month: "$orderDate" }
                    },
                    totalLoss: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]

        const deliveredChart = await Order.aggregate(deliveredPipeline)
        const cancelledChart = await Order.aggregate(cancelledPipeline)

        const months = Array.from({ length: 12 }, (_, i) => {
            const date = dayjs().subtract(11 - i, 'months');
            return { label: date.format('MMM'), monthNumber: date.month() + 1 };
        });

        const formatChart = (data, key) => {
            return months.map(({ label, monthNumber }) => {
                const entry = data.find(d => d._id.month === monthNumber);
                return {
                    x: label,
                    y: entry ? entry[key] : 0
                };
            });
        };

        const categories = months?.map((item) => item.label)

        const deliveredFormatted = formatChart(deliveredChart, 'totalRevenue');
        const cancelledFormatted = formatChart(cancelledChart, 'totalLoss');

        const series = [
            {
                name: "Sales",
                data: deliveredFormatted
            },
            {
                name: "Loss",
                data: cancelledFormatted
            },
        ]

        return res.status(200).json({
            success: true,
            message: 'success',
            data: {
                result: {
                    categories,
                    series
                }
            },
            error: null
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: 'INTERNAL_SERVER_ERROR' });
    }
}


/////////////////////////


module.exports.dashboardCtrl = async (req, res) => {
    try {
        // Metrics
        const totalUsers = await countUsers()
        const totalOrders = await countOrders();

        const deliveredOrders = await findManyOrders({ status: "delivered" });
        const totalSale = deliveredOrders.reduce((total, order) => total + parseFloat(order.amount), 0);
        const totalRevenue = deliveredOrders.reduce((total, order) => total + parseFloat(order.amount) - parseFloat(order.deliveryCharge), 0);
        const allProducts = await getManyProducts({}, { stock: 1 })
        const totalItems = allProducts.reduce((acc, item) => { return acc + item?.stock }, 0)

        const metrics_data = {
            totalSale,
            totalOrders,
            totalItems,
            totalRevenue,
            totalUsers,
        }

        // Recent orders
        const sevenDaysAgo = dayjs().subtract(7, 'day').toDate();

        const allOrders = await findManyOrders({ createdAt: { $gte: sevenDaysAgo } }, { items: 1 })

        const arr = allOrders?.map((elem) => elem.items)

        const flatArr = arr.flat();

        const recent_orders = flatArr.length > 10 ? flatArr.slice(0, 10) : flatArr;


        // Recent users
        const dayCount = 7

        // const sevenDaysAgo = dayjs().subtract(dayCount, 'day').startOf('day').toDate();

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

        const recent_users = [];

        for (let i = dayCount; i >= 1; i--) {
            const day = dayjs().subtract(i, 'day');
            const dayFormatted = day.format('YYYY-MM-DD');
            const dayName = day.format('ddd');
            const found = results.find(r => r._id.day === dayFormatted);
            recent_users.push({
                day: dayName,
                userCount: found ? found.count : 0
            });
        }


        // Best selling prods
        const thirtyDaysAgo = dayjs().subtract(30, 'day').startOf('day').toDate();

        const bestSellingProducts = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },

            {
                $unwind: "$items"
            },

            {
                $group: {
                    _id: "$items.productId",
                    totalQuantity: { $sum: "$items.quantity" }
                }
            },

            {
                $sort: { totalQuantity: -1 }
            },

            {
                $limit: 10
            },

            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },

            {
                $unwind: "$product"
            },

            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: 'productIds',
                    as: 'category'
                }
            },

            {
                $project: {
                    _id: 0,
                    productId: "$_id",
                    productName: "$product.name",
                    totalQuantity: 1,
                    thumbnail: "$product.thumbnail",
                    price: "$product.price",
                    category: { $first: "$category.name" }
                }
            }
        ])


        // Sale analytics
        const past12Months = dayjs().subtract(11, 'months').startOf('month').toDate();

        const deliveredPipeline = [
            {
                $match: {
                    status: 'delivered',
                    orderDate: { $gte: past12Months }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$orderDate" },
                        month: { $month: "$orderDate" }
                    },
                    totalRevenue: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]

        const cancelledPipeline = [
            {
                $match: {
                    status: 'cancelled',
                    orderDate: { $gte: past12Months }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$orderDate" },
                        month: { $month: "$orderDate" }
                    },
                    totalLoss: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]

        const deliveredChart = await Order.aggregate(deliveredPipeline)
        const cancelledChart = await Order.aggregate(cancelledPipeline)

        const months = Array.from({ length: 12 }, (_, i) => {
            const date = dayjs().subtract(11 - i, 'months');
            return { label: date.format('MMM'), monthNumber: date.month() + 1 };
        });

        const formatChart = (data, key) => {
            return months.map(({ label, monthNumber }) => {
                const entry = data.find(d => d._id.month === monthNumber);
                return {
                    x: label,
                    y: entry ? entry[key] : 0
                };
            });
        };

        const categories = months?.map((item) => item.label)

        const deliveredFormatted = formatChart(deliveredChart, 'totalRevenue');
        const cancelledFormatted = formatChart(cancelledChart, 'totalLoss');

        const series = [
            {
                name: "Sales",
                data: deliveredFormatted
            },
            {
                name: "Revenue loss from cancelled orders",
                data: cancelledFormatted
            },
        ]

        const sale_analytics = { categories, series }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: {
                metrics_data,
                recent_orders,
                recent_users,
                best_prods: bestSellingProducts,
                sale_analytics
            },
            error: null
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: 'INTERNAL_SERVER_ERROR' });
    }
};


module.exports.stockReport = async (req, res) => {
    try {
        const products = await getManyProducts({}, { name: 1, hsn: 1, batches: 1 })

        let result = products?.map((item) => {
            const stock = item?.batches?.reduce((acc, val) => acc + val?.quantity, 0) || 0;
            item.stock = stock;
            return item;
        })

        return res.status(200).json({
            success: true,
            message: 'success',
            data: {result},
            error: null
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: 'INTERNAL_SERVER_ERROR' });
    }
}