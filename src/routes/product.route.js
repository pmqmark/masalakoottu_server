const { createProductCtrl, updateProductCtrl, updateProductStatusCtrl, getProductByIdCtrl, getManyProductsCtrl, getAllProductsCtrl, createVariationCtrl, updateVariationCtrl, deleteVariationCtrl, getOneVariationCtrl, createOptionCtrl, updateOptionCtrl, deleteOptionCtrl, getManyVariationCtrl, getManyOptionCtrl, getOneOptionCtrl } = require("../controllers/product.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleChecker } = require("../middlewares/roleChecker.middleware");
const productValidator = require("../validators/product.validator");
const { validate } = require("../middlewares/validate.middleware");

const productRouter = require("express").Router();

productRouter.use(authMiddleware)

productRouter.get('/all', roleChecker(['admin']), getAllProductsCtrl)

productRouter.get('/options', getManyOptionCtrl)
productRouter.get('/options/:optionId', getOneOptionCtrl)

productRouter.get('/variations', getManyVariationCtrl)
productRouter.get('/variations/:variationId', getOneVariationCtrl)

productRouter.get('/many', getManyProductsCtrl)
productRouter.get('/:id', getProductByIdCtrl)

productRouter.use(roleChecker(['admin']))

productRouter.post('/options', createOptionCtrl)
productRouter.put('/options/:optionId', updateOptionCtrl)
productRouter.delete('/options/:optionId', deleteOptionCtrl)

productRouter.post('/variations', createVariationCtrl)
productRouter.put('/variations/:variationId', updateVariationCtrl)
productRouter.delete('/variations/:variationId', deleteVariationCtrl)

productRouter.post('', productValidator.create, validate, createProductCtrl)
productRouter.put('/:id', productValidator.update, validate, updateProductCtrl)
productRouter.patch('/:id', updateProductStatusCtrl)

module.exports = { productRouter }