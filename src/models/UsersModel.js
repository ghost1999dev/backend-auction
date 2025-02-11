import sequelize from "../config/connection.js"
import { DataTypes } from "sequelize"

const UsersModel = sequelize.define("users", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false,
    }
},{
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export default UsersModel