const Event = require("../Models/Events");
const User = require("../Models/User");
const Booking = require("../Models/Booking");
const generateQRCode = require("../Common/QRGenerator");

const sequelize = require("../Middleware/database").sequelize;

exports.bookTicket = async (req, res) => {
  try {
    const { userId, eventId, numberOfTickets } = req.body;
    const event = await Event.findByPk(eventId);
    const createdBy = req.user.id;
    const updatedBy = req.user.id;
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const existingBooking = await Booking.findOne({
      where: { eventId: eventId, userId, status: 1 },
    });
    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "You have already booked for this event" });
    }

    const transaction = await sequelize.transaction();
    event.bookedTickets = event.bookedTickets ? event.bookedTickets : 0;
    try {
      if (event.totalTickets - event.bookedTickets < numberOfTickets) {
        throw new Error("Not enough tickets available");
      }

      const booking = await Booking.create(
        { userId, eventId, numberOfTickets, createdBy, updatedBy },
        { transaction }
      );
      event.bookedTickets += numberOfTickets;
      let user = await User.findOne({
        where: {
          id: userId,
          status: 1,
        },
      });

      const ticketData = {
        name: user.username,
        event: event.name,
        date: event.date,
        numberOfTickets: numberOfTickets,
      };
      const ticketInfo = `Ticket Details: ${JSON.stringify(ticketData)}`;
    
      let qrCode = await generateQRCode(ticketInfo);

      await event.save({ transaction });
      await transaction.commit();
      res.status(201).json({ message: "Booking successful", booking, qrCode });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ message: "Booking failed", error: error.message });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const { id } = req.user;
    const bookings = await Booking.findAll({
      where: { userId: id },
      include: [
        { model: Event, as: "event", attributes: ["name", "date"] },
        { model: User, as: "updater", attributes: ["username"] },
        { model: User, as: "user", attributes: ["username"] },
        { model: User, as: "creator", attributes: ["username"] },
      ],
    });

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found" });
    }

    res.status(200).json({ message: "Booking Details", bookings });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user.id;
    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const event = await Event.findByPk(booking.eventId);
    event.bookedTickets -= booking.numberOfTickets;
    booking.status = 0;
    event.updatedBy = updatedBy;
    booking.updatedBy = updatedBy;
    await booking.save();
    await event.save();

    res.status(200).json({ message: "Booking deleted and tickets refunded" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing refund", error: error.message });
  }
};
