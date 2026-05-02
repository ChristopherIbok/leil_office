"use client";

import { useEffect, useState, useRef } from "react";
import { Send, Video, Paperclip, X, Download } from "lucide-react";
import { useAuthStore } from "../store/auth-store";
import { apiFetch } from "../lib/api";
import { VideoCall, useVideoCall } from "./video-call";

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender?: { name: string };
  createdAt: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

interface Channel {
  id: string;
  name: string;
}

interface ChatPanelProps {
  projectId: string;
  channels: Channel[];
}

export function ChatPanel({ projectId, channels }: ChatPanelProps) {
  const session = useAuthStore((state) => state.session);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(channels[0] || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<globalThis.File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { isActive: isVideoCallActive, startCall: startVideoCall, endCall: endVideoCall } = useVideoCall();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedChannel || !session) return;

    setLoading(true);
    apiFetch(`/channels/${selectedChannel.id}/messages`, {}, session.accessToken)
      .then((data) => setMessages(data as Message[]))
      .catch((err) => console.error("Failed to load messages:", err))
      .finally(() => setLoading(false));
  }, [selectedChannel, session]);

  useEffect(() => {
    if (!selectedChannel || !session) return;

    const ws = new WebSocket("ws://localhost:4000/chat");

    ws.onopen = () => {
      ws.send(JSON.stringify({ event: "join-channel", data: selectedChannel.id }));
    };

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.event === "message-created") {
        setMessages((prev) => [...prev, payload.data]);
      }
    };

    return () => {
      ws.close();
    };
  }, [selectedChannel, session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!newMessage.trim() && !attachedFile) return;
    if (!selectedChannel || !session) return;

    setUploading(true);
    try {
      let attachmentUrl: string | undefined;
      let attachmentName: string | undefined;

      if (attachedFile) {
        const { uploadUrl, fileUrl } = await apiFetch<{ uploadUrl: string; key: string; fileUrl: string }>("/files/presign", {
          method: "POST",
          body: JSON.stringify({ name: attachedFile.name, mimeType: attachedFile.type })
        }, session.accessToken);

        await fetch(uploadUrl, {
          method: "PUT",
          body: attachedFile,
          headers: { "Content-Type": attachedFile.type }
        });

        attachmentUrl = fileUrl;
        attachmentName = attachedFile.name;
      }

      const message = await apiFetch("/messages", {
        method: "POST",
        body: JSON.stringify({
          content: newMessage || " ",
          channelId: selectedChannel.id,
          ...(attachmentUrl ? { attachmentUrl, attachmentName } : {})
        })
      }, session.accessToken);

      setMessages((prev) => [...prev, message as Message]);
      setNewMessage("");
      setAttachedFile(null);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setUploading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[16rem_1fr]">
      <aside className="rounded-md border border-line bg-white p-4">
        <h3 className="font-semibold">Channels</h3>
        <div className="mt-3 space-y-2">
          {channels.length === 0 ? (
            <p className="text-sm text-muted">No channels yet.</p>
          ) : (
            channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
                  selectedChannel?.id === channel.id
                    ? "bg-brand text-white"
                    : "text-muted hover:bg-surface"
                }`}
              >
                # {channel.name}
              </button>
            ))
          )}
        </div>
      </aside>

      <div className="flex flex-col rounded-md border border-line bg-white">
        {selectedChannel ? (
          <>
            <div className="flex items-center justify-between border-b border-line px-4 py-2">
              <span className="font-semibold">#{selectedChannel.name}</span>
              <button
                onClick={startVideoCall}
                className="flex items-center gap-2 rounded-md bg-brand px-3 py-1 text-sm text-white"
              >
                <Video className="h-4 w-4" />
                Start Call
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <p className="text-sm text-muted">Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-sm text-muted">No messages yet. Start the conversation!</p>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="rounded-md bg-surface p-3">
                      <p className="text-xs font-semibold text-brand">{msg.sender?.name ?? "User"}</p>
                      {msg.content.trim() && <p className="mt-1 text-sm">{msg.content}</p>}
                      {msg.attachmentUrl && (
                        <a
                          href={msg.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm hover:bg-surface"
                        >
                          <Download className="h-4 w-4 text-muted" />
                          <span className="truncate">{msg.attachmentName ?? "Attachment"}</span>
                        </a>
                      )}
                      <p className="mt-2 text-xs text-muted">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            {attachedFile && (
              <div className="flex items-center gap-2 border-t border-line px-3 py-2 text-sm">
                <Paperclip className="h-4 w-4 text-muted" />
                <span className="flex-1 truncate text-muted">{attachedFile.name}</span>
                <button onClick={() => setAttachedFile(null)} className="text-muted hover:text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="flex gap-2 border-t border-line p-3">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                id="chat-attachment"
                onChange={handleFileSelect}
              />
              <label
                htmlFor="chat-attachment"
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-md border border-line text-muted hover:bg-surface"
                title="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </label>
              <input
                className="h-10 flex-1 rounded-md border border-line px-3"
                placeholder={`Message #${selectedChannel.name}`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={sendMessage}
                disabled={uploading}
                aria-label="Send message"
                className="grid h-10 w-10 place-items-center rounded-md bg-brand text-white disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex h-64 items-center justify-center text-muted">
            Select a channel to start chatting
          </div>
        )}
      </div>
      {isVideoCallActive && <VideoCall onClose={endVideoCall} />}
    </section>
  );
}
