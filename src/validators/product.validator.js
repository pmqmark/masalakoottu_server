const { body, validationResult } = require('express-validator');

const validateProduct = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Product name is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Product name must be between 3 and 100 characters'),

    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),

    body('brand')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Brand name cannot exceed 50 characters'),

    body('price')
        .isNumeric()
        .withMessage('Price must be a number')
        .isFloat({ min: 0 })
        .withMessage('Price cannot be negative'),

    body('discount')
        .optional()
        .isNumeric()
        .withMessage('Discount must be a number')
        .isFloat({ min: 0, max: 100 })
        .withMessage('Discount must be between 0 and 100'),

    body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Stock cannot be negative'),

    body('images.*.location')
        .notEmpty()
        .withMessage('Image location is required'),

    body('reviews.*.rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('reviews.*.comment')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Comment cannot exceed 500 characters'),

    body('variations.*.name')
        .notEmpty()
        .withMessage('Variation name is required'),
    body('variations.*.options.*.value')
        .notEmpty()
        .withMessage('Option value is required'),
    body('variations.*.options.*.additionalPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Additional price cannot be negative'),

    body('tags.*')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Tag cannot exceed 50 characters'),

    body('isFeatured')
        .optional()
        .isBoolean()
        .withMessage('isFeatured must be a boolean value'),

    body('isArchived')
        .optional()
        .isBoolean()
        .withMessage('isArchived must be a boolean value'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'failed',
                data: null,
                error: errors.array().join(',')
            });
        }
        next();
    },
];

module.exports = validateProduct;