import CategoriesModel from "../models/CategoriesModel.js";
import {categorySchema, categoryIdParam} from "../validations/categorieSchema.js";

/**
 * Create category
 * 
 * Function to create a new category (only for admins)
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} category created
 */
export const createCategory = async (req, res) => {
  try {
    if (!req.user || !req.user.admin_id) {
      return res.status(403).json({ 
        message: 'Acceso denegado. Solo los administradores activos pueden crear categorías.',
        status: 403
      });
    }

    const { error } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: error.details[0].message,
        status: 400
      });
    }

    const category = await CategoriesModel.create({ name: req.body.name });

    res.status(201).json({
      message: "Categoría creada exitosamente",
      status: 201,
      category
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ 
      message: "Error al crear categoría:", 
      error: error.message,
      status: 500
    });
  }
};


/**
 * Update category
 * 
 * Function to update category details (only for admins)
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} updated category data
 */
export const updateCategory = async (req, res) => {
  try {
    if (!req.user || !req.user.admin_id) {
      return res.status(403).json({ 
        message: 'Acceso denegado. Solo los administradores activos pueden actualizar las categorías.',
        status: 403
      });
    }

    const { error: idError } = categoryIdParam.validate(req.params.id);
    if (idError) {
      return res.status(400).json({ message: "ID de categoría no válida", status: 400 });
    }

    const { error } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message, status: 400 });
    }

    const category = await CategoriesModel.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada", status: 404 });
    }

    await CategoriesModel.update(
      { name: req.body.name },
      { where: { id: req.params.id } }
    );

    const updatedCategory = await CategoriesModel.findByPk(req.params.id);

    res.status(200).json({
      message: "Categoría actualizada exitosamente",
      status: 200,
      category: updatedCategory
    });
  } catch (error) {
    console.error('Error al actualizar la categoría:', error);
    res.status(500).json({ message: "Error al actualizar la categoría:", error: error.message, status: 500 });
  }
};

/**
 * Delete category
 * 
 * Function to delete a category (only for admins)
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} confirmation message
 */
export const deleteCategory = async (req, res) => {
  try {
    if (!req.user || !req.user.admin_id) {
      return res.status(403).json({ 
        message: 'Acceso denegado. Solo los administradores activos pueden eliminar categorías.',
        status: 403
      });
    }

    const { error: idError } = categoryIdParam.validate(req.params.id);
    if (idError) {
      return res.status(400).json({ message: "ID de categoría no válida", status: 400 });
    }

    const category = await CategoriesModel.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada", status: 404 });
    }

    await CategoriesModel.destroy({ where: { id: req.params.id } });

    res.status(200).json({
      message: "Categoría eliminada exitosamente",
      status: 200
    });
  } catch (error) {
    console.error('Error al eliminar la categoría:', error);
    res.status(500).json({ message: "Error al eliminar la categoría:", error: error.message, status: 500 });
  }
};
/**
 * Get all categories
 * 
 * Function to retrieve all categories 
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Array} array of categories
 */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await CategoriesModel.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: "Categorías recuperadas exitosamente",
      status: 200,
      categories
    });
  } catch (error) {
    console.error('Error al recuperar categorías:', error);
    res.status(500).json({ message: "Error al recuperar categorías:", error: error.message, status: 500 });
  }
};

/**
 * Get category by ID
 * 
 * Function to retrieve a specific category by its ID
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} category data
 */
export const getCategoryById = async (req, res) => {
  try {
    const { error: idError } = categoryIdParam.validate(req.params.id);
    if (idError) {
      return res.status(400).json({ message: "ID de categoría no válida", status: 400 });
    }

    const category = await CategoriesModel.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada", status: 404 });
    }

    res.status(200).json({
      message: "Categoría recuperada exitosamente",
      status: 200,
      category
    });
  } catch (error) {
    console.error('Error al recuperar la categoría:', error);
    res.status(500).json({ message: "Error al recuperar la categoría:", error: error.message, status: 500 });
  }
};
