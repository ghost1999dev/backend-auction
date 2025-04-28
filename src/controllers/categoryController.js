import CategoriesModel from "../models/CategorieModel.js";

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
    const { name } = req.body;

    // Validación del nombre de categoría
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Crear la categoría en la base de datos
    const category = await CategoriesModel.create({
      name
    });

    res.status(201).json({
      message: "Category created successfully",
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: "Error creating category", error: error.message });
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
    const { id } = req.params;
    const { name } = req.body;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    // Verificar que la categoría existe
    const categoryExists = await CategoriesModel.findByPk(id);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    // Validación del nombre
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Actualizar la categoría
    await CategoriesModel.update(
      { 
        name
      }, 
      {
        where: { id }
      }
    );
    
    // Obtener la categoría actualizada para devolver en la respuesta
    const updatedCategory = await CategoriesModel.findByPk(id);
    
    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: "Error updating category", error: error.message });
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
    const { id } = req.params;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    // Verificar que la categoría existe
    const category = await CategoriesModel.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    // Eliminar físicamente la categoría
    await CategoriesModel.destroy({
      where: { id }
    });
    
    res.status(200).json({
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: "Error deleting category", error: error.message });
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
    // Obtener todas las categorías
    const categories = await CategoriesModel.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      message: "Categories retrieved successfully",
      categories
    });
  } catch (error) {
    console.error('Error retrieving categories:', error);
    res.status(500).json({ message: "Error retrieving categories", error: error.message });
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
    const { id } = req.params;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    const category = await CategoriesModel.findByPk(id);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.status(200).json({
      message: "Category retrieved successfully",
      category
    });
  } catch (error) {
    console.error('Error retrieving category:', error);
    res.status(500).json({ message: "Error retrieving category", error: error.message });
  }
};
