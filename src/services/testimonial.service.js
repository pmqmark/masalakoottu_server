const { Testimonial } = require("../models/testimonial.model")

exports.createTestimonial = async (obj) => {
    return await Testimonial.create(obj)
}

exports.getTestimonialById = async (id) => {
    return await Testimonial.findById(id)
}

exports.getManyTestimonials = async (filters) => {
    return await Testimonial.find(filters)
}

exports.updateTestimonial = async (id, obj) => {
    return await Testimonial.findByIdAndUpdate(id, { $set: obj }, { new: true })
}

exports.deleteTestimonial = async (id) => {
    return await Testimonial.findByIdAndDelete(id)
}