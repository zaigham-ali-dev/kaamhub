"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import {
  MessageSquare,
  Send,
  Loader2,
  CheckCheck,
  User,
  ShieldCheck,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { ConversationData, MessageData } from "@/lib/types";

function ProviderMessagesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const targetConvId = searchParams.get("conv") || searchParams.get("id");

  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Edit & Delete state
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      const json = await res.json();
      if (json.success && json.data) {
        setConversations(json.data);
        if (targetConvId && json.data.some((c: ConversationData) => c.id === targetConvId)) {
          setActiveConvId(targetConvId);
        } else if (!activeConvId && json.data.length > 0) {
          setActiveConvId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string, showLoading = false) => {
    if (showLoading) setMessagesLoading(true);
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      const json = await res.json();
      if (json.success) {
        setMessages(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setMessagesLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [targetConvId]);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId, true);
      const interval = setInterval(() => fetchMessages(activeConvId, false), 3000);
      return () => clearInterval(interval);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !activeConvId || sending) return;

    setSending(true);
    setInputText("");

    const optimisticMsg: MessageData = {
      id: `temp_${Date.now()}`,
      conversationId: activeConvId,
      senderId: user?.id || "usr_prov_1",
      content: text,
      read: true,
      createdAt: new Date().toISOString(),
      sender: user || {
        id: "usr_prov_1",
        name: "Provider",
        email: "provider@kaamhub.com",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
        role: "PROVIDER",
        createdAt: new Date().toISOString(),
      },
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch(`/api/conversations/${activeConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? json.data : m))
        );
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  // ── Edit Message ──
  const handleStartEdit = (msg: MessageData) => {
    setEditingId(msg.id);
    setEditText(msg.content);
    setMenuOpenId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleSaveEdit = async (msgId: string) => {
    const trimmed = editText.trim();
    if (!trimmed || !activeConvId) return;

    // Optimistic update
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, content: trimmed } : m))
    );
    setEditingId(null);
    setEditText("");

    try {
      await fetch(`/api/conversations/${activeConvId}/messages/${msgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      fetchConversations();
    } catch (err) {
      console.error(err);
      if (activeConvId) fetchMessages(activeConvId, false);
    }
  };

  // ── Delete Message ──
  const handleDeleteMessage = async (msgId: string) => {
    if (!activeConvId) return;
    setDeletingId(msgId);
    setMenuOpenId(null);

    // Optimistic remove
    setMessages((prev) => prev.filter((m) => m.id !== msgId));

    try {
      await fetch(`/api/conversations/${activeConvId}/messages/${msgId}`, {
        method: "DELETE",
      });
      fetchConversations();
    } catch (err) {
      console.error(err);
      if (activeConvId) fetchMessages(activeConvId, false);
    } finally {
      setDeletingId(null);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const client = activeConv?.customer;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <DashboardSidebar role="PROVIDER" />

      <main className="flex-1 p-3 sm:p-6 lg:p-8 flex flex-col max-w-6xl">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Client Inquiries & Chat</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Direct Leads
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate job arrival time, material requirements, and client questions directly with customers.
          </p>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
            Loading client chats...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No client messages yet</h3>
            <p className="text-xs text-slate-500">
              When clients message or book your services, direct chats will show up here.
            </p>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden min-h-[550px]">
            {/* Conversations list */}
            <div className="border-r border-slate-100 overflow-y-auto max-h-[640px] divide-y divide-slate-50">
              <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span>Client Chats ({conversations.length})</span>
                <span className="text-[10px] text-emerald-600 font-semibold normal-case">Direct Leads</span>
              </div>
              {conversations.map((c) => {
                const isSelected = c.id === activeConvId;
                const cust = c.customer;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveConvId(c.id);
                      setMessages([]);
                      setEditingId(null);
                      setMenuOpenId(null);
                    }}
                    className={`w-full p-3.5 sm:p-4 flex items-center gap-3 text-left transition-all ${
                      isSelected ? "bg-emerald-50/80 border-r-4 border-emerald-600 shadow-xs" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={
                          cust?.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            cust?.name || "Client"
                          )}&background=059669&color=fff`
                        }
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {cust?.name || "Customer"}
                        </p>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-medium truncate mt-0.5">
                        {c.service?.title || "Direct Inquiry"}
                      </p>
                      {c.lastMessage && (
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {c.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Chat Thread */}
            <div className="md:col-span-2 flex flex-col justify-between h-[640px]">
              {/* Header */}
              <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={
                        client?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          client?.name || "Client"
                        )}&background=059669&color=fff`
                      }
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {client?.name || "Client"}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-emerald-700 font-medium">
                      {activeConv?.service?.title || "Service Inquiry"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/60 hidden sm:inline-block">
                    Customer Inquiry
                  </span>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
                {messagesLoading ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600 mr-2" />
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">No messages in this chat yet</p>
                    <p className="text-[11px] text-slate-400">
                      Send a response to greet the customer and confirm your arrival schedule.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    // Check if message is from the provider (Me)
                    const isMe =
                      m.senderId === user?.id ||
                      m.sender?.role === "PROVIDER" ||
                      m.senderId.startsWith("usr_prov");

                    const isEditing = editingId === m.id;

                    return (
                      <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
                        <div className="relative max-w-[85%] sm:max-w-md">
                          {/* Context menu button — only for own messages */}
                          {isMe && !isEditing && (
                            <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10" ref={menuOpenId === m.id ? menuRef : undefined}>
                              <button
                                onClick={() => setMenuOpenId(menuOpenId === m.id ? null : m.id)}
                                className="w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-100 transition-colors"
                              >
                                <MoreVertical className="w-3 h-3 text-slate-500" />
                              </button>

                              {/* Dropdown menu */}
                              {menuOpenId === m.id && (
                                <div className="absolute right-full mr-1 top-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[120px] z-20 animate-in fade-in slide-in-from-right-1 duration-150">
                                  <button
                                    onClick={() => handleStartEdit(m)}
                                    className="w-full px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 transition-colors"
                                  >
                                    <Pencil className="w-3 h-3" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMessage(m.id)}
                                    className="w-full px-3 py-2 text-[11px] font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          <div
                            className={`p-3 sm:p-3.5 rounded-2xl text-xs space-y-1 shadow-xs ${
                              isMe
                                ? "bg-emerald-600 text-white rounded-br-xs"
                                : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs"
                            }`}
                          >
                            {isEditing ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white/20 border border-white/30 rounded-lg text-xs text-white placeholder-emerald-200 focus:outline-none focus:ring-1 focus:ring-white/50 resize-none min-h-[40px]"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSaveEdit(m.id);
                                    }
                                    if (e.key === "Escape") handleCancelEdit();
                                  }}
                                />
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-1 rounded-md hover:bg-white/20 transition-colors"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5 text-emerald-100" />
                                  </button>
                                  <button
                                    onClick={() => handleSaveEdit(m.id)}
                                    disabled={!editText.trim()}
                                    className="p-1 rounded-md hover:bg-white/20 transition-colors disabled:opacity-40"
                                    title="Save (Enter)"
                                  >
                                    <Check className="w-3.5 h-3.5 text-white" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                            )}
                            <div
                              className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${
                                isMe ? "text-emerald-100" : "text-slate-400"
                              }`}
                            >
                              <span>
                                {new Date(m.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isMe && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-100 bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your response to the customer..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProviderMessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading messages...</div>}>
      <ProviderMessagesContent />
    </Suspense>
  );
}
