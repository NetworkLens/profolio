const useragent = require("express-useragent")
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const projectsRouter = require("./routes/projects");
const usersRouter = require("./routes/users");
const authenticationRouter = require("./routes/authentication");
const uploadRouter = require("./routes/upload");
const analyticsRouter = require("./routes/analytics");
const tokenChecker = require("./middleware/tokenChecker");
const optionalTokenChecker = require("./middleware/optionalTokenChecker");


const app = express();
app.use(useragent.express());

// Allow requests from any client
// docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
// docs: https://expressjs.com/en/resources/middleware/cors.html

// Your new allowed origins list
const allowedOrigins = [
  'https://profolio.uk',
  'http://localhost:5173',
  'https://www.profolio.uk', // Good to add 'www' version too
  'http://localhost:3000'   // Keep your local dev environment
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

// Make sure you use the options
app.use(cors(corsOptions));

// Parse JSON request bodies, made available on `req.body`
app.use(bodyParser.json());

// API Routes
app.use("/projects", projectsRouter);
app.use("/users", usersRouter);
app.use("/tokens", authenticationRouter);
app.use("/upload", tokenChecker, uploadRouter);
app.use("/analytics", optionalTokenChecker, analyticsRouter);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ err: "Error 404: Not Found" });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  if (process.env.NODE_ENV === "development") {
    res.status(500).send(err.message);
  } else {
    res.status(500).json({ err: "Something went wrong" });
  }
});

module.exports = app;
