// src/models/BidModel.js
import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";
import AuctionsModel from "./AuctionsModel.js";
import UsersModel   from "./UsersModel.js";

/**
 * Bid model.
 * @module BidsModel
 */
const BidsModel = sequelize.define(
  "bids",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    auction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "auctions",
        key: "id"
      },
      onDelete: "CASCADE"
    },
    developer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      },
      onDelete: "CASCADE"
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    }
  },
  {
    timestamps: true,         // mappea a createdAt / updatedAt
    underscored: false        // usa camelCase para createdAt, updatedAt
  }
);

// Relaciones
BidsModel.belongsTo(AuctionsModel, { 
  foreignKey: "auction_id", 
  as: "auction" 
});

BidsModel.belongsTo(UsersModel, { 
  foreignKey: "developer_id", 
  as: "developer" 
});

export default BidsModel;
