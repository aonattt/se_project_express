const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes");
const { ERROR_CODE_500 } = require("./utils/errors");

const app = express();
const { PORT = 3001 } = process.env;

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Database connection error:", err));

app.use(cors());

app.use(express.json());

app.use(routes);
app.use((err, req, res, next) => {
  const { statusCode = ERROR_CODE_500, message } = err;
  res.status(statusCode).send({
    message:
      statusCode === ERROR_CODE_500
        ? "An error occurred on the server"
        : message,
  });
});

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
