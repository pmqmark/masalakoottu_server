const { Category } = require("../models/category.model")

module.exports.createCategory = async(obj)=>{
    return await Category.create(obj);
}

module.exports.getCategoryById = async (id) => {
    return await Category.findById(id)
    .populate("parent")
    .populate("productIds", "name price thumbnail")
}

module.exports.getManyCategories = async (filters = {}) => {
    return await Category.find(filters)
    .populate("parent")
    .populate("productIds", "name price thumbnail")
    .sort({createdAt: -1})
}

module.exports.updateCategory = async (id, obj = {}) => {
    return await Category.findByIdAndUpdate(id, {
        $set: obj
    }, { new: true });
}

module.exports.updateCategoryStatus = async (id, isArchived) => {
    return await Category.findByIdAndUpdate(id, {
        $set: { isArchived }
    }, { new: true });
}