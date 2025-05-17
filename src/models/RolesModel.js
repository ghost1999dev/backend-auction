import sequelize from "../config/connection.js"
import { DataTypes } from "sequelize"

/**
 * Roles model.
 * @module RolesModel
 * @description Represents a role with properties such as name, description, and status.
 */

const RolesModel = sequelize.define(
    "roles",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        role_name: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        timestamps: true,
    }
)

export default RolesModel