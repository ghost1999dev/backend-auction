import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";

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

  export default UsersModel;

