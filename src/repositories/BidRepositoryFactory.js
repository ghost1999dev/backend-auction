import PostgresBidRepository from './PostgresBidRepository.js';
import FirebaseBidRepository from './FirebaseBidRepository.js';

export default class BidRepositoryFactory {
  /**
   * Obtiene una instancia del repositorio según la fuente de datos
   * @param {string} source - Fuente de datos ('postgres' o 'firebase')
   * @returns {IBidRepository} Instancia del repositorio
   */
  static getRepository(source) {
    switch (source) {
      case 'postgres':
        return new PostgresBidRepository();
      case 'firebase':
        return new FirebaseBidRepository();
      default:
        throw new Error('Fuente de datos no soportada');
    }
  }
}
