const { body } = require("express-validator");

const categoryValidator = {
  create: [
    body("name").trim().notEmpty().withMessage("Category name is required."),
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
