const Item = require("../models/clothingItem");
const {
  ERROR_CODE_400,
  ERROR_CODE_404,
  ERROR_CODE_500,
} = require("../utils/errors");

const getItems = (req, res) => {
  Item.find({})
    .then((items) => res.status(200).send(items))
    .catch(() =>
      res
        .status(ERROR_CODE_500)
        .send({ message: "An error has occurred on the server" })
    );
};

const createItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;
  Item.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => res.status(201).send(item))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res
          .status(ERROR_CODE_400)
          .send({ message: "Invalid data passed to item creation" });
      }
      return res
        .status(ERROR_CODE_500)
        .send({ message: "An error has occurred on the server" });
    });
};

const deleteItem = (req, res) => {
  Item.findByIdAndDelete(req.params.itemId)
    .orFail(() => {
      const error = new Error("Item ID not found");
      error.statusCode = ERROR_CODE_404;
      throw error;
    })
    .then((item) => res.status(200).send(item))
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(ERROR_CODE_400).send({ message: "Invalid item ID" });
      }
      if (err.statusCode === ERROR_CODE_404) {
        return res.status(ERROR_CODE_404).send({ message: err.message });
      }
      return res
        .status(ERROR_CODE_500)
        .send({ message: "An error has occurred on the server" });
    });
};

const likeItem = (req, res) => {
  Item.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } }, // adds _id to array if not present
    { new: true } // ensures Mongoose returns the updated document
  )
    .orFail(() => {
      const error = new Error("Item ID not found");
      error.statusCode = ERROR_CODE_404;
      throw error;
    })
    .then((item) => res.status(200).send(item))
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(ERROR_CODE_400).send({ message: "Invalid item ID" });
      }
      if (err.statusCode === ERROR_CODE_404) {
        return res.status(ERROR_CODE_404).send({ message: err.message });
      }
      return res
        .status(ERROR_CODE_500)
        .send({ message: "An error has occurred on the server" });
    });
};

const dislikeItem = (req, res) => {
  Item.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } }, // removes _id from array
    { new: true }
  )
    .orFail(() => {
      const error = new Error("Item ID not found");
      error.statusCode = ERROR_CODE_404;
      throw error;
    })
    .then((item) => res.status(200).send(item))
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(ERROR_CODE_400).send({ message: "Invalid item ID" });
      }
      if (err.statusCode === ERROR_CODE_404) {
        return res.status(ERROR_CODE_404).send({ message: err.message });
      }
      return res
        .status(ERROR_CODE_500)
        .send({ message: "An error has occurred on the server" });
    });
};

module.exports = { getItems, createItem, deleteItem, likeItem, dislikeItem };
