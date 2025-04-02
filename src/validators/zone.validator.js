const { body } = require("express-validator");

const allowedFields = ["name", "pincodes"];

const zoneValidator = {
  create: [

    body().customSanitizer((value,{ req }) => {
      req.body = Object.keys(req.body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => ({ ...obj, [key]: req.body[key] }), {});
      return req.body;
    }),

    body("name")
      .isString()
      .withMessage("zone must be a string"),

    body("pincodes")
      .optional()
      .isArray()
      .withMessage("pincodes must be an array of strings"),

    body("pincodes.*")
      .isString()
      .withMessage("Each pincode must be a string"),
  ],

  update: [

    body().customSanitizer((value,{ req }) => {
      req.body = Object.keys(req.body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => ({ ...obj, [key]: req.body[key] }), {});
      return req.body;
    }),

    body("name")
      .optional()
      .isString()
      .withMessage("zone must be a string"),

    body("pincodes")
      .optional()
      .isArray()
      .withMessage("pincodes must be an array of strings"),

    body("pincodes.*")
      .isString()
      .withMessage("Each pincode must be a string"),
  ],
};

module.exports = { zoneValidator };
