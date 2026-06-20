const User = require("../models/user");
const {
  ERROR_CODE_400,
  ERROR_CODE_404,
  ERROR_CODE_500,
} = require("../utils/errors");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(() =>
      res
        .status(ERROR_CODE_500)
        .send({ message: "An error has occurred on the server" })
    );
};

const getUser = (req, res) => {
  User.findById(req.params.userId)
    .orFail(() => {
      const error = new Error("User ID not found");
      error.statusCode = ERROR_CODE_404;
      throw error;
    })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(ERROR_CODE_400).send({ message: "Invalid user ID" });
      }
      if (err.statusCode === ERROR_CODE_404) {
        return res.status(ERROR_CODE_404).send({ message: err.message });
      }
      return res
        .status(ERROR_CODE_500)
        .send({ message: "An error has occurred on the server" });
    });
};

const createUser = (req, res) => {
  const { name, avatar } = req.body;
  User.create({ name, avatar })
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res
          .status(ERROR_CODE_400)
          .send({ message: "Invalid data passed to user creation" });
      }
      return res
        .status(ERROR_CODE_500)
        .send({ message: "An error has occurred on the server" });
    });
};

module.exports = { getUsers, getUser, createUser };
