import uploadImage from "../helpers/uploadImage.js"

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

    if (!req.file || !req.file.length === 0) {
      return res
        .status(400)
        .json({
          status: 400,
          message: "No file uploaded" 
        });
    }

    const user = await UsersModel.findByPk(id)

    if (!user) return res.status(404).json({ status: 404, message: "User not found" });

    const result = await uploadImage({
      filePath: req.file.path,
      originalName: req.file.originalname,
      folderName: "images/"
    }) 

    //imagePath = imagePath.replace(/\\/g, "/");

    await model.update({ image: result.url }, { where: { id: id } });
    
    res
      .status(200)
      .json({ 
        status: 200,
        message: "Image updated successfully",
        imageUrl: result.url
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