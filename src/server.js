const express = require("express");
const { engine } = require("express-handlebars");
const cors = require("cors");
const handlebars = require("express-handlebars");
const cookieParser = require("cookie-parser");
const path = require("path");
const methodOverride = require("method-override");
require("dotenv").config(); //load .env process.env...

const authMiddleware = require("./middlewares/auth.middleware");

const route = require("./routes/index.route");
const db = require("./config/db");

const app = express();

const whitelist = [
  "https://2dayoutfit.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    exposedHeaders: ["Vary"],
  })
);
app.use(express.json()); // parse JSON
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookieParser()); //parse cookie string to js object
app.use(authMiddleware);

// config template engine
app.engine(".hbs", engine({ extname: ".hbs" }));

app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs",
    helpers: {
      eq: function (v1, v2) {
        return v1 === v2;
      },
      formatDate: function (date) {
        return new Date(date).toLocaleDateString();
      },
      isEqual: function (v1, v2, options) {
        return v1 === v2 ? options.fn(this) : options.inverse(this);
      },
    },
  })
);
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));

//Routes init
route(app);
//Connect to db
db.connect();

app.listen(process.env.PORT, () => {
  console.log(`Server listening at http://localhost:${process.env.PORT}`);
});
