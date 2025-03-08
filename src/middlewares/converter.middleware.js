const { createAddress } = require("../services/user.service");

exports.convertAddressesesToIds = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { billAddress, shipAddress } = req.body;

        const billAddressDoc = await createAddress({ ...billAddress, userId })
        const shipAddressDoc = await createAddress({ ...shipAddress, userId })

        req.body.billAddress = billAddressDoc?._id;
        req.body.shipAddress = shipAddressDoc?._id;

        next()
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        })
    }
}