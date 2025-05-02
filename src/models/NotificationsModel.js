import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";

/**
 * Notification model.
 * @module NotificationsModel
 */


const NotificationsModel = sequelize.define(
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
        type: DataTypes.JSON,  
        allowNull: false,
        defaultValue: {}
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'pending'
      },
      error_message: {
        type: DataTypes.TEXT
      }
  }, {
    timestamps: true
  }
);
  
  export default NotificationsModel;