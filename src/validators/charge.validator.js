const { body } = require("express-validator");
const { chargeKindList, chargeBasisList } = require("../config/data");

const allowedFields = ["kind", "basis", "zone", "criteria"];

const chargeValidator = {
  create: [
    body().customSanitizer((value, { req }) => {
      req.body = Object.keys(req.body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => ({ ...obj, [key]: req.body[key] }), {});
      return req.body;
    }),

    body("kind")
      .isString()
      .isIn(chargeKindList)
      .withMessage(`kind must be one of: ${chargeKindList.join(", ")}`),

    body("basis")
      .isString()
      .isIn(chargeBasisList)
      .withMessage(`basis must be one of: ${chargeBasisList.join(", ")}`),

    body("criteria")
      .isArray()
      .withMessage("criteria must be an array"),

    body("criteria.*.value")
      .optional()
      .isNumeric()
      .withMessage("value must be a number if provided"),

    body("criteria.*.minValue")
      .optional()
      .isNumeric()
      .withMessage("minValue must be a number if provided"),

    body("criteria.*.maxValue")
      .optional()
      .isNumeric()
      .withMessage("maxValue must be a number if provided"),

    body("criteria.*.price")
      .isNumeric()
      .withMessage("price is required and must be a number"),
  ],

  update: [
    body().customSanitizer((value, { req }) => {
      req.body = Object.keys(req.body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => ({ ...obj, [key]: req.body[key] }), {});
      return req.body;
    }),

    body("kind")
      .optional()
      .isString()
      .isIn(chargeKindList)
      .withMessage(`kind must be one of: ${chargeKindList.join(", ")}`),

    body("basis")
      .optional()
      .isString()
      .isIn(chargeBasisList)
      .withMessage(`basis must be one of: ${chargeBasisList.join(", ")}`),


    body("criteria")
      .optional()
      .isArray()
      .withMessage("criteria must be an array"),

    body("criteria.*.value")
      .optional()
      .isNumeric()
      .withMessage("value must be a number if provided"),

    body("criteria.*.minValue")
      .optional()
      .isNumeric()
      .withMessage("minValue must be a number if provided"),

    body("criteria.*.maxValue")
      .optional()
      .isNumeric()
      .withMessage("maxValue must be a number if provided"),

    body("criteria.*.price")
      .optional()
      .isNumeric()
      .withMessage("price is required and must be a number"),
  ],
};

module.exports = { chargeValidator };
