const { upload } = require('../middlewares/storage.middleware');
const endpoint = process.env.DO_SPACES_ENDPOINT;
const Bucket = process.env.DO_SPACES_BUCKET;

exports.uploadSingleFile = (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(500).json({ msg: 'File upload failed', error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ msg: 'No file provided' });
        }

        const file = {
            name: req.file.originalname,
            key: req.file.key,
            location: `${endpoint}/${Bucket}/${req.file.key}`,
            size: req.file.size,
        }

        return res.status(200).json({
            msg: 'File uploaded successfully',
            file
        });
    });
};

exports.uploadMultipleFile = (req, res) => {
    upload.array('files')(req, res, (err) => {
        if (err) {
            return res.status(500).json({ msg: 'File upload failed', error: err.message });
        }

        if (!req.files) {
            return res.status(400).json({ msg: 'No file provided' });
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
            msg: 'Files uploaded successfully',
            files
        });
    });
};
