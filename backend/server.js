import express from "express";
import http from "http";
import { Server } from "socket.io";
import { db } from "./config/db.js";
import route from "./routes/message.route.js";
import cors from 'cors';
import path from "path";

// Create an Express & HTTP server
const app = express();
const server = http.createServer(app);

// Connect to MongoDB
db();

// for hosting
const __dirname = path.resolve();

// Middleware
app.use(express.json());
app.use(cors(
    {
        origin: "http://localhost:5173",
        methods: ["GET", "POST","DELETE"],
        credentials: true 
    }
))

// Socket.io configuration
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true 
    },
});

// Routes
app.use("/api/v1/message", route);

// Socket.io event listeners
io.on("connection", (socket) => {
    console.log("user connected");

    // Send and receive messages
    socket.on("sendMessage", (data) => {
        io.emit("receiveMessage", { data });
    })

    // Send and receive typing status
    socket.on("startTyping", (username) => {
        socket.broadcast.emit("typing", username );
    });

    socket.on("stopTyping", () => {
        socket.broadcast.emit("stopTyping");
    });


    // Disconnect socket
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});


if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend","/dist","/index.html"));
    });
}


// Start the server
server.listen(4000, () => {
    console.log("listening on 4000");
});