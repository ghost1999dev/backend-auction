import IBidRepository from './IBidRepository.js';
import admin from '../config/firebase.js';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Implementación de Firebase para el repositorio de pujas
 */
export default class FirebaseBidRepository extends IBidRepository {
  constructor() {
    super();
    // Inicializar Firestore
    try {
      this.db = getFirestore();
      console.log('Firestore conectado correctamente');
    } catch (error) {
      console.error('Error al conectar con Firestore:', error);
      // Fallback para desarrollo - simular Firestore con un objeto en memoria
      this.db = this._createMockFirestore();
    }
  }
  
  // Método para crear un mock de Firestore para desarrollo/pruebas
  _createMockFirestore() {
    console.warn('Usando mock de Firestore para desarrollo');
    const mockData = {
      bids: []
    };
    
    return {
      collection: (name) => ({
        doc: (id = `mock_${Date.now()}`) => ({
          id,
          set: (data) => {
            const newDoc = { id, ...data };
            mockData[name] = mockData[name] || [];
            mockData[name].push(newDoc);
            return Promise.resolve(newDoc);
          },
          get: () => Promise.resolve({
            exists: true,
            data: () => mockData[name].find(doc => doc.id === id) || {}
          })
        }),
        where: () => ({
          orderBy: () => ({
            limit: () => ({
              get: () => Promise.resolve({
                empty: mockData[name]?.length === 0,
                docs: mockData[name]?.map(doc => ({
                  id: doc.id,
                  data: () => doc
                })) || []
              })
            }),
            get: () => Promise.resolve({
              empty: mockData[name]?.length === 0,
              docs: mockData[name]?.map(doc => ({
                id: doc.id,
                data: () => doc
              })) || []
            })
          })
        }),
        batch: () => ({
          set: () => {},
          commit: () => Promise.resolve()
        })
      })
    };
  }

  /**
   * Obtiene todas las pujas para una subasta específica.
   * @param {number|string} auctionId - ID de la subasta.
   * @returns {Promise<Array>} Lista de pujas.
   */
  async getBidsByAuction(auctionId) {
    try {
      // Asegurar que auctionId sea un número
      const numericAuctionId = parseInt(auctionId, 10);
      
      if (isNaN(numericAuctionId)) {
        throw new Error(`ID de subasta inválido: ${auctionId}`);
      }
      
      const snapshot = await this.db.collection('bids')
        .where('auctionId', '==', numericAuctionId)
        .orderBy('createdAt')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
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
      
      const bidRef = this.db.collection('bids').doc();
      const newBid = { 
        auctionId: auctionId, 
        developerId: developerId, 
        amount: bid.amount,
        createdAt: admin.firestore.FieldValue.serverTimestamp() 
      };
      
      await bidRef.set(newBid);
      return { id: bidRef.id, ...newBid };
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
    
    const snapshot = await this.db.collection('bids')
      .where('auctionId', '==', numericAuctionId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
      
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    throw error;
  }
}  /**
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
      
      const batch = this.db.batch();
      
      bids.forEach(bid => {
        const bidRef = this.db.collection('bids').doc();
        
        const bidData = {
          auctionId: typeof bid.auctionId === 'string' ? parseInt(bid.auctionId, 10) : bid.auctionId,
          developerId: typeof bid.developerId === 'string' ? parseInt(bid.developerId, 10) : bid.developerId,
          amount: bid.amount,
          createdAt: admin.firestore.Timestamp.fromDate(new Date(bid.createdAt))
        };
        
        batch.set(bidRef, bidData);
      });
      
      await batch.commit();
    } catch (error) {
      throw error;
    }
  }
}
