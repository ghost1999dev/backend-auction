import CategoriesModel from "../models/CategoriesModel.js";
import Joi from "joi";

const categorySchema = Joi.object({
  name: Joi.string().trim().min(3).max(50).required()
});

const categoryIdParam = Joi.number().integer().positive().required();

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
        message: 'Access denied. Only active administrators can create categories.',
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
      message: "Category created successfully",
      status: 201,
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ 
      message: "Error creating category", 
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
        message: 'Access denied. Only active administrators can update categories.',
        status: 403
      });
    }

    const { error: idError } = categoryIdParam.validate(req.params.id);
    if (idError) {
      return res.status(400).json({ message: "Invalid category ID", status: 400 });
    }

    const { error } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message, status: 400 });
    }

    const category = await CategoriesModel.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found", status: 404 });
    }

    await CategoriesModel.update(
      { name: req.body.name },
      { where: { id: req.params.id } }
    );

    const updatedCategory = await CategoriesModel.findByPk(req.params.id);

    res.status(200).json({
      message: "Category updated successfully",
      status: 200,
      category: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: "Error updating category", error: error.message, status: 500 });
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
        message: 'Access denied. Only active administrators can delete categories.',
        status: 403
      });
    }

    const { error: idError } = categoryIdParam.validate(req.params.id);
    if (idError) {
      return res.status(400).json({ message: "Invalid category ID", status: 400 });
    }

    const category = await CategoriesModel.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found", status: 404 });
    }

    await CategoriesModel.destroy({ where: { id: req.params.id } });

    res.status(200).json({
      message: "Category deleted successfully",
      status: 200
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: "Error deleting category", error: error.message, status: 500 });
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
      message: "Categories retrieved successfully",
      status: 200,
      categories
    });
  } catch (error) {
    console.error('Error retrieving categories:', error);
    res.status(500).json({ message: "Error retrieving categories", error: error.message, status: 500 });
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
      return res.status(400).json({ message: "Invalid category ID", status: 400 });
    }

    const category = await CategoriesModel.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found", status: 404 });
    }

    res.status(200).json({
      message: "Category retrieved successfully",
      status: 200,
      category
    });
  } catch (error) {
    console.error('Error retrieving category:', error);
    res.status(500).json({ message: "Error retrieving category", error: error.message, status: 500 });
  }
};
