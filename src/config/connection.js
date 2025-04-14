import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'serially-breezy-flatfish.data-1.use1.tembo.io',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: 'yoCiqPJ7FuiH2yA8',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
      ca: readFileSync(resolve(__dirname, 'ca.crt')).toString()
    }
  }
});

export const getConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión establecida correctamente");
  } catch (err) {
    console.error("Error de conexión:", err);
  }
};

export default sequelize;

