import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";
import UsersModel from "./UsersModel.js";


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
      allowNull: false,
      unique: true,
    },
    bussiness_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    web_site: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nit_number: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
  },
  {
    timestamps: true
  },
);

CompaniesModel.belongsTo(UsersModel, { foreignKey: "user_id" });

export default CompaniesModel;
