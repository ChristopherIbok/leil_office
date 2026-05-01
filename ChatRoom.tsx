'use client';
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/useAuthStore';
import { Send } from 'lucide-react';

export default function ChatRoom({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const { user, token } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = io('http://localhost:4000/tasks', { auth: { token } });
    socketRef.current = socket;

    socket.emit('joinProject', projectId);
    
    // Example listener for system updates; real chat messages would use a 'message' event
    socket.on('taskUpdated', (data) => {
       console.log('Update received:', data);
    });

    return () => {
      socket.emit('leaveProject', projectId);
      socket.disconnect();
    };
  }, [projectId, token]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const fakeMsg = { id: Date.now(), sender: user?.name, content: input, me: true };
    setMessages(prev => [...prev, fakeMsg]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white shadow-xl">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="text-center py-10">
           <p className="text-sm text-gray-400 bg-gray-50 inline-block px-4 py-1 rounded-full border">End-to-end encrypted project discussion</p>
        </div>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.me ? 'items-end' : 'items-start'}`}>
            {!msg.me && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-2 mb-1">{msg.sender}</span>}
            <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-md ${
              msg.me ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Message Input */}
      <div className="p-6 border-t bg-gray-50/50">
        <form onSubmit={handleSend} className="flex gap-3 items-center bg-white p-1 rounded-2xl border shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share an update or ask a question..."
            className="flex-1 bg-transparent px-4 py-2 text-sm outline-none"
          />
          <button type="submit" className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}