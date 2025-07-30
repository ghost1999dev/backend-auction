import sequelize from "../config/connection.js"
import { DataTypes } from "sequelize"

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

import("./UsersModel.js").then((module) => {
    const UsersModel = module.default
    DevelopersModel.belongsTo(UsersModel, { foreignKey: "user_id", as: "user" })
})

export default DevelopersModel