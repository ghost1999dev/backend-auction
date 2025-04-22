import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";

/**
 * Notification model.
 * @module NotificationModel
 */


const Notification = sequelize.define(
    "notifications", 
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: {
      type: DataTypes.STRING,
      defaultValue: () => new Date().toISOString()
    }
  }, {
    tableName: 'notifications',
    timestamps: false
  }
);
  
  export default Notification;