const { firebaseController } = require("./FirebaseController");

exports.UploadFile = async (req, res) => {
    try {
        const file = req.file;
        const { filePath } = req.query;

        let path = process.env.UPLOAD_FOLDER_PATH

        if (filePath?.trim()) {
            path = filePath
        }

        const { publicUrl, fileName } = await firebaseController.uploadFileToFirebase(file, path)

        if (typeof publicUrl !== 'string') {
            return res.status(500).json({ msg: 'failed' })
        }

        const image = {
            location: publicUrl,
            name: fileName
        }

        res.status(200).json({ msg: 'success', image })

    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Internal Server Error" })
    }
}

exports.deleteFile = async (req, res) => {
    try {
        const { filename } = req.body;

        if (!filename?.trim()) {
            return res.status(400).json({ msg: 'Invalid filename' })
        }

        await firebaseController.deleteFileFromFirebase(filename)

        res.status(200).json({ msg: 'success' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Internal Server Error" })
    }
}
