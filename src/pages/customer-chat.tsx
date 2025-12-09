import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/navbar";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  User,
  CheckCheck,
  Smile,
} from "lucide-react";

interface Message {
  id: number;
  sender: "customer" | "admin";
  text: string;
  time: string;
  read: boolean;
}

interface ChatUser {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  avatar?: string;
}

export default function CustomerChat() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<number>(1);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatUsers: ChatUser[] = [
    {
      id: 1,
      name: "ນາງ ສົມຈິດ",
      lastMessage: "ຂໍສອບຖາມກ່ຽວກັບແພັກເກັດຂໍ້ມູນ",
      time: "10:30",
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: "ທ້າວ ບຸນມີ",
      lastMessage: "ຕ້ອງການເຕີມເງິນມືຖື",
      time: "09:15",
      unread: 0,
      online: true,
    },
    {
      id: 3,
      name: "ນາງ ແສງດາວ",
      lastMessage: "ສອບຖາມບໍລິການ FTTH",
      time: "ມື້ວານ",
      unread: 1,
      online: false,
    },
    {
      id: 4,
      name: "ທ້າວ ພູມໃຈ",
      lastMessage: "ຂອບໃຈສຳລັບການຊ່ວຍເຫຼືອ",
      time: "ມື້ວານ",
      unread: 0,
      online: false,
    },
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "customer",
      text: "ສະບາຍດີ ຂ້ອຍຕ້ອງການສອບຖາມກ່ຽວກັບແພັກເກັດຂໍ້ມູນ",
      time: "10:25",
      read: true,
    },
    {
      id: 2,
      sender: "admin",
      text: "ສະບາຍດີ ຍິນດີຕ້ອນຮັບ! ແພັກເກັດຂໍ້ມູນໃດທີ່ທ່ານສົນໃຈ?",
      time: "10:26",
      read: true,
    },
    {
      id: 3,
      sender: "customer",
      text: "ຂ້ອຍຕ້ອງການແພັກເກັດອິນເຕີເນັດລາຍເດືອນ",
      time: "10:28",
      read: true,
    },
    {
      id: 4,
      sender: "admin",
      text: "ພວກເຮົາມີແພັກເກັດຫຼາຍຮູບແບບ:\n- ແພັກ 50GB: 99,000 ກີບ\n- ແພັກ 100GB: 149,000 ກີບ\n- ແພັກ Unlimited: 199,000 ກີບ\n\nແພັກໃດທີ່ເໝາະກັບທ່ານ?",
      time: "10:29",
      read: true,
    },
    {
      id: 5,
      sender: "customer",
      text: "ຂໍສອບຖາມກ່ຽວກັບແພັກເກັດຂໍ້ມູນ",
      time: "10:30",
      read: false,
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: "admin",
        text: messageText,
        time: new Date().toLocaleTimeString("lo-LA", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: false,
      };
      setMessages([...messages, newMessage]);
      setMessageText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredUsers = chatUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentUser = chatUsers.find((user) => user.id === selectedChat);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        
        .lao-font {
            font-family: 'Noto Sans Lao', sans-serif;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(239, 51, 40, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #EF3328;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d62a20;
        }
      `}</style>

      {/* Sidebar */}
      <Sidebar onToggle={setSidebarOpen} />

      {/* Main Content */}
      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? "256px" : "80px" }}
      >
        {/* Navbar */}
        <Navbar title="ສົນທະນາກັບລູກຄ້າ" />

        {/* Chat Container */}
        <div className="p-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[calc(100vh-200px)] flex">
            {/* Chat List Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="ຄົ້ນຫາການສົນທະນາ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedChat(user.id)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      selectedChat === user.id ? "bg-red-50" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#EF3328] to-[#d62a20] flex items-center justify-center text-white font-bold">
                        <User size={20} />
                      </div>
                      {user.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-[#140F36] lao-font">
                          {user.name}
                        </p>
                        <span className="text-xs text-gray-500 lao-font">
                          {user.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate lao-font">
                        {user.lastMessage}
                      </p>
                    </div>

                    {/* Unread Badge */}
                    {user.unread > 0 && (
                      <div className="w-6 h-6 rounded-full bg-[#EF3328] text-white text-xs flex items-center justify-center font-bold">
                        {user.unread}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              {currentUser && (
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#140F36] to-[#1a1447]">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EF3328] to-[#d62a20] flex items-center justify-center text-white font-bold">
                        <User size={18} />
                      </div>
                      {currentUser.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white lao-font">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-gray-300 lao-font">
                        {currentUser.online ? "ອອນໄລນ໌" : "ອອບໄລນ໌"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Phone size={20} className="text-white" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Video size={20} className="text-white" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <MoreVertical size={20} className="text-white" />
                    </button>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "admin"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        message.sender === "admin"
                          ? "bg-gradient-to-br from-[#EF3328] to-[#d62a20] text-white"
                          : "bg-white text-[#140F36]"
                      } rounded-2xl p-4 shadow-md`}
                    >
                      <p className="lao-font whitespace-pre-line">
                        {message.text}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-2">
                        <span
                          className={`text-xs lao-font ${
                            message.sender === "admin"
                              ? "text-white/80"
                              : "text-gray-500"
                          }`}
                        >
                          {message.time}
                        </span>
                        {message.sender === "admin" && (
                          <CheckCheck
                            size={14}
                            className={
                              message.read ? "text-blue-300" : "text-white/60"
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Paperclip size={20} className="text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Smile size={20} className="text-gray-500" />
                  </button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="ພິມຂໍ້ຄວາມ..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF3328] lao-font"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-3 bg-gradient-to-r from-[#EF3328] to-[#d62a20] text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}