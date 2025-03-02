const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const User = require("../../Models/User");
const Role = require("../../Models/Role");
const sequelize = require("../../Middleware/database").sequelize;

exports.login = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { username, password, email } = req.body;
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
      transaction,
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const defaultRole = await Role.findOne({
        where: { name: "User" },
        transaction,
      });

      user = await User.create(
        {
          username,
          email,
          password: hashedPassword,
          roleId: defaultRole ? defaultRole.id : 1,
          status: 1,
          createdBy: null,
          updatedBy: null,
        },
        { transaction }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Incorrect Password!",
      });
    }

    let expiresTime = "1h";
    if (user.role && user.role.name === "Security") {
      expiresTime = "1y";
    }

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role.name,
    };

    const payload = {
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
      },
    };

    jwt.sign(
      payload,
      "randomString",
      { expiresIn: expiresTime },
      (err, token) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Error generating token", error: err.message });
        }
        transaction.commit();

        return res.status(200).json({
          token,
          user: userData,
        });
      }
    );
  } catch (err) {
    await transaction.rollback();
    return res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};
