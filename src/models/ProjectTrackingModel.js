import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";
import ProjectsModel from "./ProjectsModel.js";

const ProjectTrackingModel = sequelize.define('project_tracking', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "1 = Asignado, 2 = En Progreso, 3 = En Revisión, 4 = Completado"
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'project_tracking',  
  timestamps: false
});

ProjectTrackingModel.belongsTo(ProjectsModel, {
  foreignKey: 'project_id',
  as: 'project'
});

export default ProjectTrackingModel;