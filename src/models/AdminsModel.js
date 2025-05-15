import sequelize from "../config/connection.js";
import RolesModel from "./RolesModel.js";
import { DataTypes } from "sequelize";

/**
 * Admin model.
 * @module AdminsModel
 */

const AdminsModel = sequelize.define(
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
        type: DataTypes.STRING
      },
      status: {
        type: DataTypes.STRING(50),
        defaultValue: 'active'
      },
      role_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'roles',
          key: 'id'
        }
}
  },{
        timestamps: true,
});

AdminsModel.belongsTo(RolesModel, { foreignKey: "role_id" });


export default AdminsModel;