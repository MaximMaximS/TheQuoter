require("dotenv").config({ path: "../.env" });
const express = require("express");
const auth = require("./auth");
const router = express.Router();
const { asyncUtil } = require("./middleware");

// Get JWT
router.post(
  "/login",
  asyncUtil(async (req, res) => {
    let user = await auth.login(req.body);
    let token = auth.getToken(user);
    res.json({
      token,
    });
  })
);

router.post(
  "/register",
  asyncUtil(async (req, res) => {
    let user = await auth.register(req.body);
    let token = auth.getToken(user);
    res.status(201).json({
      token,
    });
  })
);

module.exports = router;
