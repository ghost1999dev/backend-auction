import UsersModel from '../models/UsersModel.js';
import DevelopersModel from '../models/DevelopersModel.js';
import CompaniesModel from '../models/CompaniesModel.js';
import RatingModel from '../models/RatingModel.js';
import { createRatingSchema, updateRatingSchema } from '../validations/ratingSchema.js';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize';

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
        {
          model: DevelopersModel,
          as: 'developer',
          attributes: ['id'],
          include: [
            {
              model: UsersModel,
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: CompaniesModel,
          as: 'company',
          attributes: ['id'],
          include: [
            {
              model: UsersModel,
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
      order: [[sortField, sortOrder]],
    });

    const authorIds = ratings.rows.map(rating => rating.author_id);
    const authors = await UsersModel.findAll({
      where: { id: authorIds },
      attributes: ['id', 'name'],
    });

    const authorMap = {};
    authors.forEach(author => {
      authorMap[author.id] = author.name;
    });

    const data = ratings.rows.map(rating => {
      let author_name = null;

      if (rating.author_role?.toLowerCase() === 'developer') {
        author_name = rating.developer?.user?.name || authorMap[rating.author_id] || null;
      } else if (rating.author_role?.toLowerCase() === 'company') {
        author_name = rating.company?.user?.name || authorMap[rating.author_id] || null;
      }

      return {
        id: rating.id,
        score: rating.score,
        comment: rating.comment,
        isVisible: rating.isVisible,
        createdAt: rating.createdAt,
        updatedAt: rating.updatedAt,
        developer_id: rating.developer_id,
        company_id: rating.company_id,
        author_id: rating.author_id,
        author_role: rating.author_role,
        author_name,  
      };
    });

    res.json({
      data,
      total: ratings.count,
      page: parseInt(page),
      totalPages: Math.ceil(ratings.count / limit),
    });

  } catch (error) {
    console.error('Error al obtener ratings:', error);
    res.status(500).json({ message: 'Error al obtener ratings', error });
  }
};

export const getByIdRating = async (req, res) => {
  try {
    const rating = await RatingModel.findByPk(req.params.id, {
      include: [
        {
          model: DevelopersModel,
          as: 'developer',
          attributes: ['id'],
          include: [{ model: UsersModel, attributes: ['id', 'name'] }],
        },
        {
          model: CompaniesModel,
          as: 'company',
          attributes: ['id'],
          include: [{ model: UsersModel, attributes: ['id', 'name'] }],
        },
      ],
    });

    if (!rating) return res.status(404).json({ message: 'Rating no encontrado' });

    let developer_name = rating.developer?.user?.name || null;
    let company_name = rating.company?.user?.name || null;

    if (!developer_name && rating.author_role === 'Developer') {
      const author = await UsersModel.findByPk(rating.author_id, { attributes: ['id', 'name'] });
      developer_name = author?.name || null;
    }

    if (!company_name && rating.author_role === 'Company') {
      const author = await UsersModel.findByPk(rating.author_id, { attributes: ['id', 'name'] });
      company_name = author?.name || null;
    }

    res.json({
      id: rating.id,
      score: rating.score,
      comment: rating.comment,
      isVisible: rating.isVisible,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
      developer_id: rating.developer_id,
      company_id: rating.company_id,
      developer_name,
      company_name,
      author_id: rating.author_id,
      author_role: rating.author_role
    });

  } catch (error) {
    console.error('Error al obtener rating:', error);
    res.status(500).json({ message: 'Error al obtener rating', error });
  }
};

const ROLE_COMPANY = 1;
const ROLE_DEVELOPER = 2;

async function validateUserRoleByProfileId(profileId, ProfileModel, expectedRoleId) {
  const profile = await ProfileModel.findByPk(profileId);
  if (!profile) {
    return { valid: false, message: `Perfil con id ${profileId} no encontrado.` };
  }

  const user = await UsersModel.findByPk(profile.user_id);
  if (!user) {
    return { valid: false, message: `Usuario asociado al perfil ${profileId} no encontrado.` };
  }

  if (user.role_id !== expectedRoleId) {
    return { valid: false, message: `El usuario asociado no tiene el rol esperado.` };
  }

  return { valid: true, user };
}

export const createRatings = async (req, res) => {
  try {
    const { error } = createRatingSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { developer_id, company_id, score, comment, isVisible } = req.body;
    const roleId = req.user.role_id;
    const userId = req.user.id;
    let author_role;

    if (developer_id) {
      const devProfile = await DevelopersModel.findByPk(developer_id);
      if (!devProfile) return res.status(404).json({ message: 'Developer no encontrado' });
      if (devProfile.user_id === userId) {
        return res.status(400).json({ message: 'No puedes calificarte a ti mismo' });
      }
    }

    if (company_id) {
      const companyProfile = await CompaniesModel.findByPk(company_id);
      if (!companyProfile) return res.status(404).json({ message: 'Company no encontrada' });
      if (companyProfile.user_id === userId) {
        return res.status(400).json({ message: 'No puedes calificarte a ti mismo' });
      }
    }

    if (roleId === ROLE_DEVELOPER) {
      if (!company_id || developer_id) {
        return res.status(400).json({ message: 'Un developer solo puede calificar a una company' });
      }

      const validation = await validateUserRoleByProfileId(company_id, CompaniesModel, ROLE_COMPANY);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
      }

      const existingRating = await RatingModel.findOne({
        where: { author_id: userId, company_id }
      });

      if (existingRating) {
        return res.status(409).json({ message: 'Ya has calificado a esta empresa anteriormente' });
      }

      author_role = 'Developer';

    } else if (roleId === ROLE_COMPANY) {

      if (!developer_id || company_id) {
        return res.status(400).json({ message: 'Una company solo puede calificar a un developer' });
      }

      const validation = await validateUserRoleByProfileId(developer_id, DevelopersModel, ROLE_DEVELOPER);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
      }

      const existingRating = await RatingModel.findOne({
        where: { author_id: userId, developer_id }
      });

      if (existingRating) {
        return res.status(409).json({ message: 'Ya has calificado a este developer anteriormente' });
      }

      author_role = 'Company';

    } else {
      return res.status(403).json({ message: 'No autorizado para crear este rating' });
    }

    const rating = await RatingModel.create({
      developer_id: developer_id || null,
      company_id: company_id || null,
      score,
      comment,
      isVisible,
      author_id: userId,
      author_role,
    });

    res.status(201).json(rating);
  } catch (error) {
    console.error("Error al crear rating:", error);
    res.status(500).json({ message: 'Error al crear rating', error });
  }
};







export const updateRatings = async (req, res) => {
  try {
    const rating = await RatingModel.findByPk(req.params.id);
    if (!rating) return res.status(404).json({ message: 'Rating no encontrado' });

    if (rating.author_id !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado para editar este rating' });
    }


    const { error } = updateRatingSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });


    if (req.body.comment && req.body.comment !== rating.comment) {
      const now = new Date();
      const createdAt = new Date(rating.createdAt);
      const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);

      if (hoursSinceCreation > 1) {
        return res.status(400).json({
          message: 'No puedes editar el comentario después de una hora de haberlo creado',
        });
      }
    }


    const updatedData = {
      score: req.body.score ?? rating.score,
      comment: req.body.comment ?? rating.comment,
      isVisible: req.body.isVisible ?? rating.isVisible,
    };

    await rating.update(updatedData);
    res.json(rating);
  } catch (error) {
    console.error("Error al actualizar rating:", error);
    res.status(500).json({ message: 'Error al actualizar rating', error });
  }
};
export const deleteRatings = async (req, res) => {
  try {
    const rating = await RatingModel.findByPk(req.params.id);
    if (!rating) return res.status(404).json({ message: 'Rating no encontrado' });

    if (rating.author_id !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado para eliminar este rating' });
    }

    await rating.destroy();
    res.json({ message: 'Rating eliminado' });
  } catch (error) {
    console.error("Error al eliminar rating:", error);
    res.status(500).json({ message: 'Error al eliminar rating', error });
  }
};

export const getPromRatingByDeveloper = async (req, res) => {
  const developerId = req.params.id;

  try {

    const developer = await DevelopersModel.findByPk(developerId, {
      include: [{ model: UsersModel, attributes: ['name'] }],
    });

    if (!developer) {
      return res.status(404).json({ message: 'Developer no encontrado' });
    }


    const stats = await RatingModel.findOne({
      where: { developer_id: developerId, isVisible: true },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('score')), 'averageScore'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalRatings']
      ],
      raw: true,
    });

    const ratings = await RatingModel.findAll({
      where: { developer_id: developerId, isVisible: true },
      attributes: ['id', 'score', 'comment', 'author_role', 'author_id', 'createdAt'],
      include: [
        {
          model: UsersModel,
          as: 'authorUser',
          attributes: ['name']
        }
      ],
      order: [['createdAt', 'DESC']],
    });


    const formattedRatings = ratings.map(rating => ({
      id: rating.id,
      score: rating.score,
      comment: rating.comment,
      author_role: rating.author_role,
      author_id: rating.author_id,
      author_name: rating.authorUser?.name || null,
      createdAt: rating.createdAt,
    }));

    res.json({
      developer_id: developerId,
      developer_name: developer.user?.name || null,
      averageScore: stats?.averageScore ? parseFloat(stats.averageScore).toFixed(2) : '0.00',
      totalRatings: parseInt(stats?.totalRatings || 0),
      ratings: formattedRatings
    });

  } catch (error) {
    console.error('Error al calcular el promedio y obtener ratings del developer:', error);
    res.status(500).json({ message: 'Error al obtener datos', error });
  }
};
export const getPromRatingByCompany = async (req, res) => {
  const companyId = req.params.id;

  try {

    const company = await CompaniesModel.findByPk(companyId, {
      include: [{ model: UsersModel, attributes: ['name'] }],
    });

    if (!company) return res.status(404).json({ message: 'Empresa no encontrada' });


    const result = await RatingModel.findOne({
      where: { company_id: companyId, isVisible: true },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('score')), 'averageScore'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalRatings']
      ]
    });


    const ratings = await RatingModel.findAll({
      where: { company_id: companyId, isVisible: true },
      include: [{ model: UsersModel, as: 'authorUser', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      company_id: companyId,
      company_name: company?.user?.name || null,
      averageScore: parseFloat(result?.dataValues?.averageScore || 0).toFixed(2),
      totalRatings: parseInt(result?.dataValues?.totalRatings || 0),
      ratings: ratings.map(r => ({
        id: r.id,
        score: r.score,
        comment: r.comment,
        author_role: r.author_role,
        author_id: r.author_id,
        author_name: r.authorUser?.name || null,
        createdAt: r.createdAt
      }))
    });

  } catch (error) {
    console.error('Error al calcular el promedio y obtener ratings de la company:', error);
    res.status(500).json({ message: 'Error al obtener datos', error });
  }
};

export const getPublicProfile = async (req, res) => {
  const userId = req.params.id;
  const filterBy = req.query.filterBy;

  try {

    let user = await DevelopersModel.findByPk(userId, {
      include: [{ model: UsersModel, attributes: ['name', 'email'] }]
    });

    let profileType = 'Developer';

    if (!user) {
      user = await CompaniesModel.findByPk(userId, {
        include: [{ model: UsersModel, attributes: ['name', 'email'] }]
      });
      profileType = 'Company';
    }

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

    let ratingWhere = { isVisible: true };

    if (filterBy === 'developer') {
      ratingWhere.developer_id = userId;
    } else if (filterBy === 'company') {
      ratingWhere.company_id = userId;
    } else {

      ratingWhere[Op.or] = [
        { developer_id: userId },
        { company_id: userId }
      ];
    }


    const ratings = await RatingModel.findAll({
      where: ratingWhere,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'score', 'comment', 'createdAt', 'author_id', 'author_role'],
      include: [
        {
          model: UsersModel,
          as: 'authorUser',
          attributes: ['name']
        }
      ]
    });

    const totalRatings = ratings.length;
    const avgScore = totalRatings
      ? parseFloat((ratings.reduce((acc, r) => acc + r.score, 0) / totalRatings).toFixed(2))
      : 0;

    const recentRatings = ratings.map(rating => ({
      id: rating.id,
      score: rating.score,
      comment: rating.comment,
      author_id: rating.author_id,
      author_role: rating.author_role,
      author_name: rating.authorUser?.name || null,
      createdAt: rating.createdAt
    }));

    res.json({
      user: {
        id: user.id,
        name: user.user?.name,
        email: user.user?.email,
        profileType
      },
      ratingSummary: {
        averageScore: avgScore,
        totalRatings
      },
      recentRatings
    });

  } catch (error) {
    console.error('Error al obtener perfil público:', error);
    res.status(500).json({ error: 'No se pudo obtener el perfil público.' });
  }
};





