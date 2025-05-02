import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";
import ProjectsModel from "./ProjectsModel.js";

/**
 * @typedef {Object} Auction
 * @property {number} id - ID único de la subasta
 * @property {number} project_id - ID del proyecto asociado
 * @property {Date} bidding_started_at - Fecha de inicio de la subasta
 * @property {Date} bidding_deadline - Fecha límite de la subasta
 * @property {string} status - Estado actual de la subasta
 */

/**
 * Modelo de Subastas
 * @module AuctionModel
 */
const AuctionModel = sequelize.define(
  "auctions",
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
    },
    project_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
    },
    bidding_started_at: { 
      type: DataTypes.DATE, 
      allowNull: false,
    },
    bidding_deadline: { 
      type: DataTypes.DATE, 
      allowNull: false,
    },
    status: { 
      type: DataTypes.STRING(50), 
      allowNull: false,
    }
  },
  { 
    timestamps: true, 
    createdAt: "createdAt", 
    updatedAt: "updatedAt" 
  }
);

AuctionModel.belongsTo(ProjectsModel, { 
  foreignKey: "project_id", 
  as: "project" 
});

export default AuctionModel;
