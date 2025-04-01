const { Banner } = require("../models/banner.model")

module.exports.createBanner = async (obj) => {
    return await Banner.create(obj)
}

module.exports.getBannerById = async (id) => {
    return await Banner.findById(id)
}

module.exports.getManyBanners = async (filters) => {
    return await Banner.find(filters)
}

module.exports.updateBanner = async (id, obj) => {
    return await Banner.findByIdAndUpdate(id, { $set: obj }, { new: true })
}

module.exports.deleteBanner = async (id) => {
    return await Banner.findByIdAndDelete(id)
}