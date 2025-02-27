const { body } = require('express-validator');

const couponValidator = {
    create: [
        body('code')
            .notEmpty().withMessage('Coupon code is required')
            .isString().withMessage('Coupon code must be a string')
            .trim(),

        body('value')
            .notEmpty().withMessage('Discount value is required')
            .isNumeric().withMessage('Discount value must be a number')
            .isFloat({ min: 0 }).withMessage('Discount value must be a positive number'),

        body('expiryDate')
            .notEmpty().withMessage('Expiry date is required')
            .isISO8601().toDate().withMessage('Expiry date must be a valid date'),

        body('maxValue')
            .optional()
            .isNumeric().withMessage('Max value must be a number')
            .isFloat({ min: 0 }).withMessage('Max value must be a positive number'),

        body('minValue')
            .optional()
            .isNumeric().withMessage('Min value must be a number')
            .isFloat({ min: 0 }).withMessage('Min value must be a positive number'),

        body('isAvailable')
            .optional()
            .isBoolean().withMessage('isAvailable must be a boolean'),
    ],


    update: [
        body('userList')
            .optional()
            .isArray().withMessage('User list must be an array')
            .custom((userList) => {
                if (!userList.every(user => typeof user === 'string')) {
                    throw new Error('All userList entries must be strings');
                }
                return true;
            }),

        body('code')
            .optional()
            .notEmpty().withMessage('Coupon code is required')
            .isString().withMessage('Coupon code must be a string')
            .trim(),

        body('value')
            .optional()
            .notEmpty().withMessage('Discount value is required')
            .isNumeric().withMessage('Discount value must be a number')
            .isFloat({ min: 0 }).withMessage('Discount value must be a positive number'),

        body('expiryDate')
            .optional()
            .notEmpty().withMessage('Expiry date is required')
            .isISO8601().toDate().withMessage('Expiry date must be a valid date'),

        body('maxValue')
            .optional()
            .isNumeric().withMessage('Max value must be a number')
            .isFloat({ min: 0 }).withMessage('Max value must be a positive number'),

        body('minValue')
            .optional()
            .isNumeric().withMessage('Min value must be a number')
            .isFloat({ min: 0 }).withMessage('Min value must be a positive number'),

        body('isAvailable')
            .optional()
            .isBoolean().withMessage('isAvailable must be a boolean'),
    ],
};

module.exports = { couponValidator }