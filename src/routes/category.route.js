const { getAllCategorysCtrl, getCategoryByIdCtrl, createCategoryCtrl, updateCategoryCtrl, updateCategoryStatusCtrl, getManyCategoriesCtrl } = require("../controllers/category.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleChecker } = require("../middlewares/roleChecker.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {categoryValidator} = require("../validators/category.validator")
const categoryRouter = require("express").Router();

categoryRouter.get('/many', getManyCategoriesCtrl)
categoryRouter.get('/:id', getCategoryByIdCtrl)

categoryRouter.use(authMiddleware)

categoryRouter.get('/all', roleChecker(['admin']), getAllCategorysCtrl)

categoryRouter.use(roleChecker(['admin']))
categoryRouter.post('', categoryValidator.create, validate, createCategoryCtrl)
categoryRouter.put('/:id', categoryValidator.update, validate, updateCategoryCtrl)
categoryRouter.patch('/:id', updateCategoryStatusCtrl)

module.exports = { categoryRouter }