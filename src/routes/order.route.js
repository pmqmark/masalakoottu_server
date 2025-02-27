const { checkoutCtrl, checkPaymentStatusCtrl, updateOrderCtrl, getOrderCtrl, getMyOrdersCtrl, getManyOrdersCtrl, cancelMyOrderCtrl, returnMyOrderCtrl, getMySingleOrderCtrl } = require('../controllers/order.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleChecker } = require('../middlewares/roleChecker.middleware');
const { validate } = require("../middlewares/validate.middleware");
const { orderValidator } = require('../validators/order.validator');

const orderRouter = require('express').Router();

/* Below defined route is invoked by Phonepe Server */
orderRouter.post('/check-pay-status/:txnId', checkPaymentStatusCtrl)

orderRouter.use(authMiddleware)

orderRouter.use(roleChecker(['user', 'admin']))
orderRouter.post('/checkout', orderValidator.create, validate, checkoutCtrl)
orderRouter.get('/own', getMyOrdersCtrl)
orderRouter.get('/own/:orderId', getMySingleOrderCtrl)
orderRouter.patch('/cancel/:orderId', cancelMyOrderCtrl)
orderRouter.patch('/return/:orderId', returnMyOrderCtrl)

orderRouter.use(roleChecker(['admin']))
orderRouter.put('/:orderId', orderValidator.update, validate, updateOrderCtrl)
orderRouter.get('/many', getManyOrdersCtrl)
orderRouter.get('/:orderId', getOrderCtrl)

module.exports = { orderRouter }