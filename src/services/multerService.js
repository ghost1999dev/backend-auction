import multer from 'multer'
import multerS3 from 'multer-s3'
import { s3Client } from '../utils/s3Client.js'

const uploadDocuments = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.BUCKET_NAME,
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname})
        },
        key: function (req, file, cb) {
            cb(null, `${Date.now()}-${file.originalname}`)
        }
    }),
    limits: {
        fileSize: 1024 * 1024 * 30,
    },
}).array('documents', 10)

export default uploadDocuments