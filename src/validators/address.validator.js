const { body, param } = require('express-validator');
const { isValidObjectId } = require('mongoose');

exports.validateCreateAddress = [
    body('fullName')
        .notEmpty().withMessage('Full name is required')
        .isString().withMessage('Full name must be a string')
        .trim(),

    body('street')
        .optional()
        .isString().withMessage('Street must be a string')
        .trim(),

    body('city')
        .optional()
        .isString().withMessage('City must be a string')
        .trim(),

    body('state')
        .optional()
        .isString().withMessage('State must be a string')
        .trim(),

    body('pincode')
        .notEmpty().withMessage('Pincode is required')
        .matches(/^\d{6}$/).withMessage('Pincode must be a 6-digit number'),

    body('country')
        .optional()
        .isString().withMessage('Country must be a string')
        .trim(),

    body('phoneNumber')
        .notEmpty().withMessage('Phone number is required')
        .matches(/^\d{10}$/).withMessage('Phone number must be a 10-digit number'),
];

exports.validateUpdateAddress = [
    
    param('id')
        .custom((value) => isValidObjectId(value))
        .withMessage('Invalid address ID'),

    body('fullName')
        .optional()
        .isString().withMessage('Full name must be a string')
        .trim(),

    body('street')
        .optional()
        .isString().withMessage('Street must be a string')
        .trim(),

    body('city')
        .optional()
        .isString().withMessage('City must be a string')
        .trim(),

    body('state')
        .optional()
        .isString().withMessage('State must be a string')
        .trim(),

    body('pincode')
        .optional()
        .matches(/^\d{6}$/).withMessage('Pincode must be a 6-digit number'),

    body('country')
        .optional()
        .isString().withMessage('Country must be a string')
        .trim(),

    body('phoneNumber')
        .optional()
        .matches(/^\d{10}$/).withMessage('Phone number must be a 10-digit number'),
];
