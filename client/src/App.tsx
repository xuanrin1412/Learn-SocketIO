import { useEffect, useState } from "react"
import io from "socket.io-client"
const socket = io("http://localhost:3001")


function App() {
  const [message, setMessage] = useState<string>()
  const [messageReceived, setMessageReceived] = useState<string>()
  
  const [room, setRoom] = useState<string>()

  // const sendMessage = () => {
  //   // Gửi đi tin nhắn về server
  //   socket.emit('send_message', { message })
  // }

  const joinRoom = () =>{
    if(room !== ""){
      socket.emit("join_room", room)
    }
  }
    const sendMessage = () => {
    // Gửi đi tin nhắn về server
    socket.emit('send_message', { message,room })
  }

  useEffect(() => {
    // lắng nghe hiển thị tin nhắn từ một người dùng tren cùng website
    socket.on("receive_message", (data) => {
      setMessageReceived(data.message)
    })
  }, [socket])
  return (
    <div className="p-5 space-y-2">
      <div className="flex space-x-2" >
        <input placeholder="Room Number" onChange={(e) => setRoom(e.target.value)} type="text" className="h-8 p-4 rounded-xl border-2  w-80" />
        <button onClick={joinRoom} className="h-8 p-4 flex items-center bg-black text-white rounded-xl border-2 ">Join Room</button>
      </div>
      <div className="flex  space-x-2" >
        <input placeholder="Message..." onChange={(e) => setMessage(e.target.value)} type="text" className="h-8 p-4 rounded-xl border-2  w-80" />
        <button onClick={sendMessage} className="h-8 p-4 flex items-center bg-black text-white rounded-xl border-2 ">Send Message</button>
      </div>
      <div className="mt-10 w-1/3 text-center">
        <h1 className="text-xl font-bold mb-5">Message:</h1>
        <div className=" border-b-2 pb-2">{messageReceived}</div>
      
      </div>
    </div>
  )
}

export default App
