import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import uploadImage from "../helpers/uploadImage.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../images/temp"))
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extmane = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extmane) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10
  }
})

/**
 * update image
 *
 * function to update image
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @param {Object} model - model to update image
 * @returns {Object} image updated
 */
const updateImage = async (req, res, model) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({
          status: 400,
          message: "No id provided" 
        });
    }

    if (!req.files || !req.files.length === 0) {
      return res
        .status(400)
        .json({
          status: 400,
          message: "No file uploaded" 
        });
    }

    const uploadPromises = uploadImage({
      filePath: req.files[0].path,
      originalName: req.files[0].originalname,
      folderName: "images/"
    }) 

    const result = await Promise.all(uploadPromises)

    //imagePath = imagePath.replace(/\\/g, "/");

    await model.update({ image: result.url }, { where: { id: id } });
    
    res
      .status(200)
      .json({ 
        status: 200,
        message: "Image updated successfully",
        image: result.url
      });
  } catch (error) {
    res
      .status(500)
      .json({ 
        status: 500,
        message: "Error updloading image", error 
      });
  }
};

export default updateImage;