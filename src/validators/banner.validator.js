const { body } = require("express-validator");

const bannerCreateValidator = [
    body("title").optional().isString().withMessage("Title must be a string"),
    body("subtitle").optional().isString().withMessage("Subtitle must be a string"),
    
    body("panel")
        .notEmpty()
        .withMessage("Panel is required")
        .isString()
        .withMessage("Panel must be a string"),
    
    body("index")
        .notEmpty()
        .withMessage("Index is required")
        .isInt({ min: 0 })
        .withMessage("Index must be a non-negative integer"),
    
    body("screenType")
        .notEmpty()
        .withMessage("screenType is required")
        .isIn(["mobile", "desktop"])
        .withMessage("screenType must be 'mobile' or 'desktop'"),
    
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

const bannerUpdateValidator = [
    body("title").optional().isString().withMessage("Title must be a string"),
    body("subtitle").optional().isString().withMessage("Subtitle must be a string"),
    
    body("panel").optional().isString().withMessage("Panel must be a string"),
    
    body("index").optional().isInt({ min: 0 }).withMessage("Index must be a non-negative integer"),
    
    body("screenType")
        .optional()
        .isIn(["mobile", "desktop"])
        .withMessage("screenType must be 'mobile' or 'desktop'"),
    
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

module.exports = { bannerCreateValidator, bannerUpdateValidator };
