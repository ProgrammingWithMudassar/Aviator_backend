const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const dotenv = require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const mongoose = require("mongoose");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp"); 
const dbConnect = require("./config/dbConnect");

const authRoutes = require('./router/Common');
const adminRoutes = require('./router/Admin');
const agentRoutes = require('./router/Agent');
const gamesRoutes = require('./router/Game');

const { initializeBettingJob } = require('./controllers/Games/startBettingForAgent');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});
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

// Socket setup
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, 
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/games', gamesRoutes);

// Expose socket.io instance
app.set('socketio', io);

// Initialize the betting job when the server starts
// initializeBettingJob(io);

// Server Listening
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
