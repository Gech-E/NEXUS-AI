"use client";

import { useEffect, useState, useRef } from "react";
import { Send, User, Paperclip, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/Input/Input";

interface Message {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string; role: string; image: string | null };
  receiverId: string;
  receiver: { id: string; name: string; role: string; image: string | null };
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch all recent messages to build contacts list
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data: Message[]) => {
        if (!Array.isArray(data)) return;
        const uniqueContacts = new Map();
        data.forEach((m) => {
          const contact = m.senderId === session?.user?.id ? m.receiver : m.sender;
          // Note: receiver might not be populated in the generalized GET route if not handled, 
          // but we'll assume the updated GET route includes it or we infer from another endpoint.
          // Let's use a mock contact list if it fails, or populate properly.
          if (contact && !uniqueContacts.has(contact.id)) {
            uniqueContacts.set(contact.id, { ...contact, lastMessage: m.content, time: m.createdAt, unread: !m.isRead && m.senderId !== session?.user?.id });
          }
        });
        setContacts(Array.from(uniqueContacts.values()));
        if (uniqueContacts.size > 0 && !activeContactId) {
          setActiveContactId(Array.from(uniqueContacts.keys())[0]);
        }
      });
  }, [session]);

  useEffect(() => {
    if (!activeContactId) return;
    fetch(`/api/messages?contactId=${activeContactId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
      });
  }, [activeContactId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeContactId) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: activeContactId, content: newMessage }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setNewMessage("");
      } else {
        toast.error("Failed to send message");
      }
    } catch {
      toast.error("Error sending message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl overflow-hidden animate-fade-in">
      {/* Contacts Sidebar */}
      <div className="w-1/3 border-r border-[var(--border-primary)] flex flex-col">
        <div className="p-4 border-b border-[var(--border-primary)]">
          <h2 className="font-semibold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="p-4 text-center text-sm text-[var(--text-muted)]">No conversations yet</div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setActiveContactId(contact.id)}
                className={`p-4 border-b border-[var(--border-secondary)] cursor-pointer transition-colors ${
                  activeContactId === contact.id ? "bg-[var(--bg-secondary)]" : "hover:bg-[var(--bg-tertiary)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                    {contact.image ? <img src={contact.image} alt="" className="w-full h-full rounded-full" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium text-sm truncate">{contact.name}</h3>
                      <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                        {new Date(contact.time).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {contact.lastMessage}
                    </p>
                  </div>
                  {contact.unread && <div className="w-2.5 h-2.5 bg-[var(--color-brand-500)] rounded-full flex-shrink-0" />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[var(--bg-primary)]">
        {activeContactId ? (
          <>
            <div className="p-4 border-b border-[var(--border-primary)] bg-[var(--bg-card)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">{contacts.find((c) => c.id === activeContactId)?.name || "User"}</h3>
                <p className="text-xs text-[var(--text-secondary)]">{contacts.find((c) => c.id === activeContactId)?.role}</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === session?.user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl p-3 ${
                        isMe
                          ? "bg-[var(--color-brand-600)] text-white rounded-br-none"
                          : "bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <div className={`text-[10px] mt-1 flex items-center gap-1 ${isMe ? "text-white/70" : "text-[var(--text-muted)]"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {isMe && msg.isRead && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-card)]">
              <div className="flex items-center gap-2">
                <button className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-[var(--bg-primary)] border-transparent"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="w-10 h-10 rounded-full bg-[var(--color-brand-600)] text-white flex items-center justify-center hover:bg-[var(--color-brand-500)] disabled:opacity-50 transition-colors"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] flex-col gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
              <Send className="w-8 h-8 opacity-50" />
            </div>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
