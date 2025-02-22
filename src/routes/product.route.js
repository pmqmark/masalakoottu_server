const { createProductCtrl, updateProductCtrl, updateProductStatusCtrl, getProductByIdCtrl, getManyProductsCtrl, getAllProductsCtrl } = require("../controllers/product.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleChecker } = require("../middlewares/roleChecker.middleware");
const validateProduct = require("../validators/product.validator");

const productRouter = require("express").Router();

productRouter.use(authMiddleware)

productRouter.get('/all', roleChecker(['admin']), getAllProductsCtrl)
productRouter.get('/many', getManyProductsCtrl)
productRouter.get('/:id', getProductByIdCtrl)

productRouter.use(roleChecker(['admin']))
productRouter.post('', validateProduct, createProductCtrl)
productRouter.put('/:id', validateProduct, updateProductCtrl)
productRouter.patch('/:id', updateProductStatusCtrl)

module.exports = { productRouter }