const { getAllCategorysCtrl, getCategoryByIdCtrl, createCategoryCtrl, updateCategoryCtrl, updateCategoryStatusCtrl, getManyCategoriesCtrl } = require("../controllers/category.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleChecker } = require("../middlewares/roleChecker.middleware");
const validateCategory = require("../validators/category.validator");

const categoryRouter = require("express").Router();

categoryRouter.use(authMiddleware)

categoryRouter.get('/all', roleChecker(['admin']), getAllCategorysCtrl)
categoryRouter.get('/many', getManyCategoriesCtrl)
categoryRouter.get('/:id', getCategoryByIdCtrl)

categoryRouter.use(roleChecker(['admin']))
categoryRouter.post('', validateCategory, createCategoryCtrl)
categoryRouter.put('/:id', validateCategory, updateCategoryCtrl)
categoryRouter.patch('/:id', updateCategoryStatusCtrl)

module.exports = { categoryRouter }