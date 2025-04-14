import sequelize from "../config/connection.js"
import { DataTypes } from "sequelize"
import UsersModel from "./UsersModel.js"

/**
 * Developers model.
 * @module DevelopersModel
 */

const DevelopersModel = sequelize.define(
    "dev_profile",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        linkedin: {
            type: DataTypes.STRING,
            allowNull: true
        },
        occupation: {
            type: DataTypes.STRING,
            allowNull: true
        },
        portfolio: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        timestamps: true,
    }
)

DevelopersModel.belongsTo(UsersModel, { foreignKey: "user_id" })

export default DevelopersModel