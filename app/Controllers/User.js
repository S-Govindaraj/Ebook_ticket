const User = require('../Models/User');
const Role = require('../Models/Role');

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req?.query?.page) || 1; 
    const limit = parseInt(req?.query?.limit) || 10;
    const offset = (page - 1) * limit;

    const whereConditions = {};

    if (req.query.username) {
      whereConditions.username = { [Op.like]: `%${req.query.username}%` };
    }

    if (req.query.email) {
      whereConditions.email = { [Op.like]: `%${req.query.email}%` };
    }

    if (req.query.id) {
      whereConditions.id = req.query.id;
    }

    if (req.query.roleId) {
      whereConditions.roleId = req.query.roleId;
    }

    if (req.query.city) {
      whereConditions.city = { [Op.like]: `%${req.query.city}%` };
    }

    if (req.query.status) {
      whereConditions.status = req.query.status;
    }

    const users = await User.findAll({
      where: whereConditions,
      include: [{
        model: Role,
        as:'role',
        attributes: ['name'] 
      },
      {
        model: User,
        as:'creator',
        attributes: ['username'] 
      },
      {
        model: User,
        as:'updater',
        attributes: ['username'] 
      }],
      offset,
      limit,
    });
    const total = await User.count({ where: whereConditions });

    return res.json({
      data: users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error creating user' });
  }
};


exports.createUser = async (req, res) => {
  try {
    const { username, email, password,roleId,status } = req.body;
    const updatedBy = req.user.id;
    const createdBy = req.user.id;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
      roleId,
      updatedBy,
      createdBy,
      status
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
};;


exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params; 
    const updatedBy = req.user.id;
    const user = await User.findByPk(id);
    const { username, email, password, roleId, city, status } = req.body; 
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.password = password || user.password;
    user.roleId = roleId || user.roleId;
    user.city = city || user.city;
    user.status = status || user.status;
    user.updatedBy = updatedBy

    await user.save();

    return res.status(200).json({
      message: 'User updated successfully',
      user
    });
  } catch (err) {
    return  res.status(500).json({ message: 'Error updating user', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params; 
    const updatedBy = req.user.id;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 0;
    user.updatedBy = updatedBy
    await user.save();

    res.status(200).json({
      message: 'User deleted successfully',
      user
    });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};