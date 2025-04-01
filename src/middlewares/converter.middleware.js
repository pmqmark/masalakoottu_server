const { fetchOneAddress } = require("../services/user.service");

module.exports.addBillnShipAddress = async (req, res, next) => {
    try {
        const { userId } = req.user;

        const address = await fetchOneAddress({ userId })

        if (address) {
            req.body.billAddress = address?._id;
            req.body.shipAddress = address?._id;
        }

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