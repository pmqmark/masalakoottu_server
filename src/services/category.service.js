const { Category } = require("../models/category.model")

exports.createCategory = async(obj)=>{
    return await Category.create(obj);
}

exports.getCategoryById = async (id) => {
    return await Category.findById(id);
}

exports.getManyCategories = async (filters = {}) => {
    return await Category.find(filters);
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