const bcrypt = require("bcryptjs");
const { DataTypes } = require("sequelize");
const sequelize = require("../Middleware/database").sequelize;
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "roles",
        key: "id",
      },
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
    tableName: "users",
    timestamps: true,
  }
);


User.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });


User.prototype.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = User;

