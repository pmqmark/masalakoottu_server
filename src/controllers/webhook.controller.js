const { addUserIdToCoupon } = require("../services/discount.service");
const { getOrderByMOId, clearCart, updateOrder } = require("../services/order.service");
const { decrementProductQty } = require("../services/product.service");
const { verifyPhonePeHash } = require("../services/webhook.service");

exports.phonepeWebhookHandler = async (req, res) => {
    try {
        console.log({ authHeader: req.headers['authorization'] })

        const phonePeHash = req.headers['authorization'].split(' ')[1];

        const isHashVerified = await verifyPhonePeHash(phonePeHash);

        if (!isHashVerified) {
            return res.status(400).json({
                success: false,
                message: 'Header not verified',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const { event, payload } = req.body;

        // For Handling payment completed(success) case
        if (event === "checkout.order.completed" && payload.state === "COMPLETED") {
            console.log({ payload })

            const { merchantOrderId, orderId } = payload;
            const order = await getOrderByMOId(merchantOrderId);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found',
                    data: null,
                    error: 'NOT_FOUND'
                })
            }

            const { _id, couponCode, userId, items, buyMode } = order

            await updateOrder(_id, { payStatus: 'completed', pgOrderId: orderId })

            if (couponCode) {
                await addUserIdToCoupon(couponCode, userId);
            }

            await decrementProductQty(items);
            if (buyMode === "later") await clearCart(userId);
        }

        return res.status(200).json({
            success: true,
            message: "success",
            data: null,
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