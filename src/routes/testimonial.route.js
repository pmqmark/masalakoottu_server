const express = require("express");
const testimonialCtrl = require("../controllers/testimonial.controller.js");
const { authMiddleware } = require("../middlewares/auth.middleware.js");
const { roleChecker } = require("../middlewares/roleChecker.middleware.js");
const { testimonialValidator } = require("../validators/testimonial.validator.js");
const { validate } = require("../middlewares/validate.middleware.js");

const testimonialRouter = express.Router();

testimonialRouter.get('', testimonialCtrl.getManyTestimonialsCtrl);
testimonialRouter.get('/:id', testimonialCtrl.getTestimonialByIdCtrl);

testimonialRouter.use(authMiddleware)
testimonialRouter.use(roleChecker(['admin']))

testimonialRouter.post('', testimonialValidator, validate, testimonialCtrl.createTestimonialCtrl);
testimonialRouter.put('/:id', testimonialValidator, validate, testimonialCtrl.updateTestimonialCtrl);
testimonialRouter.delete('/:id', testimonialCtrl.deleteTestimonialCtrl);

module.exports = { testimonialRouter };