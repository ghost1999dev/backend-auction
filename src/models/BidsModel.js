// src/models/BidModel.js
import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";
import AuctionsModel from "./AuctionsModel.js";
import DevelopersModel from "./DevelopersModel.js";
import UsersModel from "./UsersModel.js";

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
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
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

/*BidsModel.belongsTo(DevelopersModel, { 
  foreignKey: 'developer_id', 
  as: 'developer_profile' 
});*/

// Configurar las relaciones inversas después de la importación
/*import("./AuctionsModel.js").then((module) => {
  const AuctionsModel = module.default;
  AuctionsModel.hasMany(BidsModel, { foreignKey: 'auction_id', as: 'bids' });
});*/
BidsModel.belongsTo(DevelopersModel, { as: 'developer_profile', foreignKey: 'developer_id', targetKey: 'user_id' });

DevelopersModel.belongsTo(UsersModel, { as: 'users', foreignKey: 'user_id' });



export default BidsModel;
