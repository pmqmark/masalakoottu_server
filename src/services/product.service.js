const { Product } = require("../models/product.model")

exports.createProduct = async (obj = {}) => {
    return await Product.create(obj);
}

exports.getProductById = async (id) => {
    return await Product.findById(id);
}

exports.getManyProducts = async (filters = {}) => {
    return await Product.find(filters);
}

exports.updateProduct = async (id, obj = {}) => {
    return await Product.findByIdAndUpdate(id, {
        $set: obj
    }, { new: true })
}

exports.updateProductStatus = async (id, isArchived) => {
    return await Product.findByIdAndUpdate(id, {
        $set: { isArchived }
    }, { new: true })
}