import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";

const WinnerModel = sequelize.define('winners', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  auction_id: {
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

export default WinnerModel;