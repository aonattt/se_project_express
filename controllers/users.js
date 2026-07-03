const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/user");
const {
  ERROR_CODE_400,
  ERROR_CODE_401,
  ERROR_CODE_404,
  ERROR_CODE_409,
  ERROR_CODE_500,
} = require("../utils/errors");

const getCurrentUser = (req, res) => {
  User.findById(req.user._id)
    .orFail(() => {
      const error = new Error("User not found");
      error.statusCode = ERROR_CODE_404;
      throw error;
    })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === "CastError") {
        return res
          .status(ERROR_CODE_400)
          .send({ message: "Invalid user ID format" });
      }
      if (err.statusCode === ERROR_CODE_404) {
        return res.status(ERROR_CODE_404).send({ message: err.message });
      }
      return res
        .status(ERROR_CODE_500)
        .send({ message: "An error has occurred on the server" });
    });
};

const updateUserProfile = (req, res) => {
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .orFail(() => {
      const error = new Error("User not found");
      error.statusCode = ERROR_CODE_404;
      throw error;
    })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res
          .status(ERROR_CODE_400)
          .send({ message: "Invalid data passed" });
      }
      if (err.statusCode === ERROR_CODE_404) {
        return res.status(ERROR_CODE_404).send({ message: err.message });
      }
      return res
        .status(ERROR_CODE_500)
        .send({ message: "An error has occurred on the server" });
    });
};

const createUser = async (req, res) => {
  try {
    const { name, avatar, email, password } = req.body;

    if (!email || !password) {
      return res
        .status(ERROR_CODE_400)
        .send({ message: "Invalid user data passed" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      avatar,
      email,
      password: hashedPassword,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).send(userResponse);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(ERROR_CODE_409)
        .send({ message: "A user with this email already exists" });
    }
    if (err.name === "ValidationError") {
      return res
        .status(ERROR_CODE_400)
        .send({ message: "Invalid user data passed" });
    }
    return res.status(ERROR_CODE_500).send({ message: "Default server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(ERROR_CODE_400)
        .send({ message: "Email and password are required" });
    }

    const user = await User.findUserByCredentials(email, password);

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    return res.send({ token });
  } catch (err) {
    if (err.message === "Incorrect email or password") {
      return res
        .status(ERROR_CODE_401)
        .send({ message: "Incorrect email or password" });
    }
    return res.status(ERROR_CODE_500).send({ message: "Default server error" });
  }
};

module.exports = {
  getCurrentUser,
  updateUserProfile,
  createUser,
  login,
};
