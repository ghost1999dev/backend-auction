import UsersModel from '../models/UsersModel.js';
import RatingModel from '../models/RatingModel.js';
import { createRatingSchema } from '../validations/ratingSchema.js';
import { Op } from 'sequelize';


export const getAllRatings = async (req, res) => {
   try {
    const {
      developer_id,
      company_id,
      score_min,
      score_max,
      score,
      isVisible,
      page = 1,
      limit = 10,
      sortBy = 'createdAt', 
      order = 'desc',        
    } = req.query;

    const where = {};

    if (developer_id) where.developer_id = developer_id;
    if (company_id) where.company_id = company_id;
    if (isVisible !== undefined) where.isVisible = isVisible === 'true';

    if (score) {
      where.score = score;
    } else if (score_min || score_max) {
      where.score = {
        ...(score_min && { [Op.gte]: parseFloat(score_min) }),
        ...(score_max && { [Op.lte]: parseFloat(score_max) }),
      };
    }

    const offset = (page - 1) * limit;

    const allowedSortFields = ['score', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const ratings = await RatingModel.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: User, as: 'developer', attributes: ['id', 'name'] },
        { model: User, as: 'company', attributes: ['id', 'name'] },
      ],
      order: [[sortField, sortOrder]],
    });

    res.json({
      data: ratings.rows,
      total: ratings.count,
      page: parseInt(page),
      totalPages: Math.ceil(ratings.count / limit),
    });
  } catch (error) {
    console.error("Error al obtener ratings:", error);
    res.status(500).json({ message: 'Error al obtener ratings', error: error.message || error });
  }
}

  export const getByIdRating = async (req, res) => {
    try {
      const rating = await RatingModel.findByPk(req.params.id);
      if (!rating) return res.status(404).json({ message: 'Rating no encontrado' });
      res.json(rating);
    } catch (error) {
        console.error("Error al obtener rating:", error);
        res.status(500).json({ message: 'Error al obtener rating', error: error.message || error });   
    }
  }

 export const createRatings = async (req, res) => {
    try {

       const { error } = createRatingSchema.validate(req.body);
       if (error) return res.status(400).json({ message: error.details[0].message }); 

      const { developer_id, company_id, score, comment, isVisible } = req.body;

      const rating = await RatingModel.create({
        developer_id,
        company_id,
        score,
        comment,
        isVisible,
      });
      res.status(201).json(rating);
    } catch (error) {
       console.error("Error al crear rating:", error);
       res.status(500).json({ message: 'Error al crear rating', error: error.message || error });
    }
  }

 export const updateRatings = async (req, res) => {
    try {
      const rating = await RatingModel.findByPk(req.params.id);
      if (!rating) return res.status(404).json({ message: 'Rating no encontrado' });

      await rating.update(req.body);
      res.json(rating);
    } catch (error) {
        console.error("Error al actualizar rating:", error);
        res.status(500).json({ message: 'Error al actualizar rating', error: error.message || error });
    }
  }

 export const deleteRatings = async (req, res) => {
    try {
      const rating = await RatingModel.findByPk(req.params.id);
      if (!rating) return res.status(404).json({ message: 'Rating no encontrado' });

       if (req.user.id !== rating.company_id) {

      return res.status(403).json({ message: 'No autorizado para eliminar este rating' });
    }

      await rating.destroy();
      res.json({ message: 'Rating eliminado' });
    } catch (error) {
        console.error("Error al eliminar rating:", error);
        res.status(500).json({ message: 'Error al eliminar rating', error: error.message || error });
    }
  }

