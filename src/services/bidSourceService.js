/**
 * @fileoverview Servicio para gestionar pujas desde múltiples fuentes de datos (PostgreSQL y Firebase)
 * @module bidSourceService
 */
import PostgresBidRepository from '../repositories/PostgresBidRepository.js';
import FirebaseBidRepository from '../repositories/FirebaseBidRepository.js';

// Instancias de repositorios
const postgresRepo = new PostgresBidRepository();
const firebaseRepo = new FirebaseBidRepository();

/**
 * Procesa pujas de PostgreSQL con formato unificado
 * @param {number|string} auctionId - ID de subasta
 * @returns {Promise<Array>} Lista de pujas normalizadas
 */
export async function processBidsFromPostgres(auctionId) {
  try {
    // Obtener datos directamente del repositorio
    const bids = await postgresRepo.getBidsByAuction(auctionId);
    
    // Procesar datos específicos de PostgreSQL
    return bids.map(bid => ({
      id: bid.id,
      auctionId: bid.auction_id,
      developerId: bid.developer_id,
      amount: parseFloat(bid.amount),
      createdAt: new Date(bid.createdAt),
      formattedDate: new Date(bid.createdAt).toLocaleString(),
      source: 'postgres'
    }));
  } catch (error) {
    throw error;
  }
}

/**
 * Procesa pujas de Firebase con formato unificado
 * @param {number|string} auctionId - ID de subasta
 * @returns {Promise<Array>} Lista de pujas normalizadas
 */
export async function processBidsFromFirebase(auctionId) {
  try {
    // Obtener datos directamente del repositorio
    const bids = await firebaseRepo.getBidsByAuction(auctionId);
    
    // Procesar datos específicos de Firebase
    return bids.map(bid => ({
      id: bid.id,
      auctionId: bid.auctionId,
      developerId: bid.developerId,
      amount: parseFloat(bid.amount),
      createdAt: procesarFirebaseTimestamp(bid.createdAt),
      formattedDate: procesarFirebaseTimestamp(bid.createdAt).toLocaleString(),
      source: 'firebase'
    }));
  } catch (error) {
    throw error;
  }
}

/**
 * Convierte timestamp de Firebase a objeto Date
 * @private
 * @param {Object} timestamp - Timestamp de Firebase
 * @returns {Date} Fecha JavaScript
 */
function procesarFirebaseTimestamp(timestamp) {
  return timestamp && typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date();
}

/**
 * Compara pujas entre PostgreSQL y Firebase
 * @param {number} auctionId - ID de subasta
 * @returns {Promise<Object>} Análisis comparativo de pujas
 * @property {Array} postgresBids - Pujas en PostgreSQL
 * @property {Array} firebaseBids - Pujas en Firebase
 * @property {Array} commonBids - Pujas en ambas fuentes
 * @property {Array} postgresOnlyBids - Pujas exclusivas de PostgreSQL
 * @property {Array} firebaseOnlyBids - Pujas exclusivas de Firebase
 * @property {boolean} isConsistent - Indica si las fuentes están sincronizadas
 */
export async function compareBidSources(auctionId) {
  try {
    // Obtener datos de ambas fuentes en paralelo
    const [postgresBids, firebaseBids] = await Promise.all([
      processBidsFromPostgres(auctionId),
      processBidsFromFirebase(auctionId)
    ]);
    
    // Crear mapas para búsqueda rápida por clave compuesta (desarrollador+monto)
    const postgresMap = new Map(
      postgresBids.map(bid => [`${bid.developerId}-${bid.amount}`, bid])
    );
    
    const firebaseMap = new Map(
      firebaseBids.map(bid => [`${bid.developerId}-${bid.amount}`, bid])
    );
    
    // Identificar pujas comunes y exclusivas de cada fuente
    const commonBids = [];
    const postgresOnlyBids = [];
    const firebaseOnlyBids = [];
    
    // Encontrar comunes y exclusivos de PostgreSQL
    postgresBids.forEach(pgBid => {
      const key = `${pgBid.developerId}-${pgBid.amount}`;
      if (firebaseMap.has(key)) {
        commonBids.push(pgBid);
      } else {
        postgresOnlyBids.push(pgBid);
      }
    });
    
    // Encontrar exclusivos de Firebase
    firebaseBids.forEach(fbBid => {
      const key = `${fbBid.developerId}-${fbBid.amount}`;
      if (!postgresMap.has(key)) {
        firebaseOnlyBids.push(fbBid);
      }
    });
    
    return {
      postgresBids,
      firebaseBids,
      commonBids,
      postgresOnlyBids,
      firebaseOnlyBids,
      isConsistent: postgresOnlyBids.length === 0 && firebaseOnlyBids.length === 0
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Crea puja simultáneamente en PostgreSQL y Firebase
 * @param {Object} bid - Datos de la puja
 * @param {number} bid.auctionId - ID de subasta
 * @param {number} bid.developerId - ID de desarrollador
 * @param {number} bid.amount - Monto de la puja
 * @returns {Promise<Object>} Resultado de creación en ambas fuentes
 * @throws {Error} Si los datos son inválidos
 */
export async function createBidInBothSources(bid) {
  try {
    // Verificar que los valores sean del tipo correcto
    if (typeof bid.auctionId !== 'number' || typeof bid.developerId !== 'number') {
      throw new Error('Los IDs de subasta y desarrollador deben ser números');
    }
    
    // Preparar el objeto de puja
    const bidData = {
      auction_id: bid.auctionId,
      developer_id: bid.developerId,
      amount: bid.amount
    };
    
    // Crear en ambos repositorios en paralelo para mejor rendimiento
    const [postgresData, firebaseData] = await Promise.all([
      postgresRepo.createBid(bidData),
      firebaseRepo.createBid(bidData)
    ]);
    
    return {
      success: true,
      postgres: postgresData,
      firebase: firebaseData
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Obtiene pujas de una fuente específica
 * @param {number} auctionId - ID de subasta
 * @param {string} source - Fuente de datos ('postgres'|'firebase')
 * @returns {Promise<{bids: Array, source: string}>} Pujas de la fuente solicitada
 * @throws {Error} Si la fuente no es válida
 */
export async function getBidsBySource(auctionId, source) {
  try {
    const validSources = ['postgres', 'firebase'];
    
    if (!validSources.includes(source)) {
      throw new Error('Fuente de datos no válida. Use "postgres" o "firebase"');
    }
    
    const bids = source === 'postgres' 
      ? await processBidsFromPostgres(auctionId)
      : await processBidsFromFirebase(auctionId);
    
    return { bids, source };
  } catch (error) {
    throw error;
  }
}
