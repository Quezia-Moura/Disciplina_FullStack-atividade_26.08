const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const dotenv = require('dotenv');
dotenv.config();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        email,
        password: hashedPassword
    });

    res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user.id)
    });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            token: generateToken(user.id)
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

exports.getUsers = async (req, res) => {
    const users = await User.findAll({
        attributes: ['id', 'username', 'email', 'createdAt', 'updatedAt']
    });
    res.json(users);
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email } = req.body;

    if (req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: 'You can only update your own account' });
    }

    await User.update({ username, email }, { where: { id } });

    const updatedUser = await User.findOne({ where: { id }, attributes: ['id', 'username', 'email'] });

    res.json(updatedUser);
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    if (req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: 'You can only delete your own account' });
    }

    await User.destroy({ where: { id } });

    res.json({ message: 'User deleted' });
};
