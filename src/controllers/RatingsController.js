import UsersModel from '../models/UsersModel.js';
import DevelopersModel from '../models/DevelopersModel.js';
import CompaniesModel from '../models/CompaniesModel.js';
import RatingModel from '../models/RatingModel.js';
import { createRatingSchema } from '../validations/ratingSchema.js';
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

    res.json({
    data: ratings.rows.map(rating => ({
        id: rating.id,
        score: rating.score,
        comment: rating.comment,
        isVisible: rating.isVisible,
        createdAt: rating.createdAt,
        updatedAt: rating.updatedAt,
        developer_id: rating.developer_id,
        company_id: rating.company_id,
        developer_name: rating.developer?.user?.name || null,
        company_name: rating.company?.user?.name || null,
    })),
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
    });

    if (!rating) return res.status(404).json({ message: 'Rating no encontrado' });

    res.json({
      id: rating.id,
      score: rating.score,
      comment: rating.comment,
      isVisible: rating.isVisible,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
      developer_id: rating.developer_id,
      company_id: rating.company_id,
      developer_name: rating.developer?.user?.name || null,
      company_name: rating.company?.user?.name || null,
    });
  } catch (error) {
    console.error('Error al obtener rating:', error);
    res.status(500).json({ message: 'Error al obtener rating', error });
  }
};

 export const createRatings = async (req, res) => {
  try {
    const { error } = createRatingSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { developer_id, company_id, score, comment, isVisible } = req.body;

     let isOwner = false;

    if (developer_id) {
      const developer = await DevelopersModel.findByPk(developer_id);
      if (!developer) return res.status(404).json({ message: 'Desarrollador no encontrado' });
      if (developer.user_id === req.user.id) {
        isOwner = true;
      }
    }

    if (company_id) {
      const company = await CompaniesModel.findByPk(company_id);
      if (!company) return res.status(404).json({ message: 'Empresa no encontrada' });
      if (company.user_id === req.user.id) {
        isOwner = true;
      }
    }

    if (!isOwner) {
      return res.status(403).json({ message: 'No estás autorizado para crear este rating' });
    }

    const rating = await RatingModel.create({
      developer_id,
      company_id,
      score,
      comment,
      isVisible,
    });

    const developer = await DevelopersModel.findByPk(developer_id, {
      include: { model: UsersModel, attributes: ['name'] }
    });
    const company = await CompaniesModel.findByPk(company_id, {
      include: { model: UsersModel, attributes: ['name'] }
    });

    res.status(201).json({
      id: rating.id,
      score: rating.score,
      comment: rating.comment,
      isVisible: rating.isVisible,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
      developer_id,
      company_id,
      developer_name: developer?.user?.name || null,
      company_name: company?.user?.name || null,
    });
    
    } catch (error) {
       console.error("Error al crear rating:", error);
       res.status(500).json({ message: 'Error al crear rating', error: error.message || error });
    }
  }

 export const updateRatings = async (req, res) => {
  try {

        const rating = await RatingModel.findByPk(req.params.id);
        if (!rating) return res.status(404).json({ message: 'Rating no encontrado' });

        const developer = await DevelopersModel.findByPk(rating.developer_id);
        const company = await CompaniesModel.findByPk(rating.company_id);

        const isOwner = (developer && developer.user_id === req.user.id) ||
                        (company && company.user_id === req.user.id);

        if (!isOwner) {
        return res.status(403).json({ message: 'No autorizado para editar este rating' });
        }


    
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

        await rating.update(req.body);

        const developerUser = await DevelopersModel.findByPk(rating.developer_id, {
        include: { model: UsersModel, attributes: ['name'] }
        });
        const companyUser = await CompaniesModel.findByPk(rating.company_id, {
        include: { model: UsersModel, attributes: ['name'] }
        });

        res.json({
        id: rating.id,
        score: rating.score,
        comment: rating.comment,
        isVisible: rating.isVisible,
        createdAt: rating.createdAt,
        updatedAt: rating.updatedAt,
        developer_id: rating.developer_id,
        company_id: rating.company_id,
        developer_name: developerUser?.user?.name || null,
        company_name: companyUser?.user?.name || null,
        });

    } catch (error) {
        console.error("Error al actualizar rating:", error);
        res.status(500).json({ message: 'Error al actualizar rating', error: error.message || error });
    }
  };

 export const deleteRatings = async (req, res) => {
  try {
    const rating = await RatingModel.findByPk(req.params.id);
    if (!rating) return res.status(404).json({ message: 'Rating no encontrado' });

    const developer = await DevelopersModel.findByPk(rating.developer_id);
    const company = await CompaniesModel.findByPk(rating.company_id);

    const isOwner = (developer && developer.user_id === req.user.id) ||
                    (company && company.user_id === req.user.id);

    if (!isOwner) {
      return res.status(403).json({ message: 'No autorizado para eliminar este rating' });
    }

    await rating.destroy();

    res.json({ message: 'Rating eliminado' });
  } catch (error) {
    console.error("Error al eliminar rating:", error);
    res.status(500).json({ message: 'Error al eliminar rating', error: error.message || error });
  }
};

export const getPromRatingByDeveloper = async (req, res) => {

  const developerId = req.params.id;

  if (!developerId) {
    return res.status(400).json({ message: 'El parámetro developerId es requerido.' });
  }

  try {
    const result = await RatingModel.findOne({
      where: {
        developer_id: developerId,
        isVisible: true
      },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('score')), 'averageScore'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalRatings']
      ]
    });

    const average = parseFloat(result.dataValues.averageScore || 0).toFixed(2);
    const total = parseInt(result.dataValues.totalRatings);

    res.json({
      developer_id: developerId,
      averageScore: parseFloat(average),
      totalRatings: total
    });
  } catch (error) {
    console.error('Error al calcular el promedio del developer:', error);
    res.status(500).json({ message: 'Error al calcular el promedio del developer', error });
  }
}

export const getPromRatingByCompany = async (req, res) => {
  const companyId = req.params.id;

  if (!companyId) {
    return res.status(400).json({ message: 'El parámetro companyId es requerido.' });
  }

  try {
    const result = await RatingModel.findOne({
      where: {
        company_id: companyId,
        isVisible: true
      },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('score')), 'averageScore'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalRatings']
      ]
    });

    const average = parseFloat(result?.dataValues?.averageScore || 0).toFixed(2);
    const total = parseInt(result?.dataValues?.totalRatings || 0);

    res.json({
      company_id: companyId,
      averageScore: parseFloat(average),
      totalRatings: total
    });
  } catch (error) {
    console.error('Error al calcular el promedio de la empresa:', error);
    res.status(500).json({ message: 'Error al calcular el promedio de la empresa', error });
  }
};

export const getGlobalPromRatingByCompany = async (req, res) => {
  try {
    const result = await RatingModel.findOne({
      where: {
        company_id: { [Op.ne]: null },
        isVisible: true
      },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('score')), 'averageScore'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalRatings']
      ]
    });

    const average = parseFloat(result?.dataValues?.averageScore || 0).toFixed(2);
    const total = parseInt(result?.dataValues?.totalRatings || 0);

    res.json({
      averageScore: parseFloat(average),
      totalRatings: total,
      type: 'companies'
    });
  } catch (error) {
    console.error('Error al calcular promedio global de empresas:', error);
    res.status(500).json({ message: 'Error al calcular el promedio global de empresas', error });
  }
};

export const getGlobalPromRatingByDeveloper = async (req, res) => {
  try {
    const result = await RatingModel.findOne({
      where: {
        developer_id: { [Op.ne]: null },
        isVisible: true
      },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('score')), 'averageScore'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalRatings']
      ]
    });

    const average = parseFloat(result?.dataValues?.averageScore || 0).toFixed(2);
    const total = parseInt(result?.dataValues?.totalRatings || 0);

    res.json({
      averageScore: parseFloat(average),
      totalRatings: total,
      type: 'developers'
    });
  } catch (error) {
    console.error('Error al calcular promedio global de developers:', error);
    res.status(500).json({ message: 'Error al calcular el promedio global de developers', error });
  }
};

export const getPublicProfile = async (req, res) => {
  const userId = req.params.id;
  const filterBy = req.query.filterBy; 

  try {
  
    const user = await DevelopersModel.findByPk(userId) || await CompaniesModel.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const ratingWhere = {
      isVisible: true,
      [Op.or]: [
        { developer_id: userId },
        { company_id: userId }
      ]
    };

    if (filterBy === 'developer') {
      ratingWhere.company_id = userId; 
    } else if (filterBy === 'company') {
      ratingWhere.developer_id = userId; 
    }

        const ratings = await RatingModel.findAll({
      where: ratingWhere,
      order: [['createdAt', 'DESC']],
      attributes: ['score', 'comment', 'createdAt'],
      include: [
        (filterBy === 'developer' || !filterBy) && {
          model: CompaniesModel,
          as: 'company',
          include: [{
            model: UsersModel,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }]
        },
        (filterBy === 'company' || !filterBy) && {
          model: DevelopersModel,
          as: 'developer',
          include: [{
            model: UsersModel,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }]
        }
      ].filter(Boolean)
    });

    const totalRatings = ratings.length;
    const avgScore = totalRatings
      ? parseFloat((ratings.reduce((acc, r) => acc + r.score, 0) / totalRatings).toFixed(2))
      : 0;

    const recentRatings = ratings.map(r => ({
      score: r.score,
      comment: r.comment,
      createdAt: r.createdAt,
      reviewer: r.developer || r.company
    }));

    return res.json({
      user,
      ratingSummary: {
        averageScore: avgScore,
        totalRatings
      },
      recentRatings
    });

  } catch (error) {
    console.error('Error al obtener perfil público:', error);
    return res.status(500).json({ error: 'No se pudo obtener el perfil público.' });
  }
};





