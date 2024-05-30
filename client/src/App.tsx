import { useEffect, useState } from "react"
import io from "socket.io-client"
const socket = io("http://localhost:3001")

interface Message {
  message: string;
  senderId: string;
  timestamp: string;
}
interface RoomData {
  room: string;
  users: string[];
}

function App() {
  const [message, setMessage] = useState<string>("")
  const [messageReceived, setMessageReceived] = useState<Message[]>([])
  const [leftUser, setLeftUser] = useState<string | null>(null);
  const [room, setRoom] = useState<string>()
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  // const sendMessage = () => {
  //   // Gửi đi tin nhắn về server
  //   socket.emit('send_message', { message })
  // }

  const joinRoom = () => {
    if (room) {
      socket.emit("join_room", room)
    }
  }
  const sendMessage = () => {
    // Gửi đi tin nhắn về server
    if (message && room) {
      const timestamp = new Date().toISOString();
      socket.emit('send_message', { message, room, timestamp })
      setMessage("")
    }
  }

  useEffect(() => {
    // lắng nghe hiển thị tin nhắn từ một người dùng tren cùng website
    socket.on("receive_message", (data: Message) => {
      // setMessageReceived(data.message)
      setMessageReceived((prevMessages) => [...prevMessages, data])
      if ("Notification" in window && Notification.permission === "granted") {
        // Hiển thị thông báo trên tab trình duyệt khi có tin nhắn mới
        new Notification("New Message", {
          body: `${data.senderId === socket.id ? "You" : "Someone"} sent a new message: ${data.message}`,
        });
      }
    })

    socket.on("room_data", (data: RoomData) => {
      setActiveUsers(data.users);
    });
    socket.on("user_left", (data) => {
      const { userId } = data;
      setLeftUser(userId);
      setTimeout(() => {
        setLeftUser(null);
      }, 3000); // Clear the left user message after 3 seconds
      setActiveUsers((prevUsers) => prevUsers.filter(user => user !== userId));
    });

    return () => {
      socket.off("receive_message");
      socket.off("room_data");
    };
    
  }, [socket, message])
  return (
    <div className="p-5 space-y-2">
      <div className="flex space-x-2" >
        <input placeholder="Room Number" onChange={(e) => setRoom(e.target.value)} type="text" className="h-8 p-4 rounded-xl border-2  w-80" />
        <button onClick={joinRoom} className="h-8 p-4 flex items-center bg-black text-white rounded-xl border-2 ">Join Room</button>
      </div>
      <div className="flex  space-x-2" >
        <input value={message} placeholder="Message..." onChange={(e) => setMessage(e.target.value)} type="text" className="h-8 p-4 rounded-xl border-2  w-80" />
        <button onClick={sendMessage} className="h-8 p-4 flex items-center bg-black text-white rounded-xl border-2 ">Send Message</button>
      </div>
      <div className="mt-10 w-1/3 text-center">
        <h1 className="text-xl font-bold mb-5">Message:</h1>
        {activeUsers.map((user, index) => (
          <div key={index} className="flex items-center space-x-3">
            <span className="h-3 w-3 bg-green-400 rounded-full"></span>
            <strong className="mr-4">{user === socket.id ? "you" : user.substring(0, 5)}</strong>
            <span>join room </span>
          </div>
        ))}
        {leftUser && (
          // <div>
          //   <strong className="mr-4">{leftUser === socket.id ? "You" : leftUser.substring(0, 5)}</strong>
          //   left the room
          // </div>

          <div className="flex items-center space-x-3">
            <span className="h-3 w-3 bg-red-700 rounded-full"></span>
            <strong className="mr-4">{leftUser === socket.id ? "You" : leftUser.substring(0, 5)}</strong>
            <span>left room </span>
          </div>
        )}
        <div className="  flex flex-col space-y-4 mt-10">
          {messageReceived?.map((msg, index) => (
            <div key={index} className={`  ${msg.senderId === socket.id ? " text-right" : "text-left"}`}>
              <div className={`${msg.senderId === socket.id ?" flex-row-reverse":""} space-x-2 flex `}>
                <strong>{msg.senderId === socket.id ?<span  className="border-2 p-1 border-black ">you</span> :<span className="border-2 p-1 border-black">{msg.senderId.substring(0, 5)}</span> }</strong>
                <span className="pr-4">{msg.message}</span>
              </div>
              <div className="text-[10px] text-gray-500 mt-2">{new Date(msg.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default App
