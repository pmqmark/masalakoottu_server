const { Zone } = require("../models/zone.model")

module.exports.createZone = async (obj) => {
    return await Zone.create(obj)
}

module.exports.getZoneById = async (id) => {
    return await Zone.findById(id)
}

module.exports.getManyZones = async (filters) => {
    return await Zone.find(filters)
}

module.exports.updateZone = async (id, obj) => {
    return await Zone.findByIdAndUpdate(id, { $set: obj }, { new: true })
}

module.exports.deleteZone = async (id) => {
    return await Zone.findByIdAndDelete(id)
}