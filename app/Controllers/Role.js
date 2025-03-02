const { Op } = require("sequelize");
const Role = require("../Models/Role");
const User = require("../Models/User");
const sequelize = require("../Middleware/database").sequelize;

exports.createRole = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { name, status } = req.body;

    if (!name || name.trim().length < 3) {
      return res.status(400).json({
        message:
          "Role name is required and should be at least 3 characters long.",
      });
    }

    const roleStatus = status !== undefined ? status : 1;
    const createdBy = req.user ? req.user.id : null;

    const newRole = await Role.create(
      {
        name: name.trim(),
        status: roleStatus,
        createdBy: createdBy,
        updatedBy: createdBy,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      message: "Role created successfully.",
      role: newRole,
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      message: "Server error while creating role.",
      error: error.message,
    });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [
        { model: User, as: "creator", attributes: ["id", "username", "email"] },
        { model: User, as: "updater", attributes: ["id", "username", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Roles fetched successfully.",
      roles,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching roles.",
      error: error.message,
    });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id, {
      include: [
        { association: "creator", attributes: ["id", "username", "email"] },
        { association: "updater", attributes: ["id", "username", "email"] },
      ],
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }

    return res.status(200).json({
      message: "Role fetched successfully.",
      role,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching role.",
      error: error.message,
    });
  }
};

exports.updateRole = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }

    if (name && name.trim().length < 3) {
      return res.status(400).json({
        message: "Role name should be at least 3 characters long.",
      });
    }

    role.id = id !== undefined ? id : id;
    role.name = name !== undefined ? name.trim() : role.name;
    role.status = status !== undefined ? status : role.status;

    role.updatedBy = req.user ? req.user.id : role.updatedBy;
    role.updatedAt = Date.now();


    await role.save({ transaction });

    await transaction.commit();

    res.status(200).json({
      message: "Role updated successfully.",
      role,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      message: "Server error while updating role.",
      error: error.message,
    });
  }
};

exports.deleteRole = async (req, res) => {
  const transaction = await sequelize.transaction(); 
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }

    role.status = 0;
    role.updatedBy = req.user ? req.user.id : role.updatedBy;
    role.updatedAt = Date.now();

    await role.save({ transaction }); 

    await transaction.commit(); 
    return res.status(200).json({
      message: "Role soft-deleted successfully.",
      role,
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      message: "Server error while soft-deleting role.",
      error: error.message,
    });
  }
};
