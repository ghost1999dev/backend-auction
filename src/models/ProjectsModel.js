import sequelize from "../config/connection.js";
import CategoriesModel from "./CategoriesModel.js";
import UsersModel from "./UsersModel.js";
import CompaniesModel from "./CompaniesModel.js";
import { DataTypes } from "sequelize";
/**
 * Projects model.
 * @module ProjectsModel
 */


const ProjectsModel = sequelize.define(
    "projects", 
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
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'            
      }
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
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1  
    },
    long_description: {
      type: DataTypes.TEXT
    },
    deactivation_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    documents: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    }
  },
   {
    timestamps: true,
  }
);


ProjectsModel.belongsTo(UsersModel, { foreignKey: 'company_id', as: 'company' });


ProjectsModel.belongsTo(CategoriesModel, { foreignKey: 'category_id', as: 'category' });

ProjectsModel.belongsTo(CompaniesModel, { foreignKey: 'company_id', as: 'company_profile' });
  
export default ProjectsModel;
  