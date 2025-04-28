import sequelize from "../config/connection.js";
import CategoriesModel from "./CategorieModel.js";
import UsersModel from "./UsersModel.js";
import CompaniesModel from "./CompaniesModel.js";
import { DataTypes } from "sequelize";
/**
 * Projects model.
 * @module ProjectsModel
 */


const Project = sequelize.define(
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
      defaultValue: 1  // 1 para 'activo', 0 para 'inactivo'
    }
  },
   {
    timestamps: true,
  }
);

// Relación con User
Project.belongsTo(UsersModel, { foreignKey: 'company_id', as: 'company' });

// Relación con Category 
Project.belongsTo(CategoriesModel, { foreignKey: 'category_id', as: 'category' });

Project.belongsTo(CompaniesModel, { foreignKey: 'company_id', as: 'company_profile' });

// Relación con Status 
/*Project.belongsTo(Status, { foreignKey: 'status', as: 'status' }); 

// Relación con ProjectApplications (un proyecto tiene muchas aplicaciones)
Project.hasMany(ProjectApplication, { foreignKey: 'project_id' });

// Relación con Auctions (un proyecto tiene muchos subastas)
Project.hasMany(Auction, { foreignKey: 'project_id' });

// Relación con AuditLogs (un proyecto tiene muchos logs de auditoría)
Project.hasMany(AuditLog, { foreignKey: 'project_id' });*/
  
  export default Project;
  