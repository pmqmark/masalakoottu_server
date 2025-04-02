const { body } = require("express-validator");
const { default: mongoose } = require("mongoose");
const { chargeKindList, chargeBasisList } = require("../config/data");

const chargeValidator = {
  create: [
    body("kind")
      .isString()
      .isIn(chargeKindList)
      .withMessage(`kind must be one of: ${chargeKindList.join(", ")}`),

    body("basis")
      .isString()
      .isIn(chargeBasisList)
      .withMessage(`basis must be one of: ${chargeBasisList.join(", ")}`),

    body("zone")
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

    body("criteria")
      .isArray({ min: 1 })
      .withMessage("criteria must be an array with at least one entry"),

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

    body("zone")
      .optional()
      .isString()
      .withMessage("zone must be a string"),

    body("pincodes")
      .optional()
      .isArray()
      .withMessage("pincodes must be an array of strings"),

    body("pincodes.*")
      .optional()
      .isString()
      .withMessage("Each pincode must be a string"),

    body("criteria")
      .optional()
      .isArray({ min: 1 })
      .withMessage("criteria must be an array with at least one entry"),

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
