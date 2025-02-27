const { postEnquiryCtrl, getManyEnquiryCtrl, getEnquiryByIdCtrl, deleteEnquiryCtrl } = require("../controllers/enquiry.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleChecker } = require("../middlewares/roleChecker.middleware");
const { validate } = require("../middlewares/validate.middleware");

const enquiryRouter = require("express").Router();

enquiryRouter.post('', postEnquiryCtrl)

enquiryRouter.use(authMiddleware)
enquiryRouter.use(roleChecker(['admin']))

enquiryRouter.get('', getManyEnquiryCtrl)
enquiryRouter.get('/:id', getEnquiryByIdCtrl)
enquiryRouter.delete('/:id', deleteEnquiryCtrl)

module.exports = { enquiryRouter }