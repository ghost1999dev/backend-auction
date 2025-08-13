import BidsModel      from "../models/BidsModel.js";
import AuctionsModel  from "../models/AuctionsModel.js";
import UsersModel    from "../models/UsersModel.js";
// import BlockchainService from "../services/blockchainService.mjs";
import DevelopersModel from "../models/DevelopersModel.js";
import ProjectsModel from "../models/ProjectsModel.js";
import CompaniesModel from "../models/CompaniesModel.js";
import WinnerModel from "../models/WinnerModel.js";
import { sendWinnerEmail } from "../services/emailService.js";
import signImage from "../helpers/signImage.js";

const AUCTION_STATUS = {
  PENDING: 0,
  ACTIVE:  1,
  CLOSED:  2
};

/**
 * @desc    Valida los datos básicos de una puja
 * @param   {Object} data - Datos de la puja
 * @returns {Object|null} Error de validación o null si es válido
 */
const validateBidData = (data) => {
  const { auction_id, user_id, amount } = data;
  if (!auction_id || !user_id || amount == null) {
    return {
      status: 400,
      success: false,
      message: "Faltan campos requeridos (auction_id, user_id, amount)",
      error: "missing_fields"
    };
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0 || !isFinite(numAmount)) {
    return {
      status: 400,
      success: false,
      message: "El monto debe ser un número positivo válido",
      error: "invalid_amount"
    };
  }
  if (!Number.isInteger(Number(auction_id)) || !Number.isInteger(Number(user_id))) {
    return {
      status: 400,
      success: false,
      message: "Los IDs deben ser números enteros válidos",
      error: "invalid_ids"
    };
  }
  return null;
};

/**
 * @desc    Valida que una subasta exista y esté en estado válido para pujas
 * @param   {Object} req - Request object
 * @param   {Object} res - Response object
 * @param   {number} auctionId - ID de la subasta a validar
 * @returns {Promise<Object|null>} Objeto subasta si es válida, null si no
 */
async function ensureLiveAuction(req, res, auctionId) {
  try {
    const auction = await AuctionsModel.findByPk(auctionId, {
      attributes: ['id', 'project_id', 'bidding_started_at', 'bidding_deadline', 'status']
    });

    if (!auction) {
      res.status(404).json({ 
        success: false, 
        message: "Subasta no encontrada", 
        error: "auction_not_found" 
      });
      return null;
    }

    if (auction.status !== AUCTION_STATUS.ACTIVE) {
      res.status(400).json({ 
        success: false,
        message: "La subasta no está activa", 
        error: "auction_not_active",
        details: { current_status: auction.status, required_status: AUCTION_STATUS.ACTIVE }
      });
      return null;
    }

    const now = new Date();
    const start = auction.bidding_started_at ? new Date(auction.bidding_started_at) : null;
    const end = auction.bidding_deadline ? new Date(auction.bidding_deadline) : null;

    if (start && now < start) {
      res.status(422).json({ 
        success: false, 
        message: "La subasta aún no ha iniciado", 
        error: "auction_not_started",
        details: { start_time: start, current_time: now }
      });
      return null;
    }

    if (end && now > end) {
      res.status(422).json({ 
        success: false,
        message: "La subasta ya ha finalizado", 
        error: "auction_ended",
        details: { end_time: end, current_time: now }
      });
      return null;
    }

    return auction;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al validar la subasta",
      error: error.message
    });
    return null;
  }
}

/**
 * @desc    Crear una nueva puja en una subasta
 * @route   POST /bids/create
 * @access  Private
 * @param   {Object} req.body.auction_id - ID de la subasta
 * @param   {Object} req.body.developer_id - ID del desarrollador
 * @param   {Object} req.body.amount - Monto de la puja
 * @returns {Object} Puja creada o mensaje de error
 */
export const createBid = async (req, res, next) => {
  try {
    const { auction_id, user_id, amount } = req.body;
    if (!auction_id || !user_id || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos obligatorios: auction_id, user_id y amount',
        error: 'missing_data'
      });
    }

    const amountNumber = Number(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto de la puja debe ser un número positivo mayor que cero',
        error: 'invalid_amount'
      });
    }

    const auction = await AuctionsModel.findByPk(auction_id);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'La subasta no existe',
        error: 'auction_not_found'
      });
    }
    if (auction.status !== 1) {
      return res.status(409).json({
        success: false,
        message: 'La subasta ya no está abierta para pujas, ya hay ganadores',
        error: 'auction_closed'
      });
    }

    const devProfile = await DevelopersModel.findOne({ where: { user_id } });
    if (!devProfile) {
      return res.status(400).json({
        success: false,
        message: 'El usuario no tiene perfil de desarrollador, no se puede crear la puja',
        error: 'dev_profile_not_found'
      });
    }

    const highestBid = await BidsModel.findOne({
      where: { auction_id, developer_id: user_id },
      order: [['amount', 'ASC']]  
    });

    if (highestBid) {
      if (amountNumber === Number(highestBid.amount)) {
        return res.status(409).json({
          success: false,
          message: 'Ya realizaste una puja con esa misma cantidad para esta subasta',
          error: 'same_amount_bid_exists'
        });
      }
      if (amountNumber > Number(highestBid.amount)) {
        return res.status(409).json({
          success: false,
          message: `El monto de la nueva puja debe ser menor que tu puja anterior (${highestBid.amount})`,
          error: 'higher_amount_not_allowed'
        });
      }
    }

    const bid = await BidsModel.create({
      auction_id: Number(auction_id),
      developer_id: Number(user_id),
      amount: amountNumber,
      status: 0
    });

    return res.status(201).json({
      success: true,
      message: 'Puja creada exitosamente',
      data: bid
    });

  } catch (err) {
    console.error('Error en createBid:', err);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear la puja',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};



/**
 * @desc    Obtener listado de pujas
 * @route   GET /bids/show/all
 * @access  Public
 * @param   {number} req.query.auction_id - Filtrar por subasta
 * @param   {number} req.query.developer_id - Filtrar por desarrollador
 * @returns {Object} Lista de pujas o mensaje de error
 */
export const listBids = async (req, res, next) => {
  try {
    const { auction_id, developer_id } = req.query;
    const where = {};
    if (auction_id)   where.auction_id   = auction_id;
    if (developer_id) where.developer_id = developer_id; 

    const bids = await BidsModel.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
    { 
          model: AuctionsModel, 
          as: "auction", 
          attributes: ["id", "status", "project_id", "bidding_started_at", "bidding_deadline"],
          include: [
            {
              model: ProjectsModel,
              as: "project",
              attributes: ["id", "project_name", "description", "budget", "company_id"],
              include: [
                {
                  model: UsersModel,
                  as: "company",
                  attributes: ["id", "name", "email"]
                }
              ]
            }
          ]
        },
        { 
          model: DevelopersModel, 
          as: "developer_profile", 
          attributes: ["id", "user_id"],
          include: [{
            model: UsersModel,
            as: "user",
            attributes: ["id", "name", "email"]
          }]
        }
      ]
    });

    return res.json({ 
      success: true, 
      count: bids.length, 
      data: bids 
    });
  } catch (err) {
    console.error('Error en listBids:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las pujas',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};


/**
 * @desc    Listar pujas por subasta
 * @route   GET /bids/show/by-auction
 * @access  Public
 * @param   {number} req.query.auction_id - Filtrar por subasta
 * @param   {number} req.query.developer_id - Filtrar por desarrollador
 * @returns {Object} Lista de pujas o mensaje de error
 */
export const listBidsByAuction = async (req, res, next) => {
  try {
    const { id: auction_id } = req.params;
    const { developer_id } = req.query;

    if (!auction_id) {
      return res.status(400).json({
        success: false,
        message: "El parámetro auction_id es obligatorio",
        error: "missing_auction_id"
      });
    }

    const where = { auction_id };
    if (developer_id) {
      where.developer_id = developer_id;
    }

    const bids = await BidsModel.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: AuctionsModel,
          as: "auction",
          attributes: [
            "id", "status", "project_id", "bidding_started_at", "bidding_deadline"
          ],
          include: [
            {
              model: ProjectsModel,
              as: "project",
              attributes: ["id", "project_name", "description", "budget"]
            }
          ]
        },
        {
          model: DevelopersModel,
          as: "developer_profile",
          attributes: ["id", "user_id"],
          include: [{
            model: UsersModel,
            as: "user",
            attributes: ["id", "name", "email"]
          }]
        }
      ]
    });

    return res.json({
      success: true,
      count: bids.length,
      data: bids
    });
  } catch (err) {
    console.error("Error en listBidsByAuction:", err);
    return res.status(500).json({
      success: false,
      message: "Error al obtener las pujas",
      error: process.env.NODE_ENV === "development" ? err.message : "Internal server error"
    });
  }
};
/**
 * @desc    Obtener listado de pujas
 * @route   GET /bids/show/by-auction
 * @access  Public
 * @param   {number} req.query.auction_id - Filtrar por subasta
 * @returns {Object} Lista de pujas o mensaje de error
 */
export const getBid = async (req, res, next) => {
  try {
    const bid = await BidsModel.findByPk(req.params.id, {
      include: [
        { 
          model: AuctionsModel, 
          as: "auction", 
          attributes: ["id", "status", "project_id", "bidding_started_at", "bidding_deadline"],
          include: [
            {
              model: ProjectsModel,
              as: "project",
              attributes: ["id", "project_name", "description", "budget"]
            }
          ]
        },
        { 
          model: DevelopersModel, 
          as: "developer_profile", 
          attributes: ["id", "user_id"],
          include: [{
            model: UsersModel,
            as: "user",
            attributes: ["id", "name", "email"]
          }]
        }
      ]
    });

    if (!bid) {
      return res.status(404).json({ success: false, message: "Puja no encontrada", error: "bid_not_found" });
    }

    return res.json({ success: true, data: bid });
  } catch (err) {
    console.error('Error en getBid:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la puja',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

/**
 * @desc    Actualizar monto de una puja
 * @route   PUT /bids/update/:id
 * @access  Private
 * @param   {string} req.params.id - ID de la puja
 * @param   {number} req.body.amount - Nuevo monto
 * @returns {Object} Puja actualizada o mensaje de error
 */
export const updateBid = async (req, res, next) => {
  try {
    const bidId = req.params.id;
    const { amount } = req.body;

    if (!bidId || !Number.isInteger(Number(bidId))) {
      return res.status(400).json({ 
        success: false, 
        message: "ID de puja inválido", 
        error: "invalid_bid_id" 
      });
    }

    const numAmount = Number(amount);
    if (amount == null || isNaN(numAmount) || numAmount <= 0 || !isFinite(numAmount)) {
      return res.status(400).json({ 
        success: false, 
        message: "El monto debe ser un número positivo válido", 
        error: "invalid_amount" 
      });
    }

    const bid = await BidsModel.findByPk(bidId, {
      attributes: ['id', 'auction_id', 'developer_id', 'amount', 'createdAt', 'updatedAt']
    });

    if (!bid) {
      return res.status(404).json({ 
        success: false, 
        message: "Puja no encontrada", 
        error: "bid_not_found" 
      });
    }

    if (req.user && bid.developer_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "No tienes permiso para actualizar esta puja", 
        error: "permission_denied",
        details: { bid_owner: bid.developer_id, current_user: req.user.id }
      });
    }

    
    const auction = await ensureLiveAuction(req, res, bid.auction_id);
    if (!auction) return;

    
    const updatedBid = await bid.update({ amount: numAmount });

    return res.status(200).json({ 
      success: true, 
      message: "Puja actualizada exitosamente",
      data: {
        id: updatedBid.id,
        auction_id: updatedBid.auction_id,
        developer_id: updatedBid.developer_id,
        amount: updatedBid.amount,
        createdAt: updatedBid.createdAt,
        updatedAt: updatedBid.updatedAt
      }
    });

  } catch (err) {
    console.error('Error en updateBid:', err);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor al actualizar la puja",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};


export const deleteBid = async (req, res, next) => {
  try {
    const bid = await BidsModel.findByPk(req.params.id);
    if (!bid) {
      return res.status(404).json({ success: false, message: "Puja no encontrada", error: "bid_not_found" });
    }

    if (req.user && bid.developer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Sin permiso", error: "permission_denied" });
    }

    const auction = await ensureLiveAuction(req, res, bid.auction_id);
    if (!auction) return;

    await bid.destroy();
    return res.json({ success: true, message: "Puja eliminada exitosamente" });
  } catch (err) {
    next(err);
  }
};
/**
 * @swagger
 * /bids/finalize:
 *   post:
 *     tags: [Bids]
 *     summary: Finalizar una subasta
 *     responses:
 *       200:
 *         description: Subasta finalizada
 *       500:
 *         description: Error del servidor
 */
export const finalizarSubasta = async (req, res, next) => {
  try {
    const { auction_id } = req.body;
    if (!auction_id || isNaN(Number(auction_id))) {
      return res.status(400).json({
        success: false,
        message: "El auction_id es obligatorio y debe ser un número válido",
        error: "invalid_auction_id",
      });
    }
    const auction = await AuctionsModel.findByPk(auction_id);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Subasta no encontrada",
        error: "auction_not_found",
      });
    }
    await auction.update({ status: 2 });

    const bids = await BidsModel.findAll({
      where: { auction_id: Number(auction_id) },
      order: [["amount", "ASC"]],
    });

    if (bids.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Subasta finalizada, pero no hay pujas",
      });
    }

    for (let i = 0; i < bids.length; i++) {
      const bid = bids[i];
      const newStatus = i < 3 ? 1 : 2; 
      await bid.update({ status: newStatus });
    }

    return res.status(200).json({
      success: true,
      message: "Subasta finalizada y pujas actualizadas con ganadores y perdedores",
    });
  } catch (err) {
    console.error("Error en finalizarSubasta:", err);
    return res.status(500).json({
      success: false,
      message: "Error interno al finalizar la subasta",
      error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
    });
  }
};
/**
 * @swagger
 * /bids/resultados/{id}:
 *   get:
 *     tags: [Bids]
 *     summary: Obtener resultados de una subasta
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Resultados de la subasta
 *       404:
 *         description: Subasta no encontrada
 *       500:
 *         description: Error del servidor
 */
export const getResultadosSubasta = async (req, res, next) => {
  try {
    const { auction_id } = req.query;
    if (!auction_id || isNaN(Number(auction_id))) {
      return res.status(400).json({
        success: false,
        message: "El auction_id es obligatorio y debe ser un número válido",
        error: "invalid_auction_id",
      });
    }

    const allBids = await BidsModel.findAll({
      where: { auction_id },
      order: [["amount", "ASC"]],
      include: [
        {
          model: DevelopersModel,
          as: "developer_profile",
          include: [
            {
              model: UsersModel,
              as: "user",
              attributes: ["id", "name", "email", "image"],
            },
          ],
          attributes: ["id", "user_id"],
        },
      ],
    });

    const ganadores = [];
    const perdedores = [];
    const developersGanadoresIds = new Set();

    for (const bid of allBids) {
      if (ganadores.length >= 3) break;
      const devId = bid.developer_id;
      if (!developersGanadoresIds.has(devId)) {
        const bidData = bid.toJSON();

        if (bidData.developer_profile?.user?.image) {
          bidData.developer_profile.user.image = await signImage(
            bidData.developer_profile.user.image
          );
        }

        ganadores.push({
          ...bidData,
          status: "Ganador",
        });
        developersGanadoresIds.add(devId);
      }
    }

    const perdedoresIds = new Set(
      allBids
        .filter(bid => !developersGanadoresIds.has(bid.developer_id))
        .map(bid => bid.developer_id)
    );

    for (const devId of perdedoresIds) {
      const devBids = allBids.filter(bid => bid.developer_id === devId);
      if (devBids.length > 0) {
        const lowestBidData = devBids[0].toJSON();

        if (lowestBidData.developer_profile?.user?.image) {
          lowestBidData.developer_profile.user.image = await signImage(
            lowestBidData.developer_profile.user.image
          );
        }

        perdedores.push({
          ...lowestBidData,
          status: "Perdedor",
        });
      }
    }

    const resultados = [...ganadores, ...perdedores];

    return res.status(200).json({
      success: true,
      count: resultados.length,
      data: resultados,
    });
  } catch (err) {
    console.error("Error en getResultadosSubasta:", err);
    return res.status(500).json({
      success: false,
      message: "Error interno al obtener resultados de la subasta",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};

/**
 * @desc    Elegir ganador de una subasta
 * @route   POST /bids/choose-winner
 * @access  Private
 * @param   {number} req.body.auction_id - ID de la subasta
 * @param   {number} req.body.winner_bid_id - ID de la puja ganadora
 * @returns {Object} Mensaje de error o ganador elegido
 */
export const chooseWinner = async (req, res) => {
  try {
    const { auction_id, winner_bid } = req.body;

    if (!auction_id || !winner_bid) {
      return res.status(400).json({
        success: false,
        message: 'auction_id y winner_bid son obligatorios'
      });
    }

    const auction = await AuctionsModel.findByPk(auction_id,
      {
        include: [
          {
            model: ProjectsModel,
            as: "project",
            attributes: ["id", "project_name", "description", "budget", "company_id"],
            include: [
              {
                model: UsersModel,
                as: "company",
                attributes: ["id", "name", "email"]
              }
            ]
          }
        ]
      }
    );
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Subasta no encontrada' });
    }

    const winningBid = await BidsModel.findOne({
      where: { id: winner_bid, auction_id },
      include: [{ model: UsersModel, as: 'user', attributes: ['id', 'name', 'email'] }]
    });

    if (!winningBid) {
      return res.status(404).json({ success: false, message: 'Puja no encontrada para esta subasta' });
    }
    await sendWinnerEmail({
      email: winningBid.user.email,
      name: winningBid.user.name,
      project_name: auction.project.project_name,
      company_name: auction.project.company.name,
      bid_amount: winningBid.amount
    });

    await WinnerModel.create({
      bid_id: winningBid.id,
      auction_id: auction_id,
      winner_id: winningBid.user.id,
      bid_amount: winningBid.amount
    });

    auction.status = 2;
    await auction.save();

    return res.json({
      success: true,
      message: 'Ganador seleccionado, estados actualizados, correo enviado y registro guardado'
    });

  } catch (error) {
    console.error('Error al elegir ganador:', error);
    return res.status(500).json({ success: false, message: 'Error interno', error: error.message });
  }
};


export const getHistorialGanadores = async (req, res) => {
  try {
    const winners = await WinnerModel.findAll({
      include: [
        {
          model: BidsModel,
          as: 'bid',
          attributes: ['id', 'amount', 'status', 'createdAt'],
          include: [
            {
              model: DevelopersModel,
              as: 'developer_profile',
              include: [
                {
                  model: UsersModel,
                  as: 'users',
                  attributes: ['id', 'name', 'email'],
                }
              ]
            }
          ]
        },
        {
          model: AuctionsModel,
          as: 'auction',
          attributes: ['id', 'status', 'bidding_started_at', 'bidding_deadline'],
          include: [
            {
              model: ProjectsModel,
              as: 'project',
              attributes: ['id', 'project_name', 'description', 'budget'],
            },
          ],
        },
        {
          model: UsersModel,
          as: 'winner',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(winners);
  } catch (error) {
    console.error('Error obteniendo historial de ganadores:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


