const { DataTypes } = require("sequelize");
const sequelize = require("../Middleware/database").sequelize;
const User = require("../Models/User");

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 255],
      },
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "roles",
    timestamps: true,
  }
);

Role.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Role.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

module.exports = Role;
