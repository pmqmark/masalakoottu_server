const { checkoutCtrl, updateOrderCtrl, getOrderCtrl, getMyOrdersCtrl,
    getAllOrdersCtrl, cancelMyOrderCtrl, returnMyOrderCtrl,
    getMySingleOrderCtrl, checkOrderPayStatusCtrl,
    refundRequestToPGCtrl,
    getRefundStatusCtrl } = require('../controllers/order.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleChecker } = require('../middlewares/roleChecker.middleware');
const { validate } = require("../middlewares/validate.middleware");
const { orderValidator } = require('../validators/order.validator');

const orderRouter = require('express').Router();


orderRouter.use(authMiddleware)

orderRouter.use(roleChecker(['user', 'admin']))

// Below route involves call to Phonepe server
orderRouter.post('/checkout', orderValidator.create, validate, checkoutCtrl)

orderRouter.get('/own', getMyOrdersCtrl)
orderRouter.get('/own/:orderId', getMySingleOrderCtrl)
orderRouter.patch('/cancel/:orderId', cancelMyOrderCtrl)
orderRouter.patch('/return/:orderId', returnMyOrderCtrl)

orderRouter.use(roleChecker(['admin']))


// Below route involves call to Phonepe server
orderRouter.post('/refund', refundRequestToPGCtrl)
orderRouter.get('/refund-status/:merchantRefundId', getRefundStatusCtrl)
orderRouter.get('/pay-status/:orderId', checkOrderPayStatusCtrl)

orderRouter.put('/:orderId', orderValidator.update, validate, updateOrderCtrl)
orderRouter.get('/all', getAllOrdersCtrl)
orderRouter.get('/:orderId', getOrderCtrl)

module.exports = { orderRouter }