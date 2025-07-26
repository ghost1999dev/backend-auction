import { 
  processBidsFromPostgres, 
  processBidsFromFirebase, 
  compareBidSources, 
  createBidInBothSources,
  getBidsBySource
} from "../services/bidSourceService.js";

/**
 * @desc    Obtener pujas de una fuente específica
 * @route   GET /bids/source/:auctionId
 * @access  Public
 * @param   {string} req.params.auctionId - ID de la subasta
 * @param   {string} req.query.source - Fuente de datos ('postgres' o 'firebase')
 * @returns {Object} Lista de pujas desde la fuente especificada
 */
export const getBidsFromSource = async (req, res) => {
  try {
    const auctionId = parseInt(req.params.auctionId, 10);
    
    if (isNaN(auctionId)) {
      return res.status(400).json({
        message: "ID de subasta inválido",
        status: 400
      });
    }
    
    const { source = 'postgres' } = req.query;
    
    const { bids, source: dataSource } = await getBidsBySource(auctionId, source);
    
    return res.status(200).json({ 
      message: `Pujas obtenidas exitosamente desde ${dataSource}`, 
      status: 200, 
      data: bids 
    });
  } catch (error) {
    if (error.message.includes('Fuente de datos no válida')) {
      return res.status(400).json({ 
        message: error.message, 
        status: 400 
      });
    }
    
    return res.status(500).json({ 
      message: "Error al obtener las pujas", 
      status: 500 
    });
  }
};

/**
 * @desc    Comparar pujas entre diferentes fuentes de datos
 * @route   GET /bids/compare/:auctionId
 * @access  Public
 * @param   {string} req.params.auctionId - ID de la subasta
 * @returns {Object} Comparación de pujas entre fuentes
 */
export const compareSourceBids = async (req, res) => {
  try {    
    const auctionId = parseInt(req.params.auctionId, 10);
    
    if (isNaN(auctionId)) {
      return res.status(400).json({
        message: "ID de subasta inválido",
        status: 400
      });
    }
    
    const comparison = await compareBidSources(auctionId);
    
    return res.status(200).json({ 
      message: "Comparación de fuentes completada", 
      status: 200, 
      data: comparison 
    });
  } catch (error) {
    return res.status(500).json({ 
      message: "Error al comparar las fuentes de datos", 
      status: 500,
      error: error.message 
    });
  }
};

/**
 * @desc    Crear puja en ambas fuentes de datos
 * @route   POST /bids/dual
 * @access  Private
 * @param   {Object} req.body - Datos de la puja a crear
 * @returns {Object} Resultado de la creación en ambas fuentes
 */
/**
 * @desc    Crear puja en ambas fuentes de datos
 * @route   POST /bids/dual
 * @access  Private
 * @param   {Object} req.body - Datos de la puja a crear
 * @returns {Object} Resultado de la creación en ambas fuentes
 */
export const createBidDual = async (req, res) => {
  try {
    const { auction_id, developer_id, amount } = req.body;
    
    // Validar y convertir los IDs a números
    const numericAuctionId = parseInt(auction_id, 10);
    const numericDeveloperId = parseInt(developer_id, 10);
    
    if (isNaN(numericAuctionId) || isNaN(numericDeveloperId)) {
      return res.status(400).json({
        message: "Los IDs de subasta y desarrollador deben ser números válidos",
        status: 400
      });
    }
    
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        message: "El monto debe ser un número positivo",
        status: 400
      });
    }
    
    const bid = {
      auctionId: numericAuctionId,
      developerId: numericDeveloperId,
      amount: amount
    };
    
    const result = await createBidInBothSources(bid);
    
    return res.status(201).json({
      message: "Puja creada exitosamente en ambas fuentes",
      status: 201,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al crear la puja en ambas fuentes",
      status: 500
    });
  }
};

/**
 * @desc    Obtener pujas directamente del repositorio especificado
 * @route   GET /bids/repository/:auctionId/:repositoryType
 * @access  Public
 * @param   {string} req.params.auctionId - ID de la subasta
 * @param   {string} req.params.repositoryType - Tipo de repositorio ('postgres' o 'firebase')
 * @returns {Object} Lista de pujas directamente del repositorio
 */
export const getBidsFromRepository = async (req, res) => {
  try {
    const auctionId = parseInt(req.params.auctionId, 10);
    
    if (isNaN(auctionId)) {
      return res.status(400).json({
        message: "ID de subasta inválido",
        status: 400
      });
    }
    
    const { repositoryType } = req.params;
    const validRepositoryTypes = ['postgres', 'firebase'];
    
    if (!validRepositoryTypes.includes(repositoryType)) {
      return res.status(400).json({
        message: "Tipo de repositorio no válido. Use 'postgres' o 'firebase'",
        status: 400
      });
    }
    
    const data = repositoryType === 'postgres' 
      ? await processBidsFromPostgres(auctionId)
      : await processBidsFromFirebase(auctionId);
    
    return res.status(200).json({
      message: `Datos obtenidos exitosamente del repositorio ${repositoryType}`,
      status: 200,
      data
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener datos del repositorio",
      status: 500
    });
  }
};
