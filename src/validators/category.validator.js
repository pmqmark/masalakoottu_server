const { body, validationResult } = require('express-validator');

const validateCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Category name must be between 3 and 50 characters'),

  body('offerValue')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Offer value must be a number between 0 and 100'),

  body('maxValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max value must be a non-negative number'),

  body('minValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min value must be a non-negative number'),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('isArchived')
    .optional()
    .isBoolean()
    .withMessage('isArchived must be a boolean value'),

  body('image.name')
    .optional()
    .isString()
    .withMessage('Image name must be a string'),
  body('image.key')
    .optional()
    .isString()
    .withMessage('Image key must be a string'),
  body('image.location')
    .optional()
    .isString()
    .withMessage('Image location must be a string'),

  body('productIds')
    .optional()
    .isArray()
    .withMessage('productIds must be an array'),
  body('productIds.*')
    .optional()
    .isMongoId()
    .withMessage('Each product ID must be a valid MongoDB ObjectId'),

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

module.exports = validateCategory;