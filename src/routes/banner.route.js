const express = require("express");
const bannerCtrl = require("../controllers/banner.controller.js");
const { authMiddleware } = require("../middlewares/auth.middleware.js");
const { roleChecker } = require("../middlewares/roleChecker.middleware.js");
const { bannerCreateValidator, bannerUpdateValidator } = require("../validators/banner.validator.js");
const { validate } = require("../middlewares/validate.middleware.js");

const bannerRouter = express.Router();

bannerRouter.get('', bannerCtrl.getManyBannersCtrl);
bannerRouter.get('/:id', bannerCtrl.getBannerByIdCtrl);

bannerRouter.use(authMiddleware)
bannerRouter.use(roleChecker(['admin']))

bannerRouter.post('', bannerCreateValidator, validate, bannerCtrl.createBannerCtrl);
bannerRouter.put('/:id', bannerUpdateValidator, validate, bannerCtrl.updateBannerCtrl);
bannerRouter.delete('/:id', bannerCtrl.deleteBannerCtrl);

module.exports = { bannerRouter };