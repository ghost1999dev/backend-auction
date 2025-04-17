import multer from 'multer';
import path from 'path';

/** @type {multer.StorageEngine} */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/images');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

/** @type {multer.Multer} */
const upload = multer({ storage });

export default upload;
