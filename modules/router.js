require("dotenv").config({ path: "../.env" });
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/login", (req, res) => {
  // Get username and password from request body
  const { username, password } = req.body;
  // Check if username and password are valid
  if (
    username === process.env.LOGIN &&
    bcrypt.compareSync(password, process.env.PASSWORD)
  ) {
    // Generate a token
    const token = jwt.sign(
      {
        username: username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    return res.status(200).setHeader("Content-Type", "text/plain").send(token);
  }
  return res.sendStatus(401);
});



module.exports = router;
