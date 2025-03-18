const { phonepeWebhookHandler } = require("../controllers/webhook.controller");

const webHookRouter = require("express").Router();

webHookRouter.post("/phonepe", phonepeWebhookHandler)


module.exports = {webHookRouter}