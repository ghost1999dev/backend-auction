import multer from 'multer'
import multerS3 from 'multer-s3'
import { s3Client } from '../utils/s3Client.js'
import path from 'path'

const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.docx']

const uploadDocuments = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}${ext}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Solo se permiten estos formatos: ${allowedExtensions.join(', ')}`), false);
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024, 
    files: 10
  }
}).array('files', 10); 

export default uploadDocuments