const { body } = require("express-validator");

const categoryValidator = {
  create: [
    body("name").trim().notEmpty().withMessage("Category name is required."),
    body("offerValue")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Offer value must be between 0 and 100."),
    body("maxValue")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Max value must be a positive number."),
    body("minValue")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Min value must be a positive number."),
    body("description").optional().isString(),
    body("isArchived").optional().isBoolean(),
    body("image").optional(),
    body("image.name").optional().isString(),
    body("image.key").optional().isString(),
    body("image.location").optional().isString(),
    body("productIds").optional().isArray(),
    body("productIds.*").optional().isMongoId().withMessage("Invalid product ID."),
  ],

  update: [
    body("name").optional().trim().notEmpty().withMessage("Category name cannot be empty."),
    body("offerValue")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Offer value must be between 0 and 100."),
    body("maxValue")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Max value must be a positive number."),
    body("minValue")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Min value must be a positive number."),
    body("description").optional().isString(),
    body("isArchived").optional().isBoolean(),
    body("image").optional(),
    body("image.name").optional().isString(),
    body("image.key").optional().isString(),
    body("image.location").optional().isString(),
    body("productIds").optional().isArray(),
    body("productIds.*").optional().isMongoId().withMessage("Invalid product ID."),
  ],
};

module.exports = { categoryValidator };
