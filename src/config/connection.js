import { Sequelize } from "sequelize";

/**
 * Sequelize instance configured for connecting to the database.
 *
 * @constant {Sequelize}
 */
const sequelize = new Sequelize("auction_db", "dev", "31415", {
  host: "31.220.97.169",
  dialect: "postgres",
  port: 5450,
});

/**
 * Establishes a connection to the database by authenticating the Sequelize instance.
 *
 * @async
 * @function getConnection
 * @returns {Promise<void>} Resolves when the connection is successful; logs an error otherwise.
 */
export const getConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("La conexión se ha establecido correctamente..");
  } catch (err) {
    console.error("No se puede conectar a la base de datos:", err);
  }
};

export default sequelize;
