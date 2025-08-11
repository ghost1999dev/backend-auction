import BidsModel      from "../models/BidsModel.js";
import AuctionsModel  from "../models/AuctionsModel.js";
import UsersModel    from "../models/UsersModel.js";
import BlockchainService from "../services/blockchainService.mjs";

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
  const { auction_id, developer_id, amount } = data;

  if (!auction_id || !developer_id || amount == null) {
    return {
      status: 400,
      success: false,
      message: "Faltan campos requeridos (auction_id, developer_id, amount)",
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

  if (!Number.isInteger(Number(auction_id)) || !Number.isInteger(Number(developer_id))) {
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
    const { auction_id, developer_id, amount } = req.body;

  

    const validationError = validateBidData({ auction_id, developer_id, amount });
    if (validationError) {
      return res.status(validationError.status).json(validationError);
    }

    const auction = await ensureLiveAuction(req, res, auction_id);
    if (!auction) return;

    const developer = await UsersModel.findByPk(developer_id, {
      attributes: ['id', 'name', 'email', 'status']
    });
    
    if (!developer) {
      return res.status(404).json({ 
        success: false, 
        message: "Desarrollador no encontrado", 
        error: "developer_not_found" 
      });
    }

    const existingBid = await BidsModel.findOne({ 
      where: { auction_id, developer_id },
      attributes: ['id', 'amount']
    });
    
    if (existingBid) {
      return res.status(409).json({ 
        success: false, 
        message: "Ya existe una puja para esta subasta", 
        error: "bid_exists",
        details: { existing_bid_id: existingBid.id, existing_amount: existingBid.amount }
      });
    }

    const blockchainBid = await BlockchainService.createBidOnChain({ auction_id, developer_id, amount })

    // Crear la puja
    const bid = await BidsModel.create({ 
      auction_id: Number(auction_id), 
      developer_id: Number(developer_id), 
      amount: Number(amount) 
    });

    return res.status(201).json({
      success: true,
      message: "Puja creada exitosamente",
      bid: blockchainBid,
      data: {
        id: bid.id,
        auction_id: bid.auction_id,
        developer_id: bid.developer_id,
        amount: bid.amount,
        createdAt: bid.createdAt,
        updatedAt: bid.updatedAt
      }
    });

  } catch (err) {
    console.error('Error en createBid:', err);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor al crear la puja",
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
        { model: AuctionsModel, as: "auction",   attributes: ["id","status"] },
        { model: UsersModel,   as: "developer", attributes: ["id","name","email"] }
      ]
    });

    return res.json({ success: true, count: bids.length, data: bids });
  } catch (err) {
    next(err);
  }
};

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
 * @desc    Crear puja usando PostgreSQL y Firebase en la misma ruta
 * @route   POST /bids/dual-create
 * @access  Private
 * @param   {Object} req.body.auction_id - ID de la subasta
 * @param   {Object} req.body.developer_id - ID del desarrollador
 * @param   {Object} req.body.amount - Monto de la puja
 * @param   {string} req.query.storage - "postgresql" o "firebase" para especificar la base de datos
 * @returns {Object} Puja creada o mensaje de error
 */
export const createBidDual = async (req, res, next) => {
  try {
    const { auction_id, developer_id, amount } = req.body;
    const { storage = "postgresql" } = req.query;

    const validationError = validateBidData({ auction_id, developer_id, amount });
    if (validationError) {
      return res.status(validationError.status).json(validationError);
    }

    const validStorageTypes = ['postgresql', 'firebase'];
    if (!validStorageTypes.includes(storage.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Tipo de storage inválido. Use 'postgresql' o 'firebase'",
        error: "invalid_storage",
        valid_types: validStorageTypes
      });
    }

    const auction = await ensureLiveAuction(req, res, auction_id);
    if (!auction) return;

    const developer = await UsersModel.findByPk(developer_id, {
      attributes: ['id', 'name', 'email', 'status']
    });
    
    if (!developer) {
      return res.status(404).json({ 
        success: false, 
        message: "Desarrollador no encontrado", 
        error: "developer_not_found" 
      });
    }

    const normalizedStorage = storage.toLowerCase();
    const numericData = {
      auction_id: Number(auction_id),
      developer_id: Number(developer_id),
      amount: Number(amount)
    };
    

    if (normalizedStorage === "firebase") {
      const existingBid = await FirebaseService.findExistingBid(numericData.auction_id, numericData.developer_id);
      if (existingBid) {
        return res.status(409).json({ 
          success: false, 
          message: "Ya existe una puja para esta subasta en Firebase", 
          error: "bid_exists",
          details: { existing_bid_id: existingBid.id, existing_amount: existingBid.amount }
        });
      }

      const firebaseBid = await FirebaseService.createBid(numericData);
      return res.status(201).json({
        success: true,
        message: "Puja creada exitosamente en Firebase",
        data: firebaseBid,
        storage: "firebase"
      });

    } else if (normalizedStorage === "blockchain") {
    const existingOnChain = await BlockchainService.getBidsByAuction(numericData.auction_id);
    if (existingOnChain.some(b => b.developer_id === numericData.developer_id)) {
      return res.status(409).json({
        success: false,
        message: "Ya existe una puja para esta subasta en Blockchain",
        error: "bid_exists",
        details: {}
      });
    } 
  
    const blockchainBid = await BlockchainService.createBidOnChain(numericData);
    return res.status(201).json({
      success: true,
      message: "Puja creada exitosamente en Blockchain",
      data: blockchainBid,
      storage: "blockchain"
    });

  } else { 
      const existingBid = await BidsModel.findOne({ 
        where: { auction_id: numericData.auction_id, developer_id: numericData.developer_id },
        attributes: ['id', 'amount']
      });
      
      if (existingBid) {
        return res.status(409).json({ 
          success: false, 
          message: "Ya existe una puja para esta subasta en PostgreSQL", 
          error: "bid_exists",
          details: { existing_bid_id: existingBid.id, existing_amount: existingBid.amount }
        });
      }

      const bid = await BidsModel.create(numericData);
      return res.status(201).json({
        success: true,
        message: "Puja creada exitosamente en PostgreSQL",
        data: {
          id: bid.id,
          auction_id: bid.auction_id,
          developer_id: bid.developer_id,
          amount: bid.amount,
          createdAt: bid.createdAt,
          updatedAt: bid.updatedAt
        },
        storage: "postgresql"
      });
    }

  } catch (err) {
    console.error('Error en createBidDual:', err);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor al crear la puja dual",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

/**
 * @desc    Listar pujas desde PostgreSQL y Firebase en la misma ruta
 * @route   GET /bids/dual-list
 * @access  Public
 * @param   {number} req.query.auction_id - Filtrar por subasta
 * @param   {number} req.query.developer_id - Filtrar por desarrollador
 * @param   {string} req.query.storage - "postgresql", "firebase" o "both" para especificar la base de datos
 * @param   {number} req.query.limit - Límite de resultados (por defecto 100)
 * @param   {number} req.query.offset - Offset para paginación (por defecto 0)
 * @returns {Object} Lista de pujas o mensaje de error
 */
export const listBidsDual = async (req, res, next) => {
  try {
    const { 
      auction_id, 
      developer_id, 
      storage = "both",
      limit = 100,
      offset = 0
    } = req.query;


    const validStorageTypes = ['postgresql', 'firebase', 'blockchain', 'both'];
    if (!validStorageTypes.includes(storage.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Tipo de storage inválido. Use 'postgresql', 'firebase' o 'both'",
        error: "invalid_storage",
        valid_types: validStorageTypes
      });
    }

    
    const numLimit = Math.min(Math.max(Number(limit) || 100, 1), 1000);
    const numOffset = Math.max(Number(offset) || 0, 0);

    const where = {};
    const firebaseFilters = {};
    
    if (auction_id && Number.isInteger(Number(auction_id))) {
      where.auction_id = Number(auction_id);
      firebaseFilters.auction_id = Number(auction_id);
    }
    
    if (developer_id && Number.isInteger(Number(developer_id))) {
      where.developer_id = Number(developer_id);
      firebaseFilters.developer_id = Number(developer_id);
    }

    const normalizedStorage = storage.toLowerCase();
    let result = {
      success: true,
      pagination: {
        limit: numLimit,
        offset: numOffset
      },
      data: {
        postgresql: [],
        firebase: [],
        combined: []
      },
      storage: normalizedStorage
    };

    if (normalizedStorage === "postgresql" || normalizedStorage === "both") {
      try {
        const pgBids = await BidsModel.findAll({
          where,
          order: [["createdAt", "DESC"]],
          limit: numLimit,
          offset: numOffset,
          include: [
            { model: AuctionsModel, as: "auction", attributes: ["id", "status"] },
            { model: UsersModel, as: "developer", attributes: ["id", "name", "email"] }
          ]
        });
        
        result.data.postgresql = pgBids.map(bid => ({
          ...bid.toJSON(),
          source: "postgresql"
        }));
        
        if (normalizedStorage === "both") {
          result.data.combined = [...result.data.combined, ...result.data.postgresql];
        }
      } catch (pgError) {
        console.error("Error al obtener pujas de PostgreSQL:", pgError.message);
        if (normalizedStorage === "postgresql") {
          return res.status(500).json({
            success: false,
            message: "Error al obtener pujas de PostgreSQL",
            error: process.env.NODE_ENV === 'development' ? pgError.message : 'Database error'
          });
        }
      
        result.errors = result.errors || [];
        result.errors.push({
          source: "postgresql",
          error: "Error al obtener datos de PostgreSQL"
        });
      }
    }

    if (normalizedStorage === "firebase" || normalizedStorage === "both") {
      try {
        const firebaseBids = await FirebaseService.getBids(firebaseFilters);
        
        const paginatedFirebaseBids = firebaseBids
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(numOffset, numOffset + numLimit);
        
        result.data.firebase = paginatedFirebaseBids.map(bid => ({
          ...bid,
          source: "firebase"
        }));
        
        if (normalizedStorage === "both") {
          result.data.combined = [...result.data.combined, ...result.data.firebase];
        }
      } catch (fbError) {
        console.error("Error al obtener pujas de Firebase:", fbError.message);
        if (normalizedStorage === "firebase") {
          return res.status(500).json({
            success: false,
            message: "Error al obtener pujas de Firebase",
            error: process.env.NODE_ENV === 'development' ? fbError.message : 'Firebase error'
          });
        }
        
        result.errors = result.errors || [];
        result.errors.push({
          source: "firebase",
          error: "Error al obtener datos de Firebase"
        });
      }
    }

    if (normalizedStorage === "blockchain" || normalizedStorage === "both") {
      try {
        let blockchainBids = [];
        if (firebaseFilters.auction_id) {
          blockchainBids = await BlockchainService.getBidsByAuction(firebaseFilters.auction_id);
        } else if (firebaseFilters.developer_id) {
          blockchainBids = await BlockchainService.getBidsByDeveloper(firebaseFilters.developer_id);
        } else {
          blockchainBids = await BlockchainService.getAllBids();
        }

        const paginated = blockchainBids
          .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(numOffset, numOffset + numLimit);

        result.data.blockchain = paginated;
        if (normalizedStorage === "both") {
          result.data.combined = [...result.data.combined, ...result.data.blockchain];
        }
      } catch (bcError) {
        console.error("Error al obtener pujas de Blockchain:", bcError.message);
        if (normalizedStorage === "blockchain") {
          return res.status(500).json({
            success: false,
            message: "Error al obtener pujas de Blockchain",
            error: process.env.NODE_ENV === 'development' ? bcError.message : 'Blockchain error'
          });
        }
        result.errors = result.errors || [];
        result.errors.push({ source: "blockchain", error: "Error al obtener datos de Blockchain" });
      }
    }    

    
    if (normalizedStorage === "both" && result.data.combined.length > 0) {
      result.data.combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    let responseData;
    let count;
    
    if (normalizedStorage === "postgresql") {
      responseData = result.data.postgresql;
      count = result.data.postgresql.length;
    } else if (normalizedStorage === "firebase") {
      responseData = result.data.firebase;
      count = result.data.firebase.length;
    } else {
      responseData = result.data;
      count = {
        postgresql: result.data.postgresql.length,
        firebase: result.data.firebase.length,
        total: result.data.combined.length
      };
    }

    const response = { 
      success: true, 
      count: count, 
      data: responseData,
      storage: normalizedStorage,
      pagination: result.pagination
    };

    if (result.errors && result.errors.length > 0) {
      response.partial_errors = result.errors;
    }

    return res.json(response);

  } catch (err) {
    console.error('Error en listBidsDual:', err);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor al obtener las pujas",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};
