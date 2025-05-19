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
  host: 'ep-black-tree-a4gz5ynl-pooler.us-east-1.aws.neon.tech',
  port: 5432,
  database: 'neondb',
  username: 'neondb_owner',
  password: 'npg_2VAaLYxj6RQJ',
  dialectOptions: {
    ssl: {
      require: true,
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
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

