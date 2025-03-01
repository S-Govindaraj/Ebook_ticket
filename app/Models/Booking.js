const { DataTypes } = require("sequelize");
const sequelize = require("../Middleware/database").sequelize;
const Event = require("../Models/Events");
const User = require("../Models/User");

const Booking = sequelize.define(
  "Booking",
  {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
      allowNull: false,
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "events",
        key: "id",
      },
    },
    numberOfTickets: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
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
    tableName: "bookings",
    timestamps: true,
  }
);
Booking.belongsTo(Event, { foreignKey: "eventId", as: "event" });
Booking.belongsTo(User, { foreignKey: "userId", as: "user" });
Booking.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Booking.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

module.exports = Booking