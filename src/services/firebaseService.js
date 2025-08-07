import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set, get, child } from "firebase/database";
import dotenv from "dotenv";

dotenv.config();

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/**
 * Servicio para manejar operaciones de Firebase Realtime Database
 */
class FirebaseService {
  /**
   * Crear una nueva puja en Firebase
   * @param {Object} bidData - Datos de la puja
   * @param {number} bidData.auction_id - ID de la subasta
   * @param {number} bidData.developer_id - ID del desarrollador
   * @param {number} bidData.amount - Monto de la puja
   * @returns {Promise<Object>} Puja creada con ID de Firebase
   */
  static async createBid(bidData) {
    try {
      const bidsRef = ref(database, 'bids');
      const newBidRef = push(bidsRef);
      
      const bidWithTimestamp = {
        ...bidData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        firebase_id: newBidRef.key
      };

      await set(newBidRef, bidWithTimestamp);
      
      return {
        id: newBidRef.key,
        ...bidWithTimestamp
      };
    } catch (error) {
      throw new Error(`Error al crear puja en Firebase: ${error.message}`);
    }
  }

  /**
   * Obtener todas las pujas de Firebase
   * @param {Object} filters - Filtros opcionales
   * @param {number} filters.auction_id - Filtrar por ID de subasta
   * @param {number} filters.developer_id - Filtrar por ID de desarrollador
   * @returns {Promise<Array>} Array de pujas
   */
  static async getBids(filters = {}) {
    try {
      const bidsRef = ref(database, 'bids');
      const snapshot = await get(bidsRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      const bidsData = snapshot.val();
      let bids = Object.keys(bidsData).map(key => ({
        id: key,
        ...bidsData[key]
      }));
      if (filters.auction_id) {
        bids = bids.filter(bid => bid.auction_id == filters.auction_id);
      }
      
      if (filters.developer_id) {
        bids = bids.filter(bid => bid.developer_id == filters.developer_id);
      }

      return bids;
    } catch (error) {
      throw new Error(`Error al obtener pujas de Firebase: ${error.message}`);
    }
  }

  /**
   * Obtener una puja específica por ID
   * @param {string} bidId - ID de la puja en Firebase
   * @returns {Promise<Object|null>} Puja encontrada o null
   */
  static async getBidById(bidId) {
    try {
      const bidRef = ref(database, `bids/${bidId}`);
      const snapshot = await get(bidRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: bidId,
        ...snapshot.val()
      };
    } catch (error) {
      throw new Error(`Error al obtener puja de Firebase: ${error.message}`);
    }
  }

  /**
   * Actualizar una puja en Firebase
   * @param {string} bidId - ID de la puja
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Puja actualizada
   */
  static async updateBid(bidId, updateData) {
    try {
      const bidRef = ref(database, `bids/${bidId}`);
      const snapshot = await get(bidRef);
      
      if (!snapshot.exists()) {
        throw new Error('Puja no encontrada en Firebase');
      }

      const updatedData = {
        ...snapshot.val(),
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      await set(bidRef, updatedData);
      
      return {
        id: bidId,
        ...updatedData
      };
    } catch (error) {
      throw new Error(`Error al actualizar puja en Firebase: ${error.message}`);
    }
  }

  /**
   * Eliminar una puja de Firebase
   * @param {string} bidId - ID de la puja
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  static async deleteBid(bidId) {
    try {
      const bidRef = ref(database, `bids/${bidId}`);
      await set(bidRef, null);
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar puja de Firebase: ${error.message}`);
    }
  }

  /**
   * Verificar si existe una puja para una subasta y desarrollador específicos
   * @param {number} auctionId - ID de la subasta
   * @param {number} developerId - ID del desarrollador
   * @returns {Promise<Object|null>} Puja existente o null
   */
  static async findExistingBid(auctionId, developerId) {
    try {
      const bids = await this.getBids({ auction_id: auctionId, developer_id: developerId });
      return bids.length > 0 ? bids[0] : null;
    } catch (error) {
      throw new Error(`Error al buscar puja existente en Firebase: ${error.message}`);
    }
  }
}

export default FirebaseService;
