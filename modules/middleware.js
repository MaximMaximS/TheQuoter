require("dotenv").config({ path: "../.env" });
const jwt = require("jsonwebtoken");
module.exports = {
  // Verify JWT
  verifyJWT: (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];

      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }

        req.user = user;
        next();
      });
    } else {
      return res.sendStatus(401);
    }
  },
};
