const express = require("express");
const chargeCtrl = require("../controllers/charge.controller.js");
const { authMiddleware } = require("../middlewares/auth.middleware.js");
const { roleChecker } = require("../middlewares/roleChecker.middleware.js");
const { validate } = require("../middlewares/validate.middleware.js");
const { chargeValidator } = require("../validators/charge.validator.js");

const chargeRouter = express.Router();

chargeRouter.get('', chargeCtrl.getManyChargesCtrl);
chargeRouter.get('/:id', chargeCtrl.getChargeByIdCtrl);

chargeRouter.use(authMiddleware)
chargeRouter.use(roleChecker(['admin']))

chargeRouter.post('', chargeValidator.create, validate, chargeCtrl.createChargeCtrl);
chargeRouter.put('/:id', chargeValidator.update, validate, chargeCtrl.updateChargeCtrl);
chargeRouter.delete('/:id', chargeCtrl.deleteChargeCtrl);

module.exports = { chargeRouter };