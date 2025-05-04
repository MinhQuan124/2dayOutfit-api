const express = require("express");
const { engine } = require("express-handlebars");
const cors = require("cors");
const path = require("path");
const methodOverride = require("method-override");
require("dotenv").config();

const route = require("./routes/index.route");
const db = require("./config/db");

const app = express();

app.use(cors()); // cho phép frontend gọi API
app.use(express.json()); // parse JSON
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const port = 8000;

// config template engine
app.engine(".hbs", engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));

//Routes init
route(app);
//Connect to db
db.connect();

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
