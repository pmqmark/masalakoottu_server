const { Schema, model } = require("mongoose");

const optionSchema = new Schema({
    value: { type: String }
})

const Option = model('Option', optionSchema);

module.exports = { Option }