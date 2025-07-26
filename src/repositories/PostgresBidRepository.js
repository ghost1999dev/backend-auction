import IBidRepository from './IBidRepository.js';
import sequelize from '../config/connection.js';
import { QueryTypes } from 'sequelize';

/**
 * Implementación de PostgreSQL para el repositorio de pujas
 */
export default class PostgresBidRepository extends IBidRepository {
  /**
   * Obtiene todas las pujas para una subasta específica.
   * @param {number|string} auctionId - ID de la subasta.
   * @returns {Promise<Array>} Lista de pujas.
   */
  async getBidsByAuction(auctionId) {
    // Asegurar que auctionId sea un número
    const numericAuctionId = parseInt(auctionId, 10);
    
    if (isNaN(numericAuctionId)) {
      throw new Error(`ID de subasta inválido: ${auctionId}`);
    }
    
    const query = 'SELECT * FROM bids WHERE auction_id = ? ORDER BY "createdAt" ASC';
    const rows = await sequelize.query(query, {
      replacements: [numericAuctionId],
      type: QueryTypes.SELECT
    });
    
    return rows;
  }

  /**
   * Crea una nueva puja.
   * @param {Object} bid - Datos de la puja.
   * @returns {Promise<Object>} La puja creada.
   */
  async createBid(bid) {
    try {
      // Convertir los IDs a números si son strings
      const auctionId = typeof bid.auction_id === 'string' ? parseInt(bid.auction_id, 10) : bid.auction_id;
      const developerId = typeof bid.developer_id === 'string' ? parseInt(bid.developer_id, 10) : bid.developer_id;
      
      // Verificar que los IDs sean números válidos
      if (isNaN(auctionId) || isNaN(developerId)) {
        throw new Error('Los IDs de subasta y desarrollador deben ser números válidos');
      }
      
      const query = `INSERT INTO bids (auction_id, developer_id, amount, "createdAt", "updatedAt") 
                     VALUES (?, ?, ?, NOW(), NOW()) RETURNING *`;
      const [result, metadata] = await sequelize.query(query, {
        replacements: [auctionId, developerId, bid.amount],
        type: QueryTypes.INSERT
      });
      
      // Para consultas INSERT con RETURNING, el primer elemento del array contiene los datos retornados
      return Array.isArray(result) && result.length > 0 ? result[0] : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene la última puja para una subasta específica.
   * @param {number|string} auctionId - ID de la subasta.
   * @returns {Promise<Object|null>} La última puja o null si no existe.
   */
  async getLastBid(auctionId) {
    try {
      // Asegurar que auctionId sea un número
      const numericAuctionId = parseInt(auctionId, 10);
      
      if (isNaN(numericAuctionId)) {
        throw new Error(`ID de subasta inválido: ${auctionId}`);
      }
      
      const query = 'SELECT * FROM bids WHERE auction_id = ? ORDER BY "createdAt" DESC LIMIT 1';
      const rows = await sequelize.query(query, {
        replacements: [numericAuctionId],
        type: QueryTypes.SELECT
      });
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sincroniza las pujas entre sistemas.
   * @param {Array} bids - Lista de pujas a sincronizar.
   * @returns {Promise<void>}
   */
  async syncBids(bids) {
    try {
      // Si no hay pujas para sincronizar, retornar inmediatamente
      if (!bids || bids.length === 0) {
        return;
      }
      
      await sequelize.transaction(async (t) => {
        for (const bid of bids) {
          const auctionId = typeof bid.auctionId === 'string' ? parseInt(bid.auctionId, 10) : bid.auctionId;
          const developerId = typeof bid.developerId === 'string' ? parseInt(bid.developerId, 10) : bid.developerId;
          
          if (isNaN(auctionId) || isNaN(developerId)) {
            throw new Error('Los IDs de subasta y desarrollador deben ser números válidos');
          }
          
          const query = `INSERT INTO bids (auction_id, developer_id, amount, "createdAt", "updatedAt")  VALUES (?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING`;
          await sequelize.query(query, {
            replacements: [auctionId, developerId, bid.amount, bid.createdAt, bid.createdAt],
            type: QueryTypes.INSERT,
            transaction: t
          });
        }
      });
    } catch (error) {
      throw error;
    }
  }
}
