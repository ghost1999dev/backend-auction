import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";
import RolesModel from "./RolesModel.js";
import ExternalAccountsModel from "./ExternalAccountsModel.js";
import CompaniesModel from "./CompaniesModel.js";
import DevelopersModel from "./DevelopersModel.js";

/**
 * Users model.
 * @module UsersModel
 * @description Represents a user with properties such as name, email, password, role, image, and status.
 */

const UsersModel = sequelize.define(
  "users",
  {
      id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone : {
      type: DataTypes.STRING,
      allowNull: true,
     },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    account_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1 // 1 = activo, 0 = inactivo
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    }, 
  },
    {      
      timestamps: true,
    });
    
  // Asociación: Un usuario tiene muchas cuentas externas
  UsersModel.hasMany(ExternalAccountsModel, { foreignKey: "user_id" });
  UsersModel.belongsTo(RolesModel, { foreignKey: "role_id" });
  UsersModel.hasOne(CompaniesModel, { foreignKey: 'user_id', as: 'company_profile' });
  UsersModel.hasOne(DevelopersModel, { foreignKey: 'user_id', as: 'dev_profile' });

  export default UsersModel;