const express = require("express");
const dotenv = require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit"); 
const xss = require("xss-clean");
const hpp = require("hpp"); 

const dbConnect = require("./config/dbConnect");

const notFound = require("./middleware/notFound");
const auth = require("./middleware/authMiddleware");
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");

const authRoutes = require('./router/Common');
const adminRoutes = require('./router/Admin');
const agentRoutes = require('./router/Agent');







const app = express();
const PORT = process.env.PORT || 5000; 

mongoose.set("strictQuery", true);

// Database Connection
dbConnect();

// Middleware Setup
app.use(helmet()); 
app.use(morgan("combined")); 
app.use(compression()); 
app.use(express.json({ limit: '150kb' })); 
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(xss());
app.use(hpp()); 

const corsOptions = {
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, 
};

app.use(cors(corsOptions));

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100, 
//   message: 'Too many requests from this IP, please try again later.',
// });
// app.use('/api', limiter); 

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/agent',agentRoutes);

// app.use('/api/agent', require('./routes/agent')); 
// app.use('/api/player', require('./routes/player')); 
// app.use('/api/common', require('./routes/common')); 

// Error Handling Middleware
// app.use(notFound);
// app.use(errorHandler);
// app.use(requestLogger);


// Server Listening
app.listen(PORT, () => {
  console.log("===================================");
  console.log(`Server is running at PORT ==> ${PORT}`.yellow.bold);
  console.log("===================================");
  console.log("|");
  console.log("|");
});

module.exports = app;
