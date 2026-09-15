const JWT_SECRET =
  process.env.NODE_ENV === "production"
    ? process.env.JWT_SECRET
    : "my-super-secret-key";

module.exports = { JWT_SECRET };
