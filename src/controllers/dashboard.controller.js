const { countOrders, orderStatusAndCountHandler, findManyOrders } = require("../services/order.service");
const { countUsers } = require("../services/user.service");

exports.dashboardMetricsCtrl = async (req, res) => {
    try {
        const totalUsers = await countUsers()
        const totalOrders = await countOrders();

        const deliveredOrders = await findManyOrders({ status: "delivered" });
        const totalIncome = deliveredOrders.reduce((total, order) => total + parseInt(order.amount), 0);

        const cancelledOrders = await countOrders({ status: "cancelled" });

        return res.status(200).json({
            success: true,
            message: 'success',
            data: {
                totalUsers,
                totalOrders,
                deliveredOrders: deliveredOrders?.length || 0,
                totalIncome,
                cancelledOrders,
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