const { admin } = require('../utils/firebaseAdmin.util');
const { Readable } = require('stream');
const sharp = require('sharp');


exports.uploadFileToFirebase = async (file, folderPath) => {
    const storageRef = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET);

    console.log(storageRef.name);

    try {
        let buffer;

        // Check if the file is PNG, process accordingly
        if (['image/png', 'image/jpeg', 'image/webp', 'image/avif'].includes(file.mimetype)) {
            if (file.mimetype === 'image/png') {
                buffer = await sharp(file.buffer)
                    .resize({ width: 800 })
                    .png({ quality: 80 })
                    .toBuffer();
            }
            else {
                // For non-PNG images (e.g., JPEG)
                buffer = await sharp(file.buffer)
                    .resize({ width: 800 })
                    .jpeg({ quality: 80 })
                    .toBuffer();
            }
        }
        else {
            buffer = file.buffer
        }

        const uniqueName = `${Date.now()}-${file.originalname}`;

        const fileUpload = storageRef.file(`${folderPath}/${uniqueName}`);

        const writeStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });

        const fileStream = Readable.from(buffer);

        return new Promise((resolve, reject) => {
            fileStream
                .pipe(writeStream)
                .on('error', (err) => {
                    console.log('Error uploading file: ', err);
                    reject(err);
                })
                .on('finish', async () => {
                    try {
                        await fileUpload.makePublic();
                        const publicUrl = `https://storage.googleapis.com/${storageRef.name}/${fileUpload.name}`;
                        resolve({ publicUrl, fileName: fileUpload.name });
                    } catch (error) {
                        reject(error);
                    }
                });
        });
    } catch (err) {
        console.log('Error processing image:', err);
        throw err;
    }
};


exports.deleteFileFromFirebase = async (filePath) => {
    const storageRef = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET);
    const file = storageRef.file(filePath);

    return new Promise((resolve, reject) => {
        file.delete()
            .then(() => {
                resolve();
            })
            .catch((err) => {
                console.log('Error deleting file: ', err);
                reject(err);
            });
    });
};


exports.uploadMultipleFiles = async (files, folderPath) => {
    const storageRef = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET);
    console.log(storageRef.name);

    const uploadSingleFile = async (file) => {
        try {
            let buffer;

            // Check if the file is PNG, process accordingly
            if (['image/png', 'image/jpeg', 'image/webp', 'image/avif'].includes(file.mimetype)) {
                if (file.mimetype === 'image/png') {
                    buffer = await sharp(file.buffer)
                        .resize({ width: 800 })
                        .png({ quality: 80 })
                        .toBuffer();
                  }
                else {
                    // For non-PNG images (e.g., JPEG)
                    buffer = await sharp(file.buffer)
                        .resize({ width: 800 })
                        .jpeg({ quality: 80 })
                        .toBuffer();
                }
            }
            else {
                buffer = file.buffer
            }

            const uniqueName = `${Date.now()}-${file.originalname}`;

            const fileUpload = storageRef.file(`${folderPath}/${uniqueName}`);

            const writeStream = fileUpload.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                },
            });

            const fileStream = Readable.from(buffer);

            return new Promise((resolve, reject) => {
                fileStream
                    .pipe(writeStream)
                    .on('error', (err) => {
                        console.log('Error uploading file: ', err);
                        reject(err);
                    })
                    .on('finish', async () => {
                        try {
                            await fileUpload.makePublic();
                            const publicUrl = `https://storage.googleapis.com/${storageRef.name}/${fileUpload.name}`;
                            resolve({ publicUrl, fileName: fileUpload.name });
                        } catch (error) {
                            reject(error);
                        }
                    });
            });
        } catch (err) {
            console.log('Error processing image:', err);
            throw err;
        }
    };

    const uploadPromises = files.map(file => uploadSingleFile(file));

    return Promise.all(uploadPromises);
};



exports.deleteMultipleFiles = async (filePaths) => {
    const storageRef = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET);

    const deletePromises = filePaths.map((filePath) => {
        const file = storageRef.file(filePath);

        return new Promise((resolve, reject) => {
            file.delete()
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    console.log('Error deleting file: ', err);
                    reject(err);
                });
        });
    });

    return Promise.all(deletePromises);
};
