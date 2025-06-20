const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const User = require('../models/user');


const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  }
  catch (err) {
    const error = new HttpError('Fetching users failed, please try again later.', 500);
    return next(error);
  }

  // Add this mapping to update image path
  const usersWithImageUrl = users.map(user => {
    const userObj = user.toObject({ getters: true });
    if (userObj.image && typeof userObj.image === 'string' && userObj.image.trim() !== '' && !userObj.image.startsWith('http')) {
      userObj.image = `${req.protocol}://${req.get('host')}/${userObj.image.replace(/\\/g, '/')}`;
    } else if (!userObj.image || userObj.image.trim() === '') {
      userObj.image = null; // or set a default image URL if you want
    }
    return userObj;
  });

  res.json({ users: usersWithImageUrl });
};



const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  }
  catch (err) {
    const error = new HttpError('Signing up failed, please try again later.', 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('User exists already, please login instead.', 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  }
  catch (err) {
    const error = new HttpError('Could not create user, Please try again later', 500)
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file ? 'uploads/images/' + req.file.filename : null,
    password: hashedPassword,
    places: []
  });

  try {
    await createdUser.save();
  }
  catch (err) {
    const error = new HttpError('Signing Up failed, please try again.', 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign({ userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' })
  }
  catch (err) {
    const error = new HttpError('Signing up failed', 500);
    return next(error);
  }

  res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
};



const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  }
  catch (err) {
    const error = new HttpError('Logging in failed, please try again later.', 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError('Invalid credentials, could not log you in.', 401);
    return next(error);
  };

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  }
  catch (err) {
    const error = new HttpError('Could not log you in, please check your credentials and try again', 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError('Invalid credentials, could not log you in.', 401);
    return next(error);
  };

  let token;
  try {
    token = jwt.sign({ userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' })
  }
  catch (err) {
    const error = new HttpError('Logging in failed', 500);
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
