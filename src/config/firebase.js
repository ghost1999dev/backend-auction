/**
 * @fileoverview Configuración e inicialización de Firebase Admin SDK.
 * Este módulo proporciona una instancia configurada de Firebase Admin para 
 * la aplicación de subastas backend, permitiendo acceso a Firestore, Authentication,
 * y Storage.
 * @module config/firebase
 */

import admin from 'firebase-admin';
import { config } from "dotenv";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

config();
process.removeAllListeners('warning');

/**
 * Obtiene el directorio actual para compatibilidad con ES modules
 * @type {string}
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Configuración de Firebase
 * @type {Object}
 */
const firebaseConfig = {
  projectId: "prepruebas-57289",
  storageBucket: "prepruebas-57289.firebasestorage.app"
};

/**
 * Ruta al archivo de credenciales de servicio
 * @type {string}
 */
const serviceAccountPath = path.resolve(__dirname, 'credentials/firebase-service-account.json');

/**
 * Inicializa Firebase Admin SDK si aún no está inicializado
 * Intenta cargar credenciales desde archivo, si no es posible, usa configuración mínima
 */
if (!admin.apps.length) {
  try {
    // Intenta inicializar con archivo de credenciales
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: firebaseConfig.storageBucket
      });
    } else {
      // Configuración mínima para desarrollo
      console.warn('Archivo de credenciales no encontrado. Usando configuración mínima.');
      admin.initializeApp({
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket
      });
    }
  } catch (error) {
    console.error('Error al inicializar Firebase Admin:', error);
    
    // Intento de recuperación con configuración básica
    try {
      admin.initializeApp({ projectId: firebaseConfig.projectId });
      console.warn('Firebase Admin inicializado con configuración limitada.');
    } catch (fallbackError) {
      console.error('Error fatal al inicializar Firebase Admin:', fallbackError);
    }
  }
}

export default admin;
