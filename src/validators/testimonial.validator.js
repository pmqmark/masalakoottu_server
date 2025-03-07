const { body } = require("express-validator");

exports.testimonialValidator = [
    body("userId").optional().isMongoId().withMessage("Invalid user id"),
    body("name").optional().isString().withMessage("Name must be a string"),
    body("designation").optional().isString().withMessage("Designation must be a string"),

    body("content")
        .notEmpty()
        .withMessage("Content is required")
        .isString()
        .withMessage("Content must be a string"),

    body("image").optional().isObject().withMessage("Image must be an object"),

    body("image.key")
        .if(body("image").exists())
        .notEmpty()
        .withMessage("Image key is required")
        .isString()
        .withMessage("Image key must be a string"),

    body("image.location")
        .if(body("image").exists())
        .notEmpty()
        .withMessage("Image location is required")
        .isString()
        .withMessage("Image location must be a string"),
];

