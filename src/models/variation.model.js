const { Schema, model } = require("mongoose");

const variationSchema = new Schema({
    name: { type: String, trim: true, unique: true },
    options: [{ type: Schema.Types.ObjectId, ref:'Option' }]
})

const Variation = model('Variation', variationSchema)

module.exports = { Variation }