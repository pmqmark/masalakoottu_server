const { calculateCouponCtrl} = require('../controllers/order.controller');

const orderRouter = require('express').Router();

orderRouter.post("/coupon", calculateCouponCtrl)

module.exports = {orderRouter}