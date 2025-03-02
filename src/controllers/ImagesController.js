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
    // get image route from request body
    let imagePath = req.file.path;

    imagePath = imagePath.replace(/\\/g, "/");

    // update image route in database
    await model.update({ image: imagePath }, { where: { id: id } });
    res.status(200).json({ message: "Image updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating image", error });
  }
};

export default updateImage;
