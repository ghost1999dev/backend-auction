import multer from "multer"; // package to upload image
import path from "path"; // package to get path

/**
 * upload image
 *
 * function to upload image
 * @param {function} cb - callback function
 * @returns {string} path of image
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// set multer storage
const upload = multer({ storage: storage });

export default upload;
