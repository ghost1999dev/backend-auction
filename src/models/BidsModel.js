// src/models/BidModel.js
import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";
import AuctionModel from "./AuctionModel.js";
import UsersModel   from "./UsersModel.js";

/**
 * Bid model.
 * @module BidModel
 */
const Bid = sequelize.define(
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
Bid.belongsTo(AuctionModel, { 
  foreignKey: "auction_id", 
  as: "auction" 
});

Bid.belongsTo(UsersModel, { 
  foreignKey: "developer_id", 
  as: "developer" 
});

export default Bid;
