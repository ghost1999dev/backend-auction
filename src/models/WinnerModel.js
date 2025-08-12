import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";
import AuctionsModel from "./AuctionsModel.js";
import UsersModel from "./UsersModel.js";
import BidsModel from "./BidsModel.js";

const WinnerModel = sequelize.define('winners', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  bid_id: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bids',
      key: 'id'
    }
  },  auction_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'auctions',
      key: 'id'
    }
  },
  winner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  bid_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false   
});

WinnerModel.belongsTo(AuctionsModel, { foreignKey: 'auction_id', as: 'auction' });
WinnerModel.belongsTo(UsersModel, { foreignKey: 'winner_id', as: 'winner' });
WinnerModel.belongsTo(BidsModel, { foreignKey: 'bid_id', as: 'bid' });

export default WinnerModel;