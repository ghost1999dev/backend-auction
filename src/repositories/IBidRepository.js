/**
 * Interfaz de repositorio para pujas
 */
export default class IBidRepository {
  /**
   * Obtiene todas las pujas para una subasta específica.
   * @param {string} auctionId - ID de la subasta.
   * @returns {Promise<Array>} Lista de pujas.
   */
  async getBidsByAuction(auctionId) {
    throw new Error('Método no implementado');
  }

  /**
   * Crea una nueva puja.
   * @param {Object} bid - Datos de la puja.
   * @returns {Promise<Object>} La puja creada.
   */
  async createBid(bid) {
    throw new Error('Método no implementado');
  }

  /**
   * Obtiene la última puja para una subasta específica.
   * @param {string} auctionId - ID de la subasta.
   * @returns {Promise<Object>} La última puja.
   */
  async getLastBid(auctionId) {
    throw new Error('Método no implementado');
  }

  /**
   * Sincroniza las pujas entre sistemas.
   * @param {Array} bids - Lista de pujas a sincronizar.
   * @returns {Promise<void>}.
   */
  async syncBids(bids) {
    throw new Error('Método no implementado');
  }
}
