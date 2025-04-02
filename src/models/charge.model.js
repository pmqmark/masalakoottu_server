const { Schema, model } = require("mongoose");
const { chargeKindList, chargeBasisList } = require("../config/data");

const chargeSchema = new Schema({
    kind: { type: String, required: true, enum: chargeKindList },
    basis: { type: String, required: true, enum: chargeBasisList },
    zone: { type: String },
    pincodes: [{ type: String }],
    criteria: [
        {
            type: {
                value: { type: Number },
                minValue: { type: Number },
                maxValue: { type: Number },
                price: { type: Number, required: true }
            }
        }
    ]
});

const Charge = model('Charge', chargeSchema)

module.exports = { Charge }