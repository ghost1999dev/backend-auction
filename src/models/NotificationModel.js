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
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      context: {
        type: DataTypes.STRING
      },
      sent_at: {
        type: DataTypes.DATE
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'pending'
      },
      error_message: {
        type: DataTypes.TEXT
      }
  }, {
    tableName: 'notifications',
    timestamps: false
  }
);
  
  export default Notification;