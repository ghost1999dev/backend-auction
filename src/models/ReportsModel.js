import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";
import ProjectsModel from "./ProjectsModel.js";
import UsersModel from "./UsersModel.js";

/**
 * Report model.
 * @module ReportsModel
 */

  const ReportsModel = sequelize.define(
    'reports', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    reporter_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_role: {
      type: DataTypes.STRING(50)
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    timestamps: true,
  });

ReportsModel.belongsTo(UsersModel, {
  foreignKey: 'reporter_id',
  as: 'reporter'
});

ReportsModel.belongsTo(UsersModel, {
  foreignKey: 'user_id',
  as: 'reportedUser'
});

ReportsModel.belongsTo(ProjectsModel, {
  foreignKey: 'project_id',
  as: 'project'
});

export default ReportsModel;

