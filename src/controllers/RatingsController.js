import UsersModel from '../models/UsersModel.js';
import RatingModel from '../models/RatingModel.js';
import { createRatingSchema } from '../validations/ratingSchema.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';


export const getAll = async (req, res) => {
  // Obtener todas las calificaciones visibles
    try {
      const ratings = await RatingModel.findAll({
        where: { isVisible: true },
        include: [
          { model: UsersModel, as: 'developer', attributes: ['id', 'name'] },
          { model: UsersModel, as: 'company', attributes: ['id', 'name'] },
        ],
      });
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener ratings', error });
    }
};

  // Obtener una calificación por ID
  export const getById = async (req, res) => {
    try {
      const rating = await RatingModel.findByPk(req.params.id);
      if (!rating) return res.status(404).json({ message: 'Rating no encontrado' });
      res.json(rating);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener rating', error });
    }
  }

  // Crear una calificación
 export const create = async (req, res) => {
    try {

       const { error } = createRatingSchema.validate(req.body);
       if (error) return res.status(400).json({ message: error.details[0].message }); 

      const { developer_id, company_id, score, comment, isVisible } = req.body;

      const rating = await Rating.create({
        developer_id,
        company_id,
        score,
        comment,
        isVisible,
      });
      res.status(201).json(rating);
    } catch (error) {
      res.status(500).json({ message: 'Error al crear rating', error });
    }
  }

  // Actualizar una calificación
 export const update = async (req, res) => {
    try {
      const rating = await RatingModel.findByPk(req.params.id);
      if (!rating) return res.status(404).json({ message: 'Rating no encontrado' });

      await rating.update(req.body);
      res.json(rating);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar rating', error });
    }
  }

  // Eliminar (opcionalmente soft delete) una calificación
 export const deletev = async (req, res) => {
    try {
      const rating = await RatingModel.findByPk(req.params.id);
      if (!rating) return res.status(404).json({ message: 'Rating no encontrado' });

       if (req.user.id !== rating.company_id) {
      return res.status(403).json({ message: 'No autorizado para eliminar este rating' });
    }

      await rating.destroy();
      res.json({ message: 'Rating eliminado' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar rating', error });
    }
  }

