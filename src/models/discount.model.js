const mongoose = require("mongoose");
const { discountTypeList } = require("../config/data");

const discountSchema = new mongoose.Schema({
    code: { type: String, unique: true, sparse: true },
    description: { type: String },
    discountType: { type: String, enum: discountTypeList, required: true },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    appliesAutomatically: { type: Boolean, default: false },
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],

    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const Discount = mongoose.model("Discount", discountSchema);
module.exports = { Discount }