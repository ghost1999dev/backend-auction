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
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    requirements: {
      type: DataTypes.STRING
    },
    payment_type: {
      type: DataTypes.STRING
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
    },
    category_id: {
      type: DataTypes.INTEGER
    },
    created_at: {
      type: DataTypes.STRING,
      defaultValue: () => new Date().toISOString()
    }
  },
   {
    timestamps: true,
  }
);
  
  export default Project;
  