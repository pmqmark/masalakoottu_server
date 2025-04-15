const { Review } = require("../models/review.model")

module.exports.createReview = async (obj) => {
    return await Review.create(obj)
}

module.exports.getReviewById = async (id) => {
    return await Review.findById(id)
        .populate('userId', 'name email')
        .populate('productId', 'name')
}

module.exports.getManyReviews = async (filters) => {
    return await Review.find(filters)
        .populate('userId', 'name email')
        .populate('productId', 'name')
}

module.exports.updateReview = async (id, obj) => {
    return await Review.findByIdAndUpdate(id, { $set: obj }, { new: true })
}

module.exports.deleteReview = async (id) => {
    return await Review.findByIdAndDelete(id)
}