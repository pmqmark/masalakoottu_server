const { Testimonial } = require("../models/testimonial.model")

module.exports.createTestimonial = async (obj) => {
    return await Testimonial.create(obj)
}

module.exports.getTestimonialById = async (id) => {
    return await Testimonial.findById(id)
    .populate("userId", "firstName lastName")

}

module.exports.getManyTestimonials = async (filters) => {
    return await Testimonial.find(filters)
    .populate("userId", "firstName lastName")
    
}

module.exports.updateTestimonial = async (id, obj) => {
    return await Testimonial.findByIdAndUpdate(id, { $set: obj }, { new: true })
}

module.exports.deleteTestimonial = async (id) => {
    return await Testimonial.findByIdAndDelete(id)
}