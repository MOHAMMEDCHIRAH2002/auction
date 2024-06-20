const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./model/User");
const userRoutes = require("./routes/UserRoute");
const categoryRoutes = require("./routes/CategoryRoute");
const productRoutes = require("./routes/ProductRoute");
const orderRoutes = require("./routes/OrderRoute");
const bcrypt = require("bcrypt");
const cors = require("cors");
const nodemailer = require("nodemailer");
const dbconnect = require("./config/databasconnection");
const jwt = require("jsonwebtoken");

require("dotenv").config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

// Connect to database
dbconnect.connect();

// Middleware
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

// --------------------------------------Use session to initialize localPassport------------------------------
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      const user = await User.findOne({ email: email });
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return done(null, false);
      }
      return done(null, user);
    }
  )
);
//--------------------------------------------------in_first_login_Create Session && stock_some_user_data_in_session && send coockie_to_user_browser----------------------
passport.serializeUser((user, done) => {
  done(null, user._id);
});
//--------------------------when user send request passport verify if user has a coockie contain his data-------------------------------
passport.deserializeUser(async (_id, done) => {
  const user = await User.findOne({ _id: _id });
  done(null, user);
});

// Routes
app.use("/", userRoutes);
app.use("/", categoryRoutes);
app.use("/", productRoutes);
app.use("/", orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error: ", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
