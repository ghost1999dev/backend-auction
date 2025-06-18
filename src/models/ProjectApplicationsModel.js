import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";
import ProjectsModel from "./ProjectsModel.js";
import DevelopersModel from "./DevelopersModel.js";

/**
 * @typedef {Object} ProjectApplicationsModel
 * @property {number} id - ID único de la aplicación
 * @property {number} project_id - ID del proyecto al que se aplica
 * @property {number} developer_id - ID del desarrollador que aplica
 * @property {number} status - Estado de la aplicación (0=pending, 1=accepted, 2=rejected)
 */
const ProjectApplicationsModel = sequelize.define(
  "project_applications",
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true
    },
    project_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: ProjectsModel,
        key: 'id'
      }
    },
    developer_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: DevelopersModel,
        key: 'id'
      }
    },
    status: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isIn: [[0, 1, 2]] // 0=activo, 1=ganador, 2=rechazado
      }
    }
  },
  { 
    timestamps: true
  }
);

ProjectApplicationsModel.belongsTo(ProjectsModel, { 
  foreignKey: "project_id",   
  as: "project" 
});

ProjectApplicationsModel.belongsTo(DevelopersModel, { 
  foreignKey: "developer_id", 
  as: "developer" 
});

export default ProjectApplicationsModel;