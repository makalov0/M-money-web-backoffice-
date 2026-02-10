// src/components/layout/navbar.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Clock, Calendar } from "lucide-react";
import { createAdminSocket } from "../../utils/socket";
import type { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom"; // ✅ add this

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  conversation_id?: number;
};

type SocketNewMessagePayload = {
  conversation?: {
    id?: number;
    conversation_id?: number;
    first_name?: string;
    last_name?: string;
    customer_phone?: string;
  };
  message?: {
    id?: number | string;
    sender_role?: string;
    message_type?: "text" | "image";
    message_text?: string;
    created_at?: string;
  };
};

interface NavbarProps {
  className?: string;
  title?: string;
  showClock?: boolean;
}

export default function Navbar({
  className = "",
  title = "ໜ້າຫຼັກ",
  showClock = true,
}: NavbarProps) {
  const navigate = useNavigate(); // ✅ add this

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const token = useMemo(() => localStorage.getItem("token") || "", []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!token) return;

    const socket = createAdminSocket(token);
    socketRef.current = socket;

    socket.on("new_message", (raw: unknown) => {
      if (typeof raw !== "object" || raw === null) return;

      const payload = raw as SocketNewMessagePayload;
      const message = payload.message;
      const conversation = payload.conversation;

      // ✅ only notify when CUSTOMER sends
      if (!message || message.sender_role?.toUpperCase() !== "CUSTOMER") return;

      const convoId = Number(conversation?.id ?? conversation?.conversation_id) || undefined;

      const name =
        `${conversation?.first_name ?? ""} ${conversation?.last_name ?? ""}`.trim() ||
        conversation?.customer_phone ||
        "Customer";

      const msgText =
        message.message_type === "image" ? "📷 ຮູບພາບ" : (message.message_text ?? "");

      const timeStr = new Date(message.created_at ?? Date.now()).toLocaleTimeString("lo-LA", {
        hour: "2-digit",
        minute: "2-digit",
      });

      setNotifications((prev) => {
        const id = String(message.id ?? crypto.randomUUID());
        if (prev.some((n) => n.id === id)) return prev;

        return [
          {
            id,
            title: `ຂໍ້ຄວາມຈາກ ${name}`,
            message: msgText.length > 120 ? msgText.slice(0, 120) + "…" : msgText,
            time: timeStr,
            unread: true,
            conversation_id: convoId,
          },
          ...prev,
        ].slice(0, 50);
      });
    });

    socket.on("connect_error", (e) => console.error("admin socket error:", e));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // ✅ click notification -> go to chat page
  const openNotification = (n: NotificationItem) => {
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));

    if (n.conversation_id) {
      setShowNotifications(false);

      // ✅ change this path to your real chat route
      navigate(`/AdminChat?conversation_id=${n.conversation_id}`);

    }
  };

  return (
    <nav className={`bg-gradient-to-r from-[#140F36] via-[#1a1447] to-[#140F36] border-b border-[#454350]/30 sticky top-0 z-40 shadow-lg ${className}`}>
      <div className="px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            <p className="text-gray-300 flex items-center gap-2">
              <Calendar size={18} />
              {currentTime.toLocaleDateString("lo-LA", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications((s) => !s)}
                className="bg-white/10 hover:bg-white/20 p-3 rounded-xl relative"
              >
                <Bell size={20} className="text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#EF3328] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-[360px] bg-white rounded-xl shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-[#EF3328] to-[#d62a20] p-4 flex justify-between">
                    <h3 className="text-white font-bold">ການແຈ້ງເຕືອນ</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-white text-xs underline">
                        ອ່ານທັງໝົດ
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">ບໍ່ມີການແຈ້ງເຕືອນ</div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => openNotification(n)}
                          className={`w-full text-left p-4 border-b hover:bg-gray-50 ${n.unread ? "bg-red-50" : ""}`}
                        >
                          <p className="font-semibold">{n.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {showClock && (
              <div className="bg-gradient-to-r from-[#EF3328] to-[#d62a20] px-6 py-3 rounded-xl flex items-center gap-3 text-white">
                <Clock size={20} />
                <span className="text-lg font-semibold">{currentTime.toLocaleTimeString("lo-LA")}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
