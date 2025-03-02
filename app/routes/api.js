// routes/userRoutes.js
const express = require("express");
const { check, validationResult } = require("express-validator");
const api = express.Router();
const auth = require("../Middleware/Auth");
const userController = require("../Controllers/User");
const controller = require("../Controllers/Controllers");
const groupRouting = require("../Middleware/groupRouting");
const loginController = require("../Controllers/Auth/login");
const eventController = require("../Controllers/Events");
const roleController = require("../Controllers/Role");
const bookController = require("../Controllers/Booking");
const rateLimiter = require("..//Middleware/rateLimiter");

api.post("/login", rateLimiter, loginController.login);

api.post("/encrypt", controller.encrypt);
api.post("/decrypt", controller.decrypt);

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Routes
groupRouting(api, "/", auth, (api) => {
  api.get("/getAllUsers", userController.getAllUsers);
  api.post(
    "/users",
    [
      check("username")
        .notEmpty()
        .withMessage("Username is required")
        .isString()
        .withMessage("Username must be a string"),
      check("email")
        .isEmail()
        .withMessage("Valid email is required")
        .normalizeEmail(),
      check("password")
        .notEmpty()
        .withMessage("Password is required")
        .isString()
        .withMessage("Password must be a string"),
      check("roleId")
        .optional()
        .isInt()
        .withMessage("Role ID must be a valid integer"),
      check("city").optional().isString().withMessage("City must be a string"),
      check("status")
        .optional()
        .isInt({ min: 0, max: 1 })
        .withMessage("Status must be either 0 or 1"), // Active or inactive
    ],
    handleValidationErrors,
    userController.createUser
  );
  api.put(
    "/users/:id",
    [check("id").isInt().withMessage("Invalid user ID")],
    userController.updateUser
  );
  api.delete(
    "/users/:id",
    [check("id").isInt().withMessage("Invalid user ID")],
    userController.deleteUser
  );

  api.post(
    "/events",
    [
      check("name")
        .notEmpty()
        .withMessage("Event name is required")
        .isString()
        .withMessage("Event name must be a string"),
      check("date")
        .notEmpty()
        .withMessage("Event date is required")
        .isDate()
        .withMessage("Event date must be a valid date"),
      check("totalTickets")
        .notEmpty()
        .withMessage("Total tickets are required")
        .isInt({ min: 1 })
        .withMessage("Total tickets must be an integer greater than 0"),
    ],
    handleValidationErrors,
    eventController.createEvent
  );

  api.get("/events", eventController.listEvents);
  api.delete(
    "/events/:id",
    [check("id").isInt().withMessage("Event ID must be a valid integer")],
    handleValidationErrors,
    eventController.deleteEvent
  );

  // Roles
  api.post(
    "/role",
    [
      check("name")
        .notEmpty()
        .withMessage("Role name is required")
        .isString()
        .withMessage("Role name must be a string"),
    ],
    handleValidationErrors,
    roleController.createRole
  );

  api.get("/role", roleController.getRoles);
  api.get(
    "/role/:id",
    [check("id").isInt().withMessage("Role ID must be a valid integer")],
    handleValidationErrors,
    roleController.getRoleById
  );

  api.put(
    "/role/:id",
    [check("id").isInt().withMessage("Role ID must be a valid integer")],
    handleValidationErrors,
    roleController.updateRole
  );

  api.delete(
    "/role:id",
    [check("id").isInt().withMessage("Role ID must be a valid integer")],
    handleValidationErrors,
    roleController.deleteRole
  );

  // Booking

  api.post(
    "/bookings",
    [
      check("userId").isInt().withMessage("User ID must be an integer"),
      check("numberOfTickets")
        .isInt({ min: 1 })
        .withMessage("Number of tickets must be a positive integer"),
    ],
    handleValidationErrors,
    bookController.bookTicket
  );
  api.get("/bookings/my-bookings", bookController.getUserBookings);
  api.delete("/bookings/:id", bookController.deleteBooking);
});

module.exports = api;
