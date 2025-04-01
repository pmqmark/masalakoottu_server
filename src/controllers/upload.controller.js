const { upload } = require('../middlewares/storage.middleware');
const endpoint = process.env.DO_SPACES_ENDPOINT;
const Bucket = process.env.DO_SPACES_BUCKET;

module.exports.uploadSingleFile = (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'File upload failed',
                data: null,
                error: err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file provided',
            });
        }

        const file = {
            name: req.file.originalname,
            key: req.file.key,
            location: `${endpoint}/${Bucket}/${req.file.key}`,
            size: req.file.size,
        }

        return res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            data: { file },
            error: null
        });
    });
};

module.exports.uploadMultipleFile = (req, res) => {
    upload.array('files')(req, res, (err) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                success: true,
                message: 'File upload failed',
                data: null,
            });
        }

        if (!req.files) {
            return res.status(400).json({
                error: err.message,
                success: true,
                message: 'No file provided',
                data: null,
            });
        }

        const files = [];
        for (const file of req.files) {
            const temp = {
                name: file.originalname,
                key: file.key,
                location: `${endpoint}/${Bucket}/${file.key}`,
                size: file.size,
            }

            files.push(temp)
        }

        return res.status(200).json({
            success: true,
            message: 'Files uploaded successfully',
            data: { files },
            error: null
        });
    });
};
