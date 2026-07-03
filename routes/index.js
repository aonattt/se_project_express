const router = require("express").Router();
const userRouter = require("./users");
const itemRouter = require("./clothingItems");
const { createUser, login } = require("../controllers/users");
const auth = require("../middlewares/auth");
const { ERROR_CODE_404 } = require("../utils/errors");

router.post("/signup", createUser);
router.post("/signin", login);
router.use("/items", itemRouter);

router.use(auth);

router.use("/users", userRouter);

router.use((req, res) => {
  res.status(ERROR_CODE_404).send({ message: "Requested resource not found" });
});

module.exports = router;
