import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";
import bcrypt from 'bcrypt';

/**
 * Admin model.
 * @module AdminModel
 */

const AdminModel = sequelize.define(
  "admins",
  {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      full_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING(100)
      },
      email: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false
      },
      username: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      image: {
        type: DataTypes.STRING(100)
      },
      status: {
        type: DataTypes.STRING(50),
        defaultValue: 'active'
      }
  },{
        timestamps: true,
});


export default AdminModel;