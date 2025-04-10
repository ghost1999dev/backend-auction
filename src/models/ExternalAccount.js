import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";
import UsersModel from "./UsersModel.js";

export const ExternalAccount = sequelize.define(
    "external_account",
     {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    provider_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,// 'google', 'GitHub'
    },},
    {      
      timestamps: true,
    });

// Relaciones
ExternalAccount.belongsTo(UsersModel, { foreignKey: 'user_id' });

export default ExternalAccount;
    
