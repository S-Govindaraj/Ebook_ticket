const Event = require("../Models/Events");
const User = require("../Models/User");
const { Op } = require("sequelize");
const sequelize = require("../Middleware/database").sequelize;

exports.createEvent = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, date, totalTickets } = req.body;
    const createdBy = req.user.id;
    if (!req.user || req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only Admin can create events" });
    }

    const existingEvent = await Event.findOne({
      where: {
        name: {
          [Op.iLike]: name,
        },
      },
      transaction,
    });

    if (existingEvent) {
      await transaction.rollback();
      return res.status(400).json({ message: "Event Already exists" });
    }

    const newEvent = await Event.create(
      {
        name,
        date,
        totalTickets,
        createdBy,
        updatedBy: createdBy,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      message: "Event created successfully!",
      event: newEvent,
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      message: "Server error. Could not create event.",
    });
  }
};

exports.listEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["username"],
        },
        {
          model: User,
          as: "updater",
          attributes: ["username"],
        },
      ],
      order: [["date", "ASC"]],
    });

    return res.status(200).json({
      events,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error. Could not list events.",
    });
  }
};

exports.deleteEvent = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const updatedBy = req.user.id;

    if (!req.user || req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only Admin can delete events" });
    }

    const event = await Event.findByPk(id, { transaction });
    if (!event) {
      await transaction.rollback();
      return res.status(404).json({ message: "Event not found" });
    }

    event.status = 0;
    event.updatedBy = updatedBy;
    event.updatedAt = Date.now();
    await event.save({ transaction });

    await transaction.commit();
    return res.status(200).json({
      message: "Event marked as deleted successfully!",
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      message: "Server error. Could not update event status.",
    });
  }
};
