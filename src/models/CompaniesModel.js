import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";



/**
 * Companies model.
 * @module CompaniesModel
 */

const CompaniesModel = sequelize.define(
  "company_profile",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nrc_number: {
      type: DataTypes.STRING,
      unique: true,
    },
    business_type: {
      type: DataTypes.STRING,
    },
    web_site: {
      type: DataTypes.STRING,
    },
    nit_number: {
      type: DataTypes.STRING,
      unique: true
    },
  },
  {
    timestamps: true
  },
);

export default CompaniesModel;
import("./UsersModel.js").then((module) => {
  const UsersModel = module.default;
  CompaniesModel.belongsTo(UsersModel, { foreignKey: 'user_id', as: 'user' });
});