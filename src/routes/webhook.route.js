const { phonepeWebhookHandler, delhiveryWebhookHandler } = require("../controllers/webhook.controller");

const webHookRouter = require("express").Router();

webHookRouter.post("/phonepe", phonepeWebhookHandler)

webHookRouter.post("/delhivery", delhiveryWebhookHandler)


module.exports = { webHookRouter }