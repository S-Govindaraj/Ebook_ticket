const Role = require("../Models/Role");
const User = require("../Models/User");
exports.createRole = async (req, res) => {
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

    const newRole = await Role.create({
      name: name.trim(),
      status: roleStatus,
      createdBy: createdBy,
      updatedBy: createdBy,
    });

    return res.status(201).json({
      message: "Role created successfully.",
      role: newRole,
    });
  } catch (error) {
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
      message: "Role Shared successfully.",
      role: roles,
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
      message: "Role Shared successfully.", role
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching role.",
      error: error.message,
    });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status,ids } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }

    if (name && name.trim().length < 3) {
      return res.status(400).json({
        message: "Role name should be at least 3 characters long.",
      });
    }
    role.id = ids !== undefined ? ids : id;
    role.name = name !== undefined ? name.trim() : role.name;
    role.status = status !== undefined ? status : role.status;

    role.updatedBy = req.user ? req.user.id : role.updatedBy;

    await role.save();

    res.status(200).json({
      message: "Role updated successfully.",
      role,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while updating role.",
      error: error.message,
    });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }
    role.status = 0;
    role.updatedBy = req.user ? req.user.id : role.updatedBy;
    await role.save();
    return res.status(200).json({
      message: "Role soft-deleted successfully.",
      role,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while soft-deleting role.",
      error: error.message,
    });
  }
};
