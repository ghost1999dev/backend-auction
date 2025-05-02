import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";

/**
 * Categories model.
 * @module CategoriesModel
 */

const CategoriesModel = sequelize.define(
  "categories",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    timestamps: true,
  },
);

export default CategoriesModel;