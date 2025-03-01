const { body } = require("express-validator");
const { credTypeList, genderList, roleList } = require("../config/data");

const userValidator = {
  create: [
    body("credType")
      .isIn(credTypeList)
      .withMessage("credType must be one of 'email', 'mobile', or 'googleId'."),
    body("googleId")
      .optional()
      .isString()
      .withMessage("Google ID must be a string."),
    body("firstName").trim().notEmpty().withMessage("First name is required."),
    body("lastName").optional().trim().isString(),
    body("gender")
      .optional()
      .isIn(genderList)
      .withMessage("Gender must be 'male', 'female', or 'other'."),
    body("email")
      .if(body("credType").equals("email"))
      .notEmpty()
      .withMessage("Email is required when credType is 'email'.")
      .isEmail()
      .withMessage("Invalid email format."),
    body("mobile")
      .if(body("credType").equals("mobile"))
      .notEmpty()
      .withMessage("Mobile number is required when credType is 'mobile'.")
      .isMobilePhone()
      .withMessage("Invalid mobile number."),
    body("password")
      .optional()
      .notEmpty()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
      
    body("addresses").optional().isArray(),
    body("addresses.*").optional().isMongoId().withMessage("Invalid address ID."),
    body("wishlist").optional().isArray(),
    body("wishlist.*").optional().isMongoId().withMessage("Invalid product ID."),
    body("cart").optional().isArray(),
    body("cart.*.productId")
      .optional()
      .isMongoId()
      .withMessage("Invalid product ID."),
    body("cart.*.quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1."),
    body("cart.*.variations").optional().isArray(),
    body("cart.*.variations.*.variationId")
      .optional()
      .isMongoId()
      .withMessage("Invalid variation ID."),
    body("cart.*.variations.*.optionId")
      .optional()
      .isMongoId()
      .withMessage("Invalid option ID."),
    body("cart.*.variations.*.additionalPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Additional price must be a positive number."),
    body("orderHistory").optional().isArray(),
    body("orderHistory.*").optional().isMongoId().withMessage("Invalid order ID."),
    body("role")
      .optional()
      .isIn(roleList)
      .withMessage("Role must be either 'user' or 'admin'."),
    body("isBlocked").optional().isBoolean(),
  ],

  update: [
    body("credType")
      .optional()
      .isIn(credTypeList)
      .withMessage("credType must be one of 'email', 'mobile', or 'googleId'."),
    body("googleId").optional().isString(),
    body("firstName").optional().trim().notEmpty().withMessage("First name cannot be empty."),
    body("lastName").optional().trim().isString(),
    body("gender")
      .optional()
      .isIn(genderList)
      .withMessage("Gender must be 'male', 'female', or 'other'."),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Invalid email format."),
    body("mobile")
      .optional()
      .isMobilePhone()
      .withMessage("Invalid mobile number."),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
    body("addresses").optional().isArray(),
    body("addresses.*").optional().isMongoId().withMessage("Invalid address ID."),
    body("wishlist").optional().isArray(),
    body("wishlist.*").optional().isMongoId().withMessage("Invalid product ID."),
    body("cart").optional().isArray(),
    body("cart.*.productId")
      .optional()
      .isMongoId()
      .withMessage("Invalid product ID."),
    body("cart.*.quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1."),
    body("cart.*.variations").optional().isArray(),
    body("cart.*.variations.*.variationId")
      .optional()
      .isMongoId()
      .withMessage("Invalid variation ID."),
    body("cart.*.variations.*.optionId")
      .optional()
      .isMongoId()
      .withMessage("Invalid option ID."),
    body("cart.*.variations.*.additionalPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Additional price must be a positive number."),
    body("orderHistory").optional().isArray(),
    body("orderHistory.*").optional().isMongoId().withMessage("Invalid order ID."),
    body("role")
      .optional()
      .isIn(roleList)
      .withMessage("Role must be either 'user' or 'admin'."),
    body("isBlocked").optional().isBoolean(),
  ],
};

module.exports = { userValidator };
