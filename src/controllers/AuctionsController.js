import AuctionModel from "../models/AuctionModel.js";
import ProjectsModel from "../models/ProjectsModel.js";
import { Op } from "sequelize";

// Constantes para estados
const AUCTION_STATUS = {
  PENDING: 0,
  ACTIVE: 1, 
  COMPLETED: 2,
  CANCELLED: 3
};

// Transiciones válidas de estado
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
export const createAuction = async (req, res, next) => {
    try {
        const { project_id } = req.body;
        
        const project = await ProjectsModel.findByPk(project_id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Proyecto no encontrado",
                error: "project_not_found"
            });
        }

        const existingAuction = await AuctionModel.findOne({
            where: { project_id }
        });

        if (existingAuction) {
            return res.status(409).json({
                success: false,
                message: "Ya existe una subasta para este proyecto",
                error: "auction_exists"
            });
        }

        const auction = await AuctionModel.create({
            ...req.body,
            status: AUCTION_STATUS.PENDING
        });

        return res.status(201).json({
            success: true,
            message: "Subasta creada exitosamente",
            data: auction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
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
        const auctions = await AuctionModel.findAll({ 
            attributes: ['id', 'project_id', 'status', 'createdAt', 'updatedAt'],
            where, 
            order: [["createdAt", "DESC"]],
            include: [{
                model: ProjectsModel,
                as: 'project',
                attributes: ['project_name', 'description', 'budget'] // Cambiado 'name' por 'project_name'
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
        const auction = await AuctionModel.findByPk(req.params.id, {
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
        const { status } = req.body;

        const auction = await AuctionModel.findByPk(id);
        if (!auction) {
            return res.status(404).json({
                success: false,
                message: "Subasta no encontrada"
            });
        }

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
        }

        const updatedAuction = await auction.update({
            ...req.body,
            status: Number(status),
            updatedAt: new Date()  // Cambiado de updated_at a updatedAt
        });

        return res.json({
            success: true,
            data: updatedAuction
        });

    } catch (error) {
        next(error);
    }
};

export const deleteAuction = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const auction = await AuctionModel.findByPk(id);
        if (!auction) {
            return res.status(404).json({ 
                success: false,
                message: "Subasta no encontrada"
            });
        }

        // Solo permitir eliminar en estados pendiente o cancelada
        if (![STATUS.PENDING, STATUS.CANCELLED].includes(Number(auction.status))) {
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
