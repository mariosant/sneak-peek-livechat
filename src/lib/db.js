const monk = require("monk");

const { MONGODB_URL } = process.env;

const db = monk(MONGODB_URL);

module.exports = {
  db,
  collections: {
    accounts: db.get("accounts"),
  },
};
