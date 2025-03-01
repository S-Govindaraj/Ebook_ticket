const express = require("express");
const config = require("config");
const bodyParser = require("body-parser");
const cors = require('cors');
const { connectDB, sequelize } = require("./app/Middleware/database");
const { RequestDecrypt } = require("./app/Middleware/RequestDecrypt");
const app = express();
 connectDB();
sequelize.sync({ alter: true }).then(() => {
  console.log("Database synchronized successfully");
}).catch((error) => {
  console.error("Error synchronizing database:", error);
});

app.set('trust proxy', true);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json());

app.use(cors({
  origin: '*'
}));

app.use(RequestDecrypt);

app.set("view engine", "ejs");

app.use("/public", express.static("public"));

app.use("/api", require("./app/routes/api"));

const HOST = config.get("HOST");
const PORT = config.get("PORT");

if (!module.parent) {
  const server = app.listen(PORT, () => {
    console.log(`Node server running on http://${HOST}:${PORT}`);
  });
}

module.exports = { app, sequelize };
