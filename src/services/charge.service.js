const { Charge } = require("../models/charge.model")

module.exports.createCharge = async (obj) => {
    return await Charge.create(obj)
}

module.exports.getChargeById = async (id) => {
    return await Charge.findById(id)
}

module.exports.getManyCharges = async (filters) => {
    return await Charge.find(filters)
}

module.exports.updateCharge = async (id, obj) => {
    return await Charge.findByIdAndUpdate(id, { $set: obj }, { new: true })
}

module.exports.deleteCharge = async (id) => {
    return await Charge.findByIdAndDelete(id)
}