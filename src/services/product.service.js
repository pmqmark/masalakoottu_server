const { Product } = require("../models/product.model");
const { Variation } = require("../models/variation.model");
const { Option } = require("../models/Option.model");

exports.createProduct = async (obj = {}) => {
    return await Product.create(obj);
}

exports.getProductById = async (id) => {
    return await Product.findById(id)
    .populate("variations.variationId", "name")
    .populate("variations.options.optionId", "value")
}

exports.getManyProducts = async (filters = {}) => {
    return await Product.find(filters)
    .populate("variations.variationId", "name")
    .populate("variations.options.optionId", "value")
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

exports.decrementProductQty = async (cart) => {
    const productUpdates = cart?.map((item) => {
        const productId = item?.productId;
        const quantity = item?.quantity;

        return Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity } })
    })

    await Promise.all(productUpdates);
}


exports.createVariation = async (obj) => {
    return await Variation.create(obj)
}

exports.getOneVariation = async (id) => {
    return await Variation.findById(id)
    .populate('options', 'value')
}

exports.getManyVariation = async (filters) => {
    return await Variation.find(filters)
    .populate('options', 'value')
}

exports.updateVariation = async (id, obj) => {
    return await Variation.findByIdAndUpdate(id, { $set: obj }, { new: true })
}

exports.deleteVariation = async (id) => {
    return await Variation.findByIdAndDelete(id)
}


exports.createOption = async (obj) => {
    return await Option.create(obj)
}

exports.getOneOption = async (id) => {
    return await Option.findById(id)
}

exports.getManyOption = async (filters) => {
    return await Option.find(filters)
}

exports.updateOption = async (id, obj) => {
    return await Option.findByIdAndUpdate(id, { $set: obj }, { new: true })
}

exports.deleteOption = async (id) => {
    return await Option.findByIdAndDelete(id)
}