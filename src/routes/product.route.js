const { createProductCtrl, updateProductCtrl, updateProductStatusCtrl, getProductByIdCtrl, getManyProductsCtrl, getAllProductsCtrl, createVariationCtrl, updateVariationCtrl, deleteVariationCtrl, getOneVariationCtrl, createOptionCtrl, updateOptionCtrl, deleteOptionCtrl, getManyVariationCtrl, getManyOptionCtrl, getOneOptionCtrl, bulkAddProductsCtrl } = require("../controllers/product.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleChecker } = require("../middlewares/roleChecker.middleware");
const productValidator = require("../validators/product.validator");
const { validate } = require("../middlewares/validate.middleware");
const { validateCreateOption, validateUpdateOption } = require("../validators/option.validator");
const { validateCreateVariation, validateUpdateVariation } = require("../validators/variation.validator");
const { uploadtoMemory } = require("../middlewares/storage.middleware");

const productRouter = require("express").Router();

productRouter.get('/options', getManyOptionCtrl)
productRouter.get('/options/:optionId', getOneOptionCtrl)

productRouter.get('/variations', getManyVariationCtrl)
productRouter.get('/variations/:variationId', getOneVariationCtrl)

productRouter.get('/all', authMiddleware, roleChecker(['admin']), getAllProductsCtrl)
productRouter.get('/many', getManyProductsCtrl)
productRouter.get('/:id', getProductByIdCtrl)

productRouter.use(authMiddleware)
productRouter.use(roleChecker(['admin']))

productRouter.post('/options', validateCreateOption, validate, createOptionCtrl)
productRouter.put('/options/:optionId', validateUpdateOption, validate, updateOptionCtrl)
productRouter.delete('/options/:optionId', deleteOptionCtrl)

productRouter.post('/variations', validateCreateVariation, validate, createVariationCtrl)
productRouter.put('/variations/:variationId', validateUpdateVariation, validate, updateVariationCtrl)
productRouter.delete('/variations/:variationId', deleteVariationCtrl)

productRouter.post('', productValidator.create, validate, createProductCtrl)
productRouter.put('/:id', productValidator.update, validate, updateProductCtrl)
productRouter.patch('/:id', updateProductStatusCtrl)

productRouter.post('/bulk-insert', uploadtoMemory.single('file'), bulkAddProductsCtrl)

module.exports = { productRouter }