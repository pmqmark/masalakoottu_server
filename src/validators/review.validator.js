const { body, param } = require('express-validator');

const reviewValidator = {
    create: [
        body('userId')
            .notEmpty().withMessage('User ID is required')
            .isMongoId().withMessage('Invalid User ID'),

        body('productId')
            .notEmpty().withMessage('Product ID is required')
            .isMongoId().withMessage('Invalid Product ID'),

        body('rating')
            .optional()
            .notEmpty().withMessage('Rating is required')
            .isFloat({ min: 1, max: 5 }).withMessage('Rating must be a number between 1 and 5'),

        body('comment')
            .optional()
            .isString().withMessage('Comment must be a string')
            .isLength({ max: 1000 }).withMessage('Comment can be up to 1000 characters long'),
    ],

    update: [
        body('userId')
            .optional()
            .isMongoId().withMessage('Invalid User ID'),

        body('productId')
            .optional()
            .isMongoId().withMessage('Invalid Product ID'),

        body('rating')
            .optional()
            .notEmpty().withMessage('Rating is required')
            .isFloat({ min: 1, max: 5 }).withMessage('Rating must be a number between 1 and 5'),

        body('comment')
            .optional()
            .isString().withMessage('Comment must be a string')
            .isLength({ max: 1000 }).withMessage('Comment can be up to 1000 characters long'),
    ]
}


module.exports = { reviewValidator };
