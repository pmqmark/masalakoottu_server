const { Category } = require("../models/category.model")

exports.createCategory = async(obj)=>{
    return await Category.create(obj);
}

exports.getCategoryById = async (id) => {
    return await Category.findById(id)
    .populate("parent")
    .populate("productIds", "name price thumbnail")
}

exports.getManyCategories = async (filters = {}) => {
    return await Category.find(filters)
    .populate("parent")
    .populate("productIds", "name price thumbnail")
    .sort({createdAt: -1})
}

exports.updateCategory = async (id, obj = {}) => {
    return await Category.findByIdAndUpdate(id, {
        $set: obj
    }, { new: true });
}

exports.updateCategoryStatus = async (id, isArchived) => {
    return await Category.findByIdAndUpdate(id, {
        $set: { isArchived }
    }, { new: true });
}