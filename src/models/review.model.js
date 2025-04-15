const { Schema, model } = require("mongoose");

const ReviewSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    rating: { type: Number },
    comment: { type: String },

    isArchived: { type: Boolean, default: false }
});

const Review = model('Review', ReviewSchema)

module.exports = { Review }