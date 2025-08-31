import AuctionsModel from "../models/AuctionsModel.js";
import ProjectsModel from "../models/ProjectsModel.js";
import CompaniesModel from "../models/CompaniesModel.js";
import UsersModel from "../models/UsersModel.js";
import DevelopersModel from "../models/DevelopersModel.js";
import WinnerModel from "../models/WinnerModel.js";
import { Op } from "sequelize";

import { createAuctionSchema } from "../validations/auctionSchema.js";

const AUCTION_STATUS = {
  PENDING: 0,
  ACTIVE: 1, 
  COMPLETED: 2,
  CANCELLED: 3
};

const VALID_TRANSITIONS = {
  [AUCTION_STATUS.PENDING]: [AUCTION_STATUS.ACTIVE, AUCTION_STATUS.CANCELLED],
  [AUCTION_STATUS.ACTIVE]: [AUCTION_STATUS.COMPLETED, AUCTION_STATUS.CANCELLED],
  [AUCTION_STATUS.COMPLETED]: [],
  [AUCTION_STATUS.CANCELLED]: []
};

/**
 * @desc    Valida el estado de una subasta para transiciones
 * @param   {number} currentStatus - Estado actual 
 * @param   {number} newStatus - Estado propuesto
 * @returns {boolean} True si la transición es válida
 */
const isValidTransition = (currentStatus, newStatus) => {
  return VALID_TRANSITIONS[currentStatus]?.includes(newStatus);
};

/**
 * @desc    Crear nueva subasta
 * @route   POST /auctions/create
 * @access  Private - Solo empresas
 * @param   {Object} req.body
 * @param   {number} req.body.project_id - ID del proyecto
 * @param   {Date} req.body.bidding_started_at - Fecha inicio
 * @param   {Date} req.body.bidding_deadline - Fecha fin
 * @returns {Object} Nueva subasta creada o error
 */
export const createAuction = async (req, res) => {
    const { error, value } = createAuctionSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: "Error de validación de datos",
            error: error.details[0].message
        });
    }

    const { project_id, bidding_started_at, bidding_deadline } = value;
    
    try {
        const project = await ProjectsModel.findByPk(project_id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Proyecto no encontrado",
                error: "project_not_found"
            });
        }

        const company = await CompaniesModel.findOne({
            attributes: [],
            include: [{
                model: UsersModel,
                as: 'user',
                attributes: ['id', 'status'],
            }],
            where: { id: project.company_id },
        })

        if (company.user.status === 5){
            return res.status(403).json({
                success: false,
                status: 403,
                message: "No puedes realizar ninguna accion mientras estas bloqueado",
            })
        }

        const existingAuction = await AuctionsModel.findOne({
            where: { project_id }
        });

        if (existingAuction) {
            return res.status(409).json({
                success: false,
                status: 409,
                message: "Ya existe una subasta para este proyecto",
                error: "auction_exists"
            });
        }

        const auction = await AuctionsModel.create({
            project_id,
            bidding_started_at,
            bidding_deadline,
            status: AUCTION_STATUS.PENDING
        });

        return res.status(201).json({
            success: true,
            status: 201,
            message: "Subasta creada exitosamente",
            data: auction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            status: 500,
            message: "Error al crear la subasta",
            error: error.message
        });
    }
};

/**
 * @desc    Listar subastas con filtros
 * @route   GET /auctions
 * @param   {string} req.query.project_id - Filtrar por proyecto
 * @param   {string} req.query.status - Filtrar por estado
 * @param   {Date} req.query.start_date - Fecha inicio
 * @param   {Date} req.query.end_date - Fecha fin
 */
export const listAuctions = async (req, res, next) => {
    try {
        const { project_id, status, start_date, end_date } = req.query;
        const where = {};
        if (project_id) where.project_id = project_id;
        if (status)     where.status     = status;
        if (start_date || end_date) {
            where.bidding_started_at = {
                ...(start_date && { [Op.gte]: start_date }),
                ...(end_date   && { [Op.lte]: end_date   })
            };
        }

        const auctions = await AuctionsModel.findAll({ 
            attributes: ['id', 'project_id', 'bidding_started_at', 'bidding_deadline', 'status', 'createdAt', 'updatedAt'],
            where, 
            order: [["createdAt", "DESC"]],
            include: [{
                model: ProjectsModel,
                as: 'project',
                attributes: ['project_name', 'description', 'budget'] 
            }]
        });
        return res.json({
            success: true,
            data: auctions
        });
    } catch (e) { next(e); }
};

/**
 * @desc    Obtener una subasta por ID
 * @route   GET /auctions/:id
 * @access  Public
 * @param   {number} req.params.id - ID de la subasta
 * @returns {Object} Subasta encontrada o error
 */
export const getAuction = async (req, res, next) => {
    try {
        const auction = await AuctionsModel.findByPk(req.params.id, {
            include: [{
                model: ProjectsModel,
                as: 'project',
                attributes: ['project_name', 'description', 'budget']
            }]
        });
        
        if (!auction) {
            return res.status(404).json({ 
                success: false,
                message: "Subasta no encontrada",
                error: "auction_not_found"
            });
        }

        return res.status(200).json({
            success: true,
            data: auction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener la subasta",
            error: error.message
        });
    }
};

/**
 * @desc    Actualizar subasta
 * @route   PUT /auctions/:id
 * @param   {string} req.params.id - ID de la subasta
 * @param   {Object} req.body - Datos a actualizar
 */
export const updateAuction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, bidding_deadline } = req.body;
        const updateData = {};

        const auction = await AuctionsModel.findByPk(id);

        const project = await ProjectsModel.findByPk(auction.project_id);

        const getStatus = await CompaniesModel.findOne({
            attributes: [],
            include: [{
                model: UsersModel,
                attributes: ['id', 'status'],
            }],
            where: { id: project.company_id },
        })

        if (getStatus.user.status === 5){
            return res.status(403).json({
                success: false,
                message: "No puedes realizar ninguna accion mientras estas bloqueado",
                status: 403,
            })
        }

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: "Subasta no encontrada"
            });
        }

        // Si se proporciona un estado, validarlo
        if (status !== undefined) {
            const newStatus = Number(status);
            
            if (!Object.values(AUCTION_STATUS).includes(newStatus)) {
                return res.status(422).json({
                    success: false,
                    message: "Estado inválido. Debe ser: 0 (pendiente), 1 (activa), 2 (completada), 3 (cancelada)"
                });
            }

            if (!isValidTransition(auction.status, newStatus)) {
                return res.status(422).json({
                    success: false,
                    message: `Transición de estado no permitida: ${auction.status} → ${newStatus}`
                });
            }
            updateData.status = newStatus;
        }

        // Si se proporciona una nueva fecha final, validarla
        if (bidding_deadline) {
            const newDeadline = new Date(bidding_deadline);
            if (newDeadline <= new Date()) {
                return res.status(400).json({
                    success: false,
                    message: "La fecha final debe ser posterior a la fecha actual"
                });
            }
            if (newDeadline <= new Date(auction.bidding_started_at)) {
                return res.status(400).json({
                    success: false,
                    message: "La fecha final debe ser posterior a la fecha de inicio"
                });
            }
            updateData.bidding_deadline = newDeadline;
        }

        updateData.updatedAt = new Date();

        const updatedAuction = await auction.update(updateData);

        return res.json({
            success: true,
            data: updatedAuction
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Actualizar solo la fecha final de una subasta
 * @route   PUT /auctions/update-deadline/:id
 * @param   {string} req.params.id - ID de la subasta
 * @param   {Object} req.body.bidding_deadline - Nueva fecha final
 */
export const updateAuctionDeadline = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { bidding_deadline } = req.body;

        if (!bidding_deadline) {
            return res.status(400).json({
                success: false,
                message: "La fecha final es requerida"
            });
        }

        const auction = await AuctionsModel.findByPk(id);

        const getStatus = await ProjectsModel.findOne({
            attributes: [],
            include: [{
                model: CompaniesModel,
                as: 'company_profile',
                attributes: [],
                include: [{
                    model: UsersModel,
                    attributes: ['id', 'status'],
                }]
            }],
            where: { id: auction.project_id },
        })

        if (getStatus.company.user.status === 5){
            return res.status(403).json({
                success: false,
                message: "No puedes realizar ninguna accion mientras estas bloqueado",
                status: 403,
            })
        }

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: "Subasta no encontrada"
            });
        }

        // Validar que la nueva fecha sea posterior a la fecha actual
        const newDeadline = new Date(bidding_deadline);
        if (newDeadline <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "La fecha final debe ser posterior a la fecha actual"
            });
        }

        // Validar que la nueva fecha sea posterior a la fecha de inicio
        if (newDeadline <= new Date(auction.bidding_started_at)) {
            return res.status(400).json({
                success: false,
                message: "La fecha final debe ser posterior a la fecha de inicio"
            });
        }

        const updatedAuction = await auction.update({
            bidding_deadline: newDeadline,
            updatedAt: new Date()
        });

        return res.json({
            success: true,
            message: "Fecha final de la subasta actualizada exitosamente",
            data: updatedAuction
        });

    } catch (error) {
        next(error);
    }
};

export const deleteAuction = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const auction = await AuctionsModel.findByPk(id);

        const project = await ProjectsModel.findByPk(auction.project_id);

        const getStatus = await CompaniesModel.findOne({
            attributes: [],
            include: [{
                model: UsersModel,
                attributes: ['id', 'status'],
            }],
            where: { id: project.company_id },
        })

        if (getStatus.user.status === 5){
            return res.status(403).json({
                success: false,
                message: "No puedes realizar ninguna accion mientras estas bloqueado",
                status: 403,
            })
        }

        if (!auction) {
            return res.status(404).json({ 
                success: false,
                message: "Subasta no encontrada"
            });
        }

        if (![AUCTION_STATUS.PENDING, AUCTION_STATUS.CANCELLED].includes(Number(auction.status))) {
            return res.status(422).json({
                success: false,
                message: "Solo se pueden eliminar subastas en estado pendiente o cancelado"
            });
        }

        await auction.destroy();
        
        return res.json({
            success: true,
            message: "Subasta eliminada exitosamente"
        });
        
    } catch (error) {
        next(error);
    }
};

export const getAuctionsByDeveloper = async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Falta el ID del desarrollador",
            error: "missing_fields",
            status: 400
        })
    }

    try {
        const data = await WinnerModel.findAll({
            where: { winner_id: id },
            include: [
            {
                model: UsersModel,
                as: 'winner',
                attributes: ['id', 'name', 'email']
            },{
                model: AuctionsModel,
                as: 'auction',
                attributes: ['project_id', 'bidding_started_at', 'bidding_deadline', 'status'],
                include: [{
                    model: ProjectsModel,
                    as: 'project',
                    attributes: ['id', 'project_name', 'description', 'budget', 'company_id'],
                    include: [{
                        model: UsersModel,
                        as: 'company',
                        attributes: ['id', 'name', 'email']
                    }]
                }]
            }]
        })

    res.status(200).json({
        success: true,
        message: "Auctions obtenidas exitosamente",
        data
    })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener las subastas",
            error: error.message
        });
    }
}