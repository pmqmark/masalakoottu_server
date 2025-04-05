const { isValidObjectId } = require("mongoose");
const { createZone, updateZone, getZoneById, getManyZones, deleteZone } = require("../services/zone.service");

module.exports.createZoneCtrl = async (req, res) => {
    try {
        const createObj = req.body;

        const zone = await createZone(createObj);

        if (!zone) {
            throw new Error('Failed')
        }

        return res.status(201).json({
            success: true,
            message: 'success',
            data: {result: zone },
            error: null
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

module.exports.getZoneByIdCtrl = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const zone = await getZoneById(id)

        if (!zone) {
            throw new Error('FAILED')
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { result : zone},
            error: null
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

module.exports.getManyZonesCtrl = async (req, res, next) => {
    try {
        let { page, entries } = req.query;
        page = parseInt(page);
        entries = parseInt(entries)
        const { search} = req.query;

        const filters = {};

        if (search?.trim()) {
            filters.$or = [
                { name: new RegExp(search, 'i') },
            ]
        }


        let result = await getManyZones(filters)
        console.log({ result })

        if (page && entries) {
            result = result.slice((page - 1) * entries, page * entries)
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { result },
            error: null
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}


module.exports.updateZoneCtrl = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const zone = await getZoneById(id)

        if (!zone) {
            return res.status(400).json({
                success: false,
                message: 'Not Found',
                data: null,
                error: 'NOT_FOUND'
            })
        }

        if (zone?.name === "default") {
            return res.status(400).json({
                success: false,
                message: 'Default zone cannot be updated',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const updateObj = req.body;

        const updatedZone = await updateZone(id, updateObj)

        if (!updatedZone) {
            throw new Error('FAILED')
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { result: updatedZone },
            error: null
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

module.exports.deleteZoneCtrl = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const zone = await deleteZone(id)

        if (!zone) {
            throw new Error('FAILED')
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: null,
            error: null
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}