const express = require('express')
const app = express();
const http = require("http")
const { Server } = require('socket.io')
const cors = require('cors')


app.use(cors())
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);
    // //Gửi 1 tin đi tất ca
    // socket.on("send_message",(data)=>{
    //  //Nhận mess từ client gửi console.log(data);
    //     socket.broadcast.emit("receive_message",data) // gửi đi tất cả các người dugf dùng chugn web
    //  })
    socket.on("join_room", (data) => {
        socket.join(data)
    })
    //gửi đến tất cả ng trong phòng ko bao gồm ng gửi 
    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data) // gửi tin nhan den room 
    })
    // gửi đến tất cả ng trong phòng bao gồm người gửi
    // socket.on("send_message", (data) => {
    //     const {room,message} = data;
    //     io.in(room).emit("receive_message",{ message, senderId: socket.id}) // gửi tin nhan den room 
    // })

    socket.on('disconnect', () => {
        console.log(`User Disconnect: ${socket.id}`);
      });
});

server.listen(3001, () => {
    console.log("SERVER IS RUNNING");

})