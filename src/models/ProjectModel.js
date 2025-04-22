import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";
/**
 * Projects model.
 * @module ProjectsModel
 */


const Project = sequelize.define(
    "Project", 
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    project_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    budget: {
      type: DataTypes.FLOAT
    },
    days_available: {
      type: DataTypes.INTEGER
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active'
    }
  },
   {
    timestamps: true,
  }
);
  
  export default Project;
  