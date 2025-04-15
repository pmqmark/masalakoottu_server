const express = require("express");
const reviewCtrl = require("../controllers/review.controller.js");
const { authMiddleware } = require("../middlewares/auth.middleware.js");
const { roleChecker } = require("../middlewares/roleChecker.middleware.js");
const { validate } = require("../middlewares/validate.middleware.js");
const { reviewValidator } = require("../validators/review.validator.js");
const { ownerChecker } = require("../middlewares/ownerChecker.middleware.js");

const reviewRouter = express.Router();

reviewRouter.get('/all', authMiddleware, roleChecker(["admin"]), reviewCtrl.getAllReviewsCtrl);
reviewRouter.get('/many', reviewCtrl.getManyReviewsCtrl);
reviewRouter.get('/:id', reviewCtrl.getReviewByIdCtrl);

reviewRouter.use(authMiddleware)

reviewRouter.post('', reviewValidator.create, validate, (req, res, next) => ownerChecker(req.body.userId), reviewCtrl.createReviewCtrl);
reviewRouter.put('/:id', reviewValidator.update, validate, (req, res, next) => ownerChecker(req.body.userId), reviewCtrl.updateReviewCtrl);
reviewRouter.delete('/:id', reviewCtrl.deleteReviewCtrl);

module.exports = { reviewRouter };