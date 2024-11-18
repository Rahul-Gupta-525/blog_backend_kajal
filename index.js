const express = require('express')
const http = require("http");
const connectDB = require('./config/db')
const cors = require('cors')
require("dotenv").config()
const fs = require('fs');
const path = require('path');
const socketIo = require("socket.io");
const authRoutes = require('./routes/authRoutes')
const postRoutes = require('./routes/postRoutes')
const { handleNewComment } = require("./controllers/postControllers");
const app = express()
connectDB()

const PORT = process.env.PORT || 3500

const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const server = http.createServer(app);
const io = socketIo(server)
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle new comments
  socket.on("newComment", (data) => {
      handleNewComment(io, socket, data); 
  });

  socket.on("disconnect", () => {
      console.log("User disconnected");
  });
});

app.use(express.json())
app.use(express.urlencoded({ extended: true })); 
app.use(cors())
app.use('/uploads', express.static('public/uploads'));

app.use('/api/auth', authRoutes)
app.use('/api/blogs', postRoutes)

app.listen(PORT, (err)=>{
    if(err) throw err;
    console.log(`server is running on ${PORT}`)
})