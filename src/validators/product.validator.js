const { body } = require("express-validator");

const productValidator = {
  create: [
    body("name").trim().notEmpty().withMessage("Product name is required."),
    body("description").optional().isString(),
    body("brand").optional().isString(),
    body("weight").optional().isNumeric(),
    body("hsn").optional().isString(),
    body("tax").optional().isFloat({ min: 0 }),
    body("price")
      .notEmpty().withMessage("Price is required.")
      .isFloat({ gt: 0 }).withMessage("Price must be greater than 0."),
    body("thumbnail").optional(),
    body("thumbnail.location").optional().notEmpty().withMessage("Thumbnail location is required."),
    body("thumbnail.name").optional().isString(),
    body("thumbnail.key").optional().isString(),
    body("images").isArray().optional(),
    body("images.*.location").optional().notEmpty().withMessage("Each image must have a location."),
    body("images.*.name").optional().isString(),
    body("images.*.key").optional().isString(),
    
    body("reviews").optional().isArray(),
    body("reviews.*.userId").optional().isMongoId(),
    body("reviews.*.rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5."),
    body("reviews.*.comment").optional().isString(),
    body("variations").optional().isArray(),
    body("variations.*.variationId").optional().isMongoId(),
    body("variations.*.options").optional().isArray(),
    body("variations.*.options.*.optionId").optional().isMongoId(),
    body("variations.*.options.*.additionalPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Additional price must be at least 0."),
    body("isFeatured").optional().isBoolean(),
    body("tags").optional().isArray(),
    body("tags.*").optional().isString(),
    body("isArchived").optional().isBoolean(),

    body("batches").optional().isArray(),
    body("batches.*.batchNumber").optional().isString(),
    body("batches.*.quantity").isInt({ min: 0 }).withMessage("Batch quantity must be at least 0"),
    body("batches.*.mfgDate").optional({ values: "falsy" }).isISO8601().toDate().withMessage("Invalid manufacturing date"),
    body("batches.*.expDate").optional({ values: "falsy" }).isISO8601().toDate().withMessage("Invalid expiry date"),
  ],

  update: [
    body("name").optional().trim().notEmpty().withMessage("Product name cannot be empty."),
    body("description").optional().isString(),
    body("brand").optional().isString(),
    body("weight").optional().isNumeric(),
    body("hsn").optional().isString(),
    body("tax").optional().isFloat({ min: 0 }),
    body("price")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0."),
    body("thumbnail").optional(),
    body("thumbnail.location").optional().notEmpty().withMessage("Thumbnail location is required."),
    body("thumbnail.name").optional().isString(),
    body("thumbnail.key").optional().isString(),
    body("images").optional().isArray(),
    body("images.*.location").optional().notEmpty().withMessage("Each image must have a location."),
    body("images.*.name").optional().isString(),
    body("images.*.key").optional().isString(),
    
    body("reviews").optional().isArray(),
    body("reviews.*.userId").optional().isMongoId(),
    body("reviews.*.rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5."),
    body("reviews.*.comment").optional().isString(),
    body("variations").optional().isArray(),
    body("variations.*.variationId").optional().isMongoId(),
    body("variations.*.options").optional().isArray(),
    body("variations.*.options.*.optionId").optional().isMongoId(),
    body("variations.*.options.*.additionalPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Additional price must be at least 0."),
    body("isFeatured").optional().isBoolean(),
    body("tags").optional().isArray(),
    body("tags.*").optional().isString(),
    body("isArchived").optional().isBoolean(),

    body("batches").optional().isArray(),
    body("batches.*.batchNumber").optional().isString(),
    body("batches.*.quantity").isInt({ min: 0 }).withMessage("Batch quantity must be at least 0"),
    body("batches.*.mfgDate").optional({ values: "falsy" }).isISO8601().toDate().withMessage("Invalid manufacturing date"),
    body("batches.*.expDate").optional({ values: "falsy" }).isISO8601().toDate().withMessage("Invalid expiry date"),
  ],
};

module.exports = productValidator;
