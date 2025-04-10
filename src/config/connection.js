import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

/**
 * Sequelize instance configured for connecting to the database.
 *
 * @constant {Sequelize}
 */
// const sequelize = new Sequelize("postgres", "postgres", "yoCiqPJ7FuiH2yA8", {
//   host: "serially-breezy-flatfish.data-1.use1.tembo.io",
//   dialect: "postgres",
//   port: 5432,
//   ssl: {
//     rejectUnauthorized: true,
//     ca: require("./ca.crt"),
//   }
// });

const sequelize = new Sequelize('postgresql://postgres:yoCiqPJ7FuiH2yA8@serially-breezy-flatfish.data-1.use1.tembo.io:5432/postgres?sslmode=verify-full&sslrootcert='+process.env.CA_PATH, {
   dialect: 'postgres',
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