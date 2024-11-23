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

const   server = http.createServer(app);
const io = socketIo(server,
 { cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
},}
)
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("joinBlogRoom", (blogId) => {
    socket.join(blogId);
    console.log(`User joined room: ${blogId}`);
});
  // Handle new comments
  socket.on("newComment", (data) => {
      handleNewComment(io, socket, data); 
      
  });

 

  socket.on("disconnect", () => {
      console.log("User disconnected");
  });
});

// io.on("connection", (socket) => {
//     console.log("A user connected:", socket.id);

//     // Listen for a new comment
//     socket.on("new_comment", async ({ blogId, userId, userName, comment }) => {
//         try {
//             const blog = await Blog.findById(blogId);
//             if (!blog) {
//                 socket.emit("error", { message: "Blog not found" });
//                 return;
//             }

//             const newComment = { userId, userName, comment };
//             blog.comments.push(newComment);
//             await blog.save();

//             // Broadcast the comment to all connected clients
//             io.emit("comment_added", { blogId, newComment });
//         } catch (error) {
//             console.error(error);
//             socket.emit("error", { message: "Failed to add comment" });
//         }
//     });

//     socket.on("disconnect", () => {
//         console.log("A user disconnected:", socket.id);
//     });
// });
app.use(express.json())
app.use(express.urlencoded({ extended: true })); 
app.use(cors())
app.use('/uploads', express.static('public/uploads'));

app.use('/api/auth', authRoutes)
app.use('/api/blogs', postRoutes)

server.listen(PORT, (err)=>{
    if(err) throw err;
    console.log(`server is running on ${PORT}`)
})