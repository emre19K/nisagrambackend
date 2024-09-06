require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middlewares/errorHandler"); // Import the error handler
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swaggerConfig'); // Import Swagger configuration

const server = express();
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 100 requests per windowMs
});

// Trust proxy
server.set("trust proxy", "127.0.0.1");

server.use(limiter); // Apply rate limiting to all requests

if (process.env.FRONTEND_ORIGIN) {
  let corsOptions = {
    origin: process.env.FRONTEND_ORIGIN,
    optionsSuccessStatus: 200,
  };
  server.use(cors(corsOptions));
} else {
  server.use(cors());
}

// ROUTES
const post_routes = require("./endpoints/routes/postRoutes");
const question_routes = require("./endpoints/routes/questionRoutes");
const user_routes = require("./endpoints/routes/userRoutes");
const auth_routes = require("./endpoints/routes/authRoutes");
const like_routes = require("./endpoints/routes/likeRoutes");
const comment_routes = require("./endpoints/routes/commentRoutes");

// VARIABLES
const DB_URI = process.env.DB_URI || "mongodb://127.0.0.1:27017";
if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not defined. Set it in your environment variables."
  );
}

// MIDDLEWARES
server.use(bodyParser.json());
server.use("/static", express.static("static"));
server.use("/posts", post_routes);
server.use("/user", user_routes);
server.use("/auth", auth_routes);
server.use("/like", like_routes);
server.use("/comment", comment_routes);
server.use("/question", question_routes);


// Swagger UI setup
server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Error handling middleware (must be added after all other middleware and routes)
server.use(errorHandler);

server.listen(8000, () => console.log("Server wartet auf Port 8000"));

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("Erfolgreich mit der Datenbank verbunden!");
  })
  .catch((error) => {
    console.error("Fehler beim Verbinden mit MongoDB:", error.message);
  });
