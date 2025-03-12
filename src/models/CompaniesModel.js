import sequelize from "../config/connection.js";
import { DataTypes } from "sequelize";
import UsersModel from "./UsersModel.js";

const CompaniesModel = sequelize.define(
  "companies",
  {
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tax_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

CompaniesModel.belongsTo(UsersModel, { foreignKey: "user_id" });

export default CompaniesModel;
