const { Banner } = require("../models/banner.model")

exports.createBanner = async (obj) => {
    return await Banner.create(obj)
}

exports.getBannerById = async (id) => {
    return await Banner.findById(id)
}

exports.getManyBanners = async (filters) => {
    return await Banner.find(filters)
}

exports.updateBanner = async (id, obj) => {
    return await Banner.findByIdAndUpdate(id, { $set: obj }, { new: true })
}

exports.deleteBanner = async (id) => {
    return await Banner.findByIdAndDelete(id)
}