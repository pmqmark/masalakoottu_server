const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, 
    pincodes: [{ type: String, required: true }]
});

const Zone = mongoose.model("Zone", zoneSchema);
module.exports = {Zone};
