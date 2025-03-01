const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const User = require("../../Models/User");
const Role = require("../../Models/Role");

exports.login = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    let user = await User.findOne({
      where: {
        username: { [Op.like]: username },
        status: 1,
      },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
      ],
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const defaultRole = await Role.findOne({ where: { name: "User" } });

      user = await User.create({
        username,
        email,
        password: hashedPassword,
        roleId: defaultRole ? defaultRole.id : 1,
        status: 1,
        createdBy: null,
        updatedBy: null,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect Password!",
      });
    }

    let expiresTime = "1y";
    if (user.Role && user.Role.name === "Security") {
      expiresTime = "1y";
    }

    user = await User.findOne({
      where: {
        username: { [Op.like]: username },
        status: 1,
      },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
      ],
    });

    user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role.name,
    };

    const payload = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      "randomString",
      { expiresIn: expiresTime },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          token,
          user,
        });
      }
    );
  } catch (err) {
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};
