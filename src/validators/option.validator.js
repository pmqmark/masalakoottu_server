const { body, param } = require('express-validator');
const { isValidObjectId } = require('mongoose');

exports.validateCreateOption = [
    body('value')
        .notEmpty().withMessage('Value is required')
        .isString().withMessage('Value must be a string')
        .trim(),
];

exports.validateUpdateOption = [
    param('optionId')
        .custom((value) => isValidObjectId(value))
        .withMessage('Invalid Option ID'),

    body('value')
        .optional()
        .isString().withMessage('Value must be a string')
        .trim(),
];
