import { useState, useEffect, useRef } from "react";
import { Bell, Clock, Calendar } from "lucide-react";

interface NavbarProps {
  className?: string;
  title?: string;
  showClock?: boolean;
}

export default function Navbar({ className = "", title = "ໜ້າຫຼັກ", showClock = true }: NavbarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const [notifications] = useState([
    { id: 1, title: "ການຊຳລະໃໝ່", message: "ມີການຊຳລະເງິນສຳເລັດ 250,000 ກີບ", time: "5 ນາທີກ່ອນ", unread: true },
    { id: 2, title: "ຜູ້ໃຊ້ໃໝ່", message: "ມີຜູ້ໃຊ້ໃໝ່ລົງທະບຽນ", time: "15 ນາທີກ່ອນ", unread: true },
    { id: 3, title: "ບໍລິການ FTTH", message: "ມີການຈອງ FTTH ໃໝ່", time: "1 ຊົ່ວໂມງກ່ອນ", unread: false },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav className={`bg-gradient-to-r from-[#140F36] via-[#1a1447] to-[#140F36] border-b border-[#454350]/30 sticky top-0 z-40 shadow-lg ${className}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        
        .lao-font {
            font-family: 'Noto Sans Lao', sans-serif;
        }
      `}</style>
      
      <div className="px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          {/* Left Side - Title & Date */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 lao-font">
              {title}
            </h1>
            <p className="text-gray-300 flex items-center gap-2 lao-font">
              <Calendar size={18} />
              {currentTime.toLocaleDateString("lo-LA", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Right Side - Notifications & Clock */}
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all duration-300 relative"
              >
                <Bell size={20} className="text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#EF3328] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-[#EF3328] to-[#d62a20] p-4">
                    <h3 className="text-white font-bold lao-font">ການແຈ້ງເຕືອນ</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          notification.unread ? 'bg-red-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {notification.unread && (
                            <div className="w-2 h-2 bg-[#EF3328] rounded-full mt-2"></div>
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-[#140F36] lao-font">
                              {notification.title}
                            </p>
                            <p className="text-sm text-[#454350] lao-font mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 lao-font mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-gray-50 text-center">
                    <button className="text-[#EF3328] text-sm font-semibold hover:underline lao-font">
                      ເບິ່ງທັງໝົດ
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Time Display */}
            {showClock && (
              <div className="bg-gradient-to-r from-[#EF3328] to-[#d62a20] px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 text-white">
                <Clock size={20} />
                <span className="text-lg font-semibold lao-font">
                  {currentTime.toLocaleTimeString("lo-LA")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}