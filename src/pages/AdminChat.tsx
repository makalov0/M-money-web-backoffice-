import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/navbar";
import { Search, Send, User, CheckCheck, Paperclip, Trash2, Edit } from "lucide-react";
import axios from "axios";
import { createAdminSocket } from "../utils/socket";
import ImagePreviewModal from "../components/chat/ImagePreviewModal";

type Room = {
  conversation_id: number;
  customer_phone: string | null;
  first_name: string | null;
  last_name: string | null;
  employee_id: number;
  last_message: string | null;
  last_message_at: string | null;
};

type ServerMessage = {
  id: number;
  sender_role: "CUSTOMER" | "EMPLOYEE" | "ADMIN";
  sender_id?: number | null;
  message_type: "text" | "image";
  message_text: string;
  created_at: string;
  isOptimistic?: boolean;
  client_id?: string; // optimistic matching
};

type SocketConversation = {
  id: number;
  customer_phone?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  employee_id: number;
  last_message?: string | null;
  last_message_at?: string | null;
};

type NewMessagePayload = {
  conversation: SocketConversation;
  message: ServerMessage;
};

type EditedMessagePayload = {
  conversation: SocketConversation;
  message: ServerMessage;
};

// ===== helpers =====
const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

function safeTime(ts?: string | null) {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("lo-LA", { hour: "2-digit", minute: "2-digit" });
}

function normalizeName(first?: string | null, last?: string | null) {
  return `${first || ""} ${last || ""}`.trim();
}

function isGuestName(rawName: string) {
  const normalized = rawName.replace(/\s+/g, "").toLowerCase();
  return !rawName || normalized === "guest" || normalized === "guset";
}

function uuid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isNewMessagePayload(v: unknown): v is NewMessagePayload {
  if (!isObject(v)) return false;
  const conv = v.conversation;
  const msg = v.message;
  if (!isObject(conv) || !isObject(msg)) return false;

  // conversation.id must exist
  if (typeof conv.id !== "number") return false;

  // message minimal fields
  if (typeof msg.id !== "number") return false;
  if (typeof msg.sender_role !== "string") return false;
  if (typeof msg.message_type !== "string") return false;
  if (typeof msg.message_text !== "string") return false;
  if (typeof msg.created_at !== "string") return false;

  return true;
}

function isEditedMessagePayload(v: unknown): v is EditedMessagePayload {
  // same shape in your app
  return isNewMessagePayload(v);
}

export default function AdminChat() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
  const BASE = API.replace("/api", "");
  const token = localStorage.getItem("token") || "";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);

  const [messages, setMessages] = useState<ServerMessage[]>([]);
  const [messageText, setMessageText] = useState("");

  const messagesBoxRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editingInputRef = useRef<HTMLTextAreaElement | null>(null);
  const socketRef = useRef<ReturnType<typeof createAdminSocket> | null>(null);

  // preview modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");

  const [searchKey, setSearchKey] = useState("");

  // editing message
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // stable guest numbering stored in localStorage
  const [guestMap, setGuestMap] = useState<Record<number, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem("guestMap") || "{}");
    } catch {
      return {};
    }
  });

  // auto-scroll only if user is near bottom
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const persistGuestMap = (next: Record<number, number>) => {
    setGuestMap(next);
    localStorage.setItem("guestMap", JSON.stringify(next));
  };

  const isGuestRoom = useCallback((r: Room) => {
    const raw = normalizeName(r.first_name, r.last_name);
    return isGuestName(raw);
  }, []);

  const getDisplayName = useCallback(
    (r: Room) => {
      const raw = normalizeName(r.first_name, r.last_name);
      if (!isGuestName(raw)) return raw;

      const n = guestMap[r.conversation_id] ?? r.conversation_id;
      return `Customer ${n}`;
    },
    [guestMap]
  );

  // assign stable guest ids for new guest rooms
  useEffect(() => {
    const next = { ...guestMap };
    let max = Object.values(next).reduce((a, b) => Math.max(a, b), 0);

    let changed = false;
    rooms.forEach((r) => {
      if (isGuestRoom(r) && next[r.conversation_id] == null) {
        max += 1;
        next[r.conversation_id] = max;
        changed = true;
      }
    });

    if (changed) persistGuestMap(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, isGuestRoom]);

  // sort rooms by last_message_at DESC
  const sortedRooms = useMemo(() => {
    const copy = [...rooms];
    copy.sort((a, b) => {
      const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return tb - ta;
    });
    return copy;
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    const key = searchKey.trim().toLowerCase();
    if (!key) return sortedRooms;

    return sortedRooms.filter((r) => {
      const name = normalizeName(r.first_name, r.last_name).toLowerCase();
      const phone = (r.customer_phone || "").toLowerCase();
      return (
        name.includes(key) ||
        phone.includes(key) ||
        String(r.conversation_id).includes(key) ||
        getDisplayName(r).toLowerCase().includes(key)
      );
    });
  }, [sortedRooms, searchKey, getDisplayName]);

  const selectedRoomInfo = useMemo(
    () => rooms.find((r) => r.conversation_id === selectedRoom) || null,
    [rooms, selectedRoom]
  );

  const selectedName = selectedRoomInfo ? getDisplayName(selectedRoomInfo) : "No conversation";

  // ===== API =====
  const fetchRooms = useCallback(async () => {
    if (!token) return;
    const res = await axios.get(`${API}/chat/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data: Room[] = res.data?.data || [];
    setRooms(data);

    if (data.length > 0) {
      setSelectedRoom((prev) => {
        if (prev && data.some((r) => r.conversation_id === prev)) return prev;
        return data[0].conversation_id;
      });
    } else {
      setSelectedRoom(null);
      setMessages([]);
    }
  }, [API, token]);

  const fetchMessages = useCallback(
    async (conversationId: number) => {
      if (!token || !conversationId) return;
      const res = await axios.get(`${API}/chat/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data?.data || []);
    },
    [API, token]
  );

  useEffect(() => {
    if (!token) return;
    fetchRooms().catch((e) => console.error("load conversations error:", e));
  }, [fetchRooms, token]);

  useEffect(() => {
    if (!token || !selectedRoom) return;
    fetchMessages(selectedRoom).catch((e) => console.error("load messages error:", e));
  }, [fetchMessages, token, selectedRoom]);

  // track scroll position
  useEffect(() => {
    const el = messagesBoxRef.current;
    if (!el) return;

    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      setShouldAutoScroll(nearBottom);
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (shouldAutoScroll) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, shouldAutoScroll]);

  // connect socket once
  useEffect(() => {
    if (!token) return;

    const socket = createAdminSocket(token);
    socketRef.current = socket;

    const onNewMessage = (payload: unknown) => {
      if (!isNewMessagePayload(payload)) return;
      const { conversation, message } = payload;

      setRooms((prev) => {
        const updated: Room = {
          conversation_id: conversation.id,
          customer_phone: conversation.customer_phone ?? null,
          first_name: conversation.first_name ?? null,
          last_name: conversation.last_name ?? null,
          employee_id: conversation.employee_id,
          last_message: conversation.last_message ?? null,
          last_message_at: conversation.last_message_at ?? null,
        };

        const others = prev.filter((r) => r.conversation_id !== conversation.id);
        return [updated, ...others];
      });

      if (selectedRoom === conversation.id) {
        setMessages((prev) => {
          if (message.client_id) {
            const replaced = prev.map((m) =>
              m.isOptimistic && m.client_id === message.client_id ? { ...message, isOptimistic: false } : m
            );
            const exists = replaced.some((m) => m.id === message.id);
            return exists ? replaced : [...replaced, message];
          }

          const exists = prev.some((m) => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    };

    const onEditedMessage = (payload: unknown) => {
      if (!isEditedMessagePayload(payload)) return;
      const { conversation, message } = payload;

      setRooms((prev) => {
        const updated: Room = {
          conversation_id: conversation.id,
          customer_phone: conversation.customer_phone ?? null,
          first_name: conversation.first_name ?? null,
          last_name: conversation.last_name ?? null,
          employee_id: conversation.employee_id,
          last_message: conversation.last_message ?? null,
          last_message_at: conversation.last_message_at ?? null,
        };

        const others = prev.filter((r) => r.conversation_id !== conversation.id);
        return [updated, ...others];
      });

      if (selectedRoom === conversation.id) {
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...message, isOptimistic: false } : m))
        );
      }
    };

    socket.on("new_message", onNewMessage);
    socket.on("edited_message", onEditedMessage);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("edited_message", onEditedMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, selectedRoom]);

  useEffect(() => {
    if (editingMessageId !== null) {
      setTimeout(() => editingInputRef.current?.focus(), 50);
    }
  }, [editingMessageId]);

  // ===== actions =====
  const handleSend = () => {
    if (!messageText.trim() || !selectedRoom) return;

    const text = messageText.trim();
    const client_id = uuid();

    socketRef.current?.emit("admin_message", {
      conversation_id: selectedRoom,
      message_text: text,
      message_type: "text",
      client_id,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender_role: "ADMIN",
        message_type: "text",
        message_text: text,
        created_at: new Date().toISOString(),
        isOptimistic: true,
        client_id,
      },
    ]);

    setMessageText("");
  };

  const handlePickImage = () => fileInputRef.current?.click();

  const handleUploadImage = async (file: File) => {
    try {
      if (!selectedRoom) return;

      const form = new FormData();
      form.append("file", file);
      form.append("conversation_id", String(selectedRoom));

      const res = await axios.post(`${API}/chat/upload`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = res.data?.data?.image_url;
      if (!imageUrl) return;

      const client_id = uuid();

      socketRef.current?.emit("admin_message", {
        conversation_id: selectedRoom,
        message_text: imageUrl,
        message_type: "image",
        client_id,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender_role: "ADMIN",
          message_type: "image",
          message_text: imageUrl,
          created_at: new Date().toISOString(),
          isOptimistic: true,
          client_id,
        },
      ]);
    } catch (e) {
      console.error("upload image error:", e);
    }
  };

  const handleStartEdit = (m: ServerMessage) => {
    if (m.message_type !== "text") return;
    setEditingMessageId(m.id);
    setEditingText(m.message_text);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleSaveEdit = (messageId: number) => {
    if (!editingText.trim()) return;

    const text = editingText.trim();

    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, message_text: text, isOptimistic: true } : m))
    );

    setEditingMessageId(null);
    setEditingText("");

    socketRef.current?.emit("edit_message", {
      message_id: messageId,
      message_text: text,
    });
  };

  const handleDeleteConversation = async () => {
    if (!selectedRoom) return;

    const ok = window.confirm("Delete this whole conversation?");
    if (!ok) return;

    try {
      await axios.delete(`${API}/chat/conversations/${selectedRoom}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRooms((prev) => prev.filter((r) => r.conversation_id !== selectedRoom));
      setMessages([]);

      setSelectedRoom((prev) => {
        const remaining = rooms.filter((r) => r.conversation_id !== prev);
        return remaining[0]?.conversation_id ?? null;
      });

      await fetchRooms();
    } catch (e) {
      console.error("delete conversation error:", e);
      alert("Delete conversation failed");
    }
  };

  const onKeyDownSend = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar onToggle={setSidebarOpen} />

      <div className="flex-1 transition-all" style={{ marginLeft: sidebarOpen ? "256px" : "80px" }}>
        <Navbar title="Customer Support Chat" />

        <div className="p-6">
          <div className="bg-white rounded-xl shadow h-[calc(100vh-160px)] flex">
            {/* Left rooms */}
            <div className="w-80 border-r">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    placeholder="ຄົ້ນຫາ..."
                    className="w-full pl-10 pr-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="overflow-y-auto">
                {filteredRooms.map((r) => {
                  const time = safeTime(r.last_message_at);
                  const name = getDisplayName(r);

                  return (
                    <button
                      key={r.conversation_id}
                      onClick={() => setSelectedRoom(r.conversation_id)}
                      className={`w-full p-4 flex gap-3 border-b ${
                        selectedRoom === r.conversation_id ? "bg-red-50" : ""
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center">
                        <User size={18} />
                      </div>

                      <div className="flex-1 text-left">
                        <div className="flex justify-between">
                          <span className="font-semibold">{name}</span>
                          <span className="text-xs text-gray-400">{time}</span>
                        </div>

                        <p className="text-sm text-gray-500 truncate">{r.last_message || ""}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right messages */}
            <div className="flex-1 flex flex-col">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <div className="font-semibold">{selectedName}</div>
                </div>

                <button
                  onClick={handleDeleteConversation}
                  disabled={!selectedRoom}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 size={18} />
                  <span className="text-sm">Delete</span>
                </button>
              </div>

              <div ref={messagesBoxRef} className="flex-1 p-4 overflow-y-auto">
                {messages.map((m) => {
                  const isAdminSide = m.sender_role !== "CUSTOMER";
                  const time = safeTime(m.created_at);

                  return (
                    <div
                      key={`${m.id}-${m.client_id || ""}`}
                      className={`flex ${isAdminSide ? "justify-end" : "justify-start"} mb-3`}
                    >
                      <div
                        className={`group relative max-w-[70%] p-3 rounded-2xl ${
                          isAdminSide ? "bg-red-500 text-white" : "bg-gray-100 text-gray-800"
                        } ${m.isOptimistic ? "opacity-80" : ""}`}
                      >
                        {!m.isOptimistic && m.sender_role !== "CUSTOMER" && m.message_type === "text" && (
                          <div className={`absolute -top-2 ${isAdminSide ? "-left-2" : "-right-2"}`}>
                            <button
                              onClick={() => handleStartEdit(m)}
                              className="opacity-0 group-hover:opacity-100 transition bg-white border rounded-full p-1 shadow"
                              title="Edit message"
                            >
                              <Edit size={14} className="text-blue-600" />
                            </button>
                          </div>
                        )}

                        {m.message_type === "image" ? (
                          <img
                            src={`${BASE}${m.message_text}`}
                            className="rounded-xl max-h-64 cursor-pointer hover:opacity-90"
                            onClick={() => {
                              setPreviewSrc(`${BASE}${m.message_text}`);
                              setPreviewOpen(true);
                            }}
                            alt="chat-img"
                          />
                        ) : (
                          <p className="whitespace-pre-wrap break-words">{m.message_text}</p>
                        )}

                        <div className="text-xs mt-1 flex justify-end gap-1 opacity-80">
                          {time}
                          {isAdminSide && <CheckCheck size={14} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t flex gap-2 items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadImage(f);
                    e.currentTarget.value = "";
                  }}
                />

                <button onClick={handlePickImage} className="text-gray-500" title="Attach image">
                  <Paperclip size={20} />
                </button>

                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={onKeyDownSend}
                  placeholder="ພິມຂໍ້ຄວາມ..."
                  className="flex-1 px-4 py-2 border rounded-xl"
                />

                <button onClick={handleSend} className="px-4 bg-red-500 text-white rounded-xl" title="Send">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editingMessageId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-[min(600px,90%)]">
            <h3 className="font-semibold mb-2">Edit message</h3>
            <textarea
              ref={editingInputRef}
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="w-full h-28 border rounded p-2"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={handleCancelEdit} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button
                onClick={() => handleSaveEdit(editingMessageId!)}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <ImagePreviewModal open={previewOpen} src={previewSrc} onClose={() => setPreviewOpen(false)} />
    </div>
  );
}
