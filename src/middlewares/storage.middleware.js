const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');

const accessKeyId = process.env.DO_SPACES_ACCESS_KEY_ID;
const secretAccessKey = process.env.DO_SPACES_SECRET_ACCESS_KEY;
const endpoint = process.env.DO_SPACES_ENDPOINT;
const region = process.env.DO_SPACES_REGION;
const Bucket = process.env.DO_SPACES_BUCKET;

const s3Client = new S3Client({
    endpoint: endpoint,
    region: region,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    }
})


const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: Bucket,
        key: (req, file, cb) => {
            const uniquePrefix = Date.now().toString() + '-' + Math.round(Math.random() * 1e9)
            cb(null, 'Media/' + `${uniquePrefix}-${file.originalname}`);
        },
        acl: 'public-read',
        contentDisposition: 'inline',

        contentType: (req, file, cb) => {
            let contentType = 'application/octet-stream';

            switch (file.mimetype) {
                case 'image/jpeg':
                    contentType = 'image/jpeg';
                    break;
                case 'image/png':
                    contentType = 'image/png';
                    break;
                case 'application/pdf':
                    contentType = 'application/pdf';
                    break;
                case 'video/mp4':
                    contentType = 'video/mp4';
                    break;
                case 'audio/mpeg':
                    contentType = 'audio/mpeg';
                    break;
                default:
                    contentType = 'application/octet-stream'; 
                    break;
            }

            cb(null, contentType); 
        },
    }),

});


module.exports = { upload, s3Client , Bucket}