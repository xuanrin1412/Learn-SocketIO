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
const rooms = {};
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);
    // //Gửi 1 tin đi tất ca
    // socket.on("send_message",(data)=>{
    //  //Nhận mess từ client gửi console.log(data);
    //     socket.broadcast.emit("receive_message",data) // gửi đi tất cả các người dugf dùng chugn web
    //  })
    socket.on("join_room", (room) => {
        socket.join(room)
        if (!rooms[room]) {
            rooms[room] = []
        }
        rooms[room].push(socket.id)

        io.in(room).emit("room_data", {room, users:rooms[room]})
    })
    //gửi đến tất cả ng trong phòng ko bao gồm ng gửi 
    // socket.on("send_message", (data) => {
    //     socket.to(data.room).emit("receive_message", data) // gửi tin nhan den room 
    // })
    //gửi đến tất cả ng trong phòng bao gồm người gửi
    socket.on("send_message", (data) => {
        const { room, message } = data;
        const timestamp = new Date();
        io.in(room).emit("receive_message", { message, senderId: socket.id, timestamp }) // gửi tin nhan den room 
    })

    socket.on('disconnect', () => {
        console.log(`User Disconnect: ${socket.id}`);
        for (let room in rooms) {
            if(rooms[room].includes(socket.id)){
                rooms[room] = rooms[room].filter(id => id !== socket.id);
                io.in(room).emit("room_data", { room, users: rooms[room] });
                io.in(room).emit("user_left", { userId: socket.id});
            }
           
        }
    });
});

server.listen(3001, () => {
    console.log("SERVER IS RUNNING");

})