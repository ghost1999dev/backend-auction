import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";
import DevelopersModel from "./DevelopersModel.js";
import CompaniesModel from "./CompaniesModel.js";

/**
 * Rating model.
 * @module RatingModel
 */ 

  const RatingModel = sequelize.define(
    "rating", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    developer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    timestamps: true
  });  

// Asociaciones
RatingModel.belongsTo(DevelopersModel, {
  foreignKey: 'developer_id',
  as: 'developer'
});

RatingModel.belongsTo(CompaniesModel, {
  foreignKey: 'company_id',
  as: 'company'
});

  export default RatingModel;


