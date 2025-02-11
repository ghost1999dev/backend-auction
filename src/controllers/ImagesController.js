const updateImage = async (req, res, model) => {
    try {
        const { id } = req.params
        // get image route from request body
        let imagePath = req.file.path

        imagePath = imagePath.replace(/\\/g, '/')

        // update image route in database
        await model.update({ image: imagePath }, { where: { id: id } })
        res.status(200).json({ message: "Image updated successfully" })
    }
    catch (error) {
        res.status(500).json({ message: "Error updating image", error })
    }
}

export default updateImage