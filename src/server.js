const express = require("express");
const { engine } = require("express-handlebars");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const methodOverride = require("method-override");
require("dotenv").config(); //load .env process.env...

const authMiddleware = require("./middlewares/auth.middleware");

const route = require("./routes/index.route");
const db = require("./config/db");

const app = express();

app.use(cors()); // cho phép frontend gọi API
app.use(express.json()); // parse JSON
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookieParser()); //parse cookie string to js object
app.use(authMiddleware);

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
