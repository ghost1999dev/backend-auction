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
      error: "auction_not_active" 
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
      error: "auction_not_started" 
    });
    return null;
  }

  if (end && now > end) {
    res.status(422).json({ 
      success: false, 
      message: "La subasta ya ha finalizado", 
      error: "auction_ended" 
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
        success: false,
        message: "Faltan campos requeridos",
        error: "missing_fields"
      });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "El monto debe ser un número positivo",
        error: "invalid_amount"
      });
    }

    const auction = await ensureLiveAuction(req, res, auction_id);
    if (!auction) return;

    const developer = await UsersModel.findByPk(developer_id);
    if (!developer) {
      return res.status(404).json({ 
        success: false, 
        message: "Desarrollador no encontrado", 
        error: "developer_not_found" 
      });
    }

    const exists = await BidsModel.findOne({ where:{ auction_id, developer_id } });
    if (exists) {
      return res.status(409).json({ 
        success: false, 
        message: "Ya existe una puja para esta subasta", 
        error: "bid_exists" 
      });
    }

    const bid = await BidsModel.create({ auction_id, developer_id, amount });
    return res.status(201).json({
      success: true,
      message: "Puja creada exitosamente",
      data: bid
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: err.message
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

    const bids = await BidModel.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
        { model: AuctionsModel, as: "auction",   attributes: ["id","status"] },
        { model: UsersModel,   as: "developer", attributes: ["id","name","email"] }
      ]
    });

    return res.json({ success: true, count: bids.length, data: bids });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /bids/:id
 */
export const getBid = async (req, res, next) => {
  try {
    const bid = await BidsModel.findByPk(req.params.id, {
      include: [
        { model: AuctionsModel, as: "auction",   attributes: ["id","status"] },
        { model: UsersModel,   as: "developer", attributes: ["id","name","email"] }
      ]
    });
    if (!bid) {
      return res.status(404).json({ success: false, message: "Puja no encontrada", error: "bid_not_found" });
    }
    return res.json({ success: true, data: bid });
  } catch (err) {
    next(err);
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
        success: false, 
        message: "Puja no encontrada", 
        error: "bid_not_found" 
      });
    }

    if (req.user && bid.developer_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Sin permiso", 
        error: "permission_denied" 
      });
    }

    const { amount } = req.body;
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Monto inválido", 
        error: "invalid_amount" 
      });
    }

    const auction = await AuctionsModel.findByPk(bid.auction_id, {
      attributes: ['id', 'project_id', 'bidding_started_at', 'bidding_deadline', 'status']
    });

    if (!auction || auction.status !== AUCTION_STATUS.ACTIVE) {
      return res.status(400).json({
        success: false,
        message: "La subasta no está activa",
        error: "auction_not_active"
      });
    }

    await bid.update({ amount });

    return res.status(200).json({ 
      success: true, 
      message: "Puja actualizada exitosamente",
      data: bid 
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar la puja",
      error: err.message
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
