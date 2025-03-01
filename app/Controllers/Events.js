// controllers/eventController.js
const Event = require("../Models/Events");
const { Op } = require("sequelize");

exports.createEvent = async (req, res) => {
  try {
    const { name, date, totalTickets } = req.body;

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
    });
    if (existingEvent) {
      return res.status(400).json({ message: "Event Already exists" });
    }
    const newEvent = await Event.create({
      name,
      date,
      totalTickets,
    });

    return res.status(201).json({
      message: "Event created successfully!",
      event: newEvent,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error. Could not create event." });
  }
};

exports.listEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [["date", "ASC"]],
    });

    return res.status(200).json({
      events,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error. Could not list events." });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only Admin can delete events" });
    }

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.status = 0;
    await event.save();

    return res.status(200).json({
      message: "Event marked as deleted successfully!",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error. Could not update event status." });
  }
};
