import sequelize from "../config/connection.js"
import ProjectsModel from "./ProjectsModel.js";
import DevelopersModel from "./DevelopersModel.js"
import { DataTypes } from "sequelize"

/**
 * @typedef {Object} FavoriteProjectsModel
 * @property {number} id - ID único del proyecto favorito
 * @property {number} project_id - ID del proyecto favorito
 * @property {number} user_id - ID del usuario que marca como favorito
 */

const FavoriteProjectsModel = sequelize.define('favorite_projects',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
},{
    timestamps: true
})

FavoriteProjectsModel.belongsTo(ProjectsModel, { foreignKey: 'project_id', as: 'project' })
FavoriteProjectsModel.belongsTo(DevelopersModel, { foreignKey: 'developer_id', as: 'developer' })

export default FavoriteProjectsModel
