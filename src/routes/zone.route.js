const express = require("express");
const zoneCtrl = require("../controllers/zone.controller.js");
const { authMiddleware } = require("../middlewares/auth.middleware.js");
const { roleChecker } = require("../middlewares/roleChecker.middleware.js");
const { validate } = require("../middlewares/validate.middleware.js");
const { zoneValidator } = require("../validators/zone.validator.js");

const zoneRouter = express.Router();

zoneRouter.get('', zoneCtrl.getManyZonesCtrl);
zoneRouter.get('/:id', zoneCtrl.getZoneByIdCtrl);

zoneRouter.use(authMiddleware)
zoneRouter.use(roleChecker(['admin']))

zoneRouter.post('', zoneValidator.create, validate, zoneCtrl.createZoneCtrl);
zoneRouter.put('/:id', zoneValidator.update, validate, zoneCtrl.updateZoneCtrl);
zoneRouter.delete('/:id', zoneCtrl.deleteZoneCtrl);

module.exports = { zoneRouter };