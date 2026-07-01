const router = require("express").Router();
const userRouter = require("./users");
const itemRouter = require("./clothingItems");
const { createUser, login } = require("../controllers/users");
const auth = require("../middlewares/auth");

router.post("/signup", createUser);
router.post("/signin", login);
router.use("/items", itemRouter);

router.use(auth);

router.use("/users", userRouter);

module.exports = router;
