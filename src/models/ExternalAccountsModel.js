import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";

/**
 * ExternalAccount model.
 * @module ExternalAccountsModel
 */

export const ExternalAccountsModel = sequelize.define(
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
      allowNull: false, // 'google', 'GitHub'
    },
  },
  {
    timestamps: true,
  }
);

// Importación dinámica de UsersModel para evitar el ciclo
(async () => {
  const { default: UsersModel } = await import("./UsersModel.js");
  ExternalAccount.belongsTo(UsersModel, { foreignKey: "user_id" });
})();

export default ExternalAccountsModel;
