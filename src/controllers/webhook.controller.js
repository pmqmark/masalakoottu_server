const { deliveryConfirmation } = require("../services/logistics.service");
const { verifyPhonePeHash, checkoutOrderCompletedHandler,
    checkoutOrderFailedHandler, pgRefundCompletedHandler,
    pgRefundAcceptedHandler,
    pgRefundFailedHandler
} = require("../services/webhook.service");

module.exports.phonepeWebhookHandler = async (req, res) => {
    try {
        console.log({ authHeader: req.headers['authorization'] })

        const phonePeHash = req.headers['authorization'].split(' ')[1];

        const isHashVerified = await verifyPhonePeHash(phonePeHash);

        if (!isHashVerified) {
            throw new Error('Authorization Header doesn\'t match')
        }

        const { event, payload } = req.body;

        console.log({ event, payload })

        // For Handling payment completed(success) case
        if (event === "checkout.order.completed" && payload.state === "COMPLETED") {
            await checkoutOrderCompletedHandler(payload)
        }
        else if (event === "checkout.order.failed" && payload.state === "FAILED") {
            await checkoutOrderFailedHandler(payload)
        }
        else if (event === "pg.refund.accepted" && payload.state === "CONFIRMED") {
            await pgRefundAcceptedHandler(payload)
        }
        else if (event === "pg.refund.completed" && payload.state === "COMPLETED") {
            await pgRefundCompletedHandler(payload)
        }
        else if (event === "pg.refund.failed" && payload.state === "FAILED") {
            await pgRefundFailedHandler(payload)
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


module.exports.delhiveryWebhookHandler = async (req, res) => {
    try {
        const { waybill, status, delivered_on } = req.body;

        if (status === "Delivered") {
            await deliveryConfirmation(waybill, delivered_on)
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