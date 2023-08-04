const expressHandlebars = require("express-handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const Handlebars = require("handlebars");
const mongoose = require("mongoose");
const express = require("express");
const csrf = require("csurf");
const path = require("path");

const { PORT, MONGO_DB_URI } = require("dotenv").config().parsed;

const varMiddleware = require("./middleware/variables");
const userMiddleware = require("./middleware/user");
const addProductRoute = require("./routes/addProduct");
const productsRoute = require("./routes/products");
const ordersRoute = require("./routes/orders");
const authRoutes = require("./routes/auth");
const cartRoute = require("./routes/cart");
const homeRoute = require("./routes/home");

const app = express();

const hbs = expressHandlebars.create({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  defaultLayout: "main",
  extname: "hbs",
});

const store = new MongoStore({
  collection: "sessions",
  uri: MONGO_DB_URI,
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "./views");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "some secret value",
    resave: false,
    saveUninitialized: false,
    store,
  }),
);
app.use(csrf());
app.use(varMiddleware);
app.use(userMiddleware);

app.use("/add-product", addProductRoute);
app.use("/products", productsRoute);
app.use("/orders", ordersRoute);
app.use("/auth", authRoutes);
app.use("/cart", cartRoute);
app.use("/", homeRoute);

async function start() {
  try {
    await mongoose.connect(MONGO_DB_URI, {
      useNewUrlParser: true,
    });

    app.listen(PORT || 3000);
  } catch (e) {
    console.log(e);
  }
}

start();
