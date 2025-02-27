const { body } = require('express-validator');
const { enquiryTypeList } = require('../config/data')

const validatePostEnquiry = [
    body('type')
        .optional()
        .isIn(enquiryTypeList).withMessage('Invalid enquiry type'),

    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string')
        .trim(),

    body('email')
        .optional()
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('mobile')
        .optional()
        .isString().withMessage('Mobile number must be a string')
        .matches(/^\d{10}$/).withMessage('Mobile number must be a 10-digit number'),

    body('subject')
        .optional()
        .isString().withMessage('Subject must be a string')
        .trim(),

    body('message')
        .optional()
        .isString().withMessage('Message must be a string')
        .trim(),
];

module.exports = { validatePostEnquiry }