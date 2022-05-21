require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const errors = require("./errors");
const saltRounds = 12;

connect();

async function connect() {
  await mongoose.connect(process.env.MONGODB_URI);
  
}

module.exports = {
  register(body) {
    return new Promise((resolve, reject) => {
      const password = body.password;
      // Check if password is 6 characters or more
      if (password.length < 6) {
        return reject(
          new errors.ValidationError([
            new errors.ValidatorError({ path: "password", kind: "minlength" }),
          ])
        );
      }
      bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
          return reject(new errors.ServerError(err));
        }
        const user = new User({
          username: body.username,
          hash,
          email: body.email,
        });
        user.save(function (err) {
          if (err) {
            if (err instanceof mongoose.Error.ValidationError) {
              let errs = [];
              for (const key in err.errors) {
                errs.push(
                  new errors.ValidatorError({
                    path: err.errors[key].path,
                    kind: err.errors[key].kind,
                  })
                );
              }
              return reject(new errors.ValidationError(errs));
            }
            return reject(new errors.ServerError(err));
          }
          resolve(user);
        });
      });
    });
  },
};
