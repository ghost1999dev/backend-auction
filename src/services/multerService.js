import multer from 'multer'
import multerS3 from 'multer-s3'
import { s3Client } from '../utils/s3Client.js'

const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.docx']

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
    fileFilter: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase()
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`Extensión no permitida. Solo se aceptan: ${allowedExtensions.join(', ')}`), false);
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 20,
    },
}).array('files', 10)

export default uploadDocuments