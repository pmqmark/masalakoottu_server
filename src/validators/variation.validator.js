const { body, param } = require('express-validator');
const { isValidObjectId } = require('mongoose');

module.exports.validateCreateVariation = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string')
        .trim(),

    body('options')
        .optional()
        .isArray().withMessage('Options must be an array'),

    body('options.*')
        .optional()
        .custom((value) => isValidObjectId(value))
        .withMessage('Each option must be a valid ObjectId'),
];

module.exports.validateUpdateVariation = [
    param('variationId')
        .custom((value) => isValidObjectId(value))
        .withMessage('Invalid Variation ID'),

    body('name')
        .optional()
        .isString().withMessage('Name must be a string')
        .trim(),

    body('options')
        .optional()
        .isArray().withMessage('Options must be an array'),

    body('options.*')
        .optional()
        .custom((value) => isValidObjectId(value))
        .withMessage('Each option must be a valid ObjectId'),
];
