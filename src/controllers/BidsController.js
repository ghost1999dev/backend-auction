// src/controllers/BidController.js

import BidsModel      from "../models/BidsModel.js";
import AuctionsModel  from "../models/AuctionsModel.js";
import UsersModel    from "../models/UsersModel.js";

const AUCTION_STATUS = {
  PENDING: 0,
  ACTIVE:  1,
  CLOSED:  2
};

/**
 * @desc    Valida que una subasta exista y esté en estado válido para pujas
 * @param   {Object} req - Request object
 * @param   {Object} res - Response object
 * @param   {number} auctionId - ID de la subasta a validar
 * @returns {Promise<Object|null>} Objeto subasta si es válida, null si no
 */
async function ensureLiveAuction(req, res, auctionId) {
  const auction = await AuctionsModel.findByPk(auctionId);
  if (!auction) {
    res.status(404).json({ 
      message: "Subasta no encontrada", 
      status: 404 
    });
    return null;
  }

  if (auction.status !== AUCTION_STATUS.ACTIVE) {
    res.status(400).json({ 
      message: "La subasta no está activa", 
      status: 400 
    });
    return null;
  }

  const now = new Date();
  const start = auction.bidding_started_at ? new Date(auction.bidding_started_at) : null;
  const end = auction.bidding_deadline ? new Date(auction.bidding_deadline) : null;

  if (start && now < start) {
    res.status(422).json({ 
      message: "La subasta aún no ha iniciado", 
      status: 422 
    });
    return null;
  }

  if (end && now > end) {
    res.status(422).json({ 
      message: "La subasta ya ha finalizado", 
      status: 422 
    });
    return null;
  }

  return auction;
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
    const { auction_id, developer_id, amount } = req.body;

    if (!auction_id || !developer_id || amount == null) {
      return res.status(400).json({
        message: "Faltan campos requeridos",
        status: 400
      });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        message: "El monto debe ser un número positivo",
        status: 400
      });
    }

    const auction = await ensureLiveAuction(req, res, auction_id);
    if (!auction) return;

    const developer = await UsersModel.findByPk(developer_id);
    if (!developer) {
      return res.status(404).json({ 
        message: "Desarrollador no encontrado", 
        status: 404 
      });
    }

    const exists = await BidsModel.findOne({ where:{ auction_id, developer_id } });
    if (exists) {
      return res.status(409).json({ 
        message: "Ya existe una puja para esta subasta", 
        status: 409 
      });
    }

    const bid = await BidsModel.create({ auction_id, developer_id, amount });
    return res.status(201).json({
      message: "Puja creada exitosamente",
      status: 201,
      data: bid
    });

  } catch (err) {
    res.status(500).json({
      message: "Error al procesar la solicitud",
      status: 500
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
    const where = {};
    
    // Convertir auction_id a número si está presente
    if (req.query.auction_id) {
      const numericAuctionId = parseInt(req.query.auction_id, 10);
      if (!isNaN(numericAuctionId)) {
        where.auction_id = numericAuctionId;
      } else {
        return res.status(400).json({
          message: "ID de subasta inválido",
          status: 400
        });
      }
    }
    
    // Convertir developer_id a número si está presente
    if (req.query.developer_id) {
      const numericDeveloperId = parseInt(req.query.developer_id, 10);
      if (!isNaN(numericDeveloperId)) {
        where.developer_id = numericDeveloperId;
      } else {
        return res.status(400).json({
          message: "ID de desarrollador inválido",
          status: 400
        });
      }
    }
    
    console.log("Buscando pujas con criterios:", where);

    const bids = await BidsModel.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
        { model: AuctionsModel, as: "auction",   attributes: ["id","status"] },
        { model: UsersModel,   as: "developer", attributes: ["id","name","email"] }
      ]
    });

    return res.json({ message: "Pujas obtenidas exitosamente", status: 200, count: bids.length, data: bids });
  } catch (err) {
    res.status(500).json({
      message: "Error al obtener las pujas",
      status: 500
    });
  }
};

/**
 * GET /bids/:id
 */
export const getBid = async (req, res, next) => {
  try {
    const bidId = parseInt(req.params.id, 10);
    
    if (isNaN(bidId)) {
      return res.status(400).json({
        message: "ID de puja inválido",
        status: 400
      });
    }
    
    const bid = await BidsModel.findByPk(bidId, {
      include: [
        { model: AuctionsModel, as: "auction",   attributes: ["id","status"] },
        { model: UsersModel,   as: "developer", attributes: ["id","name","email"] }
      ]
    });
    if (!bid) {
      return res.status(404).json({ message: "Puja no encontrada", status: 404 });
    }
    return res.json({ message: "Puja encontrada", status: 200, data: bid });
  } catch (err) {
    res.status(500).json({
      message: "Error al obtener la puja",
      status: 500
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
    const bid = await BidsModel.findByPk(req.params.id, {
      attributes: ['id', 'auction_id', 'amount', 'createdAt', 'updatedAt']
    });

    if (!bid) {
      return res.status(404).json({ 
        message: "Puja no encontrada", 
        status: 404 
      });
    }

    if (req.user && bid.developer_id !== req.user.id) {
      return res.status(403).json({ 
        message: "Sin permiso", 
        status: 403 
      });
    }

    const { amount } = req.body;
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ 
        message: "Monto inválido", 
        status: 400 
      });
    }

    const auction = await AuctionsModel.findByPk(bid.auction_id, {
      attributes: ['id', 'project_id', 'bidding_started_at', 'bidding_deadline', 'status']
    });

    if (!auction || auction.status !== AUCTION_STATUS.ACTIVE) {
      return res.status(400).json({
        message: "La subasta no está activa",
        status: 400
      });
    }

    await bid.update({ amount });

    return res.status(200).json({ 
      message: "Puja actualizada exitosamente",
      status: 200,
      data: bid 
    });

  } catch (err) {
    res.status(500).json({
      message: "Error al actualizar la puja",
      status: 500
    });
  }
};

/**
 * DELETE /bids/delete/:id
 */
export const deleteBid = async (req, res, next) => {
  try {
    const bid = await BidsModel.findByPk(req.params.id);
    if (!bid) {
      return res.status(404).json({ message: "Puja no encontrada", status: 404 });
    }

    if (req.user && bid.developer_id !== req.user.id) {
      return res.status(403).json({ message: "Sin permiso", status: 403 });
    }

    const auction = await ensureLiveAuction(req, res, bid.auction_id);
    if (!auction) return;

    await bid.destroy();
    return res.json({ message: "Puja eliminada exitosamente", status: 200 });
  } catch (err) {
    next(err);
  }
};
