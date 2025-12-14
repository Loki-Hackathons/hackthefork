'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ArrowLeft, User } from 'lucide-react';
import { getUserName, getUserId } from '@/lib/cookies';
import type { Screen } from './MainApp';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isOwn: boolean;
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

interface MessagesScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function MessagesScreen({ onNavigate }: MessagesScreenProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = getUserId();
  const currentUserName = getUserName() || 'You';

  // Mock conversations (in real app, fetch from API)
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        userId: 'user-1',
        userName: 'Sophie',
        lastMessage: 'Super plat ! 👏',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
        unreadCount: 2
      },
      {
        id: '2',
        userId: 'user-2',
        userName: 'Marc',
        lastMessage: 'Merci pour la recette !',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
        unreadCount: 0
      },
      {
        id: '3',
        userId: 'user-3',
        userName: 'Emma',
        lastMessage: 'J\'adore ton style de cuisine 🌱',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
        unreadCount: 1
      }
    ];
    setConversations(mockConversations);
  }, []);

  // Mock messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (conversation) {
        const mockMessages: Message[] = [
          {
            id: '1',
            text: 'Salut ! J\'ai vu ton dernier post, il est génial !',
            senderId: conversation.userId,
            senderName: conversation.userName,
            timestamp: new Date(Date.now() - 1000 * 60 * 60),
            isOwn: false
          },
          {
            id: '2',
            text: 'Merci beaucoup ! 😊',
            senderId: currentUserId,
            senderName: currentUserName,
            timestamp: new Date(Date.now() - 1000 * 60 * 55),
            isOwn: true
          },
          {
            id: '3',
            text: conversation.lastMessage,
            senderId: conversation.userId,
            senderName: conversation.userName,
            timestamp: conversation.lastMessageTime,
            isOwn: false
          }
        ];
        setMessages(mockMessages);
      }
    }
  }, [selectedConversation, conversations, currentUserId, currentUserName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      senderId: currentUserId,
      senderName: currentUserName,
      timestamp: new Date(),
      isOwn: true
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Update conversation last message
    setConversations(conversations.map(c => 
      c.id === selectedConversation 
        ? { ...c, lastMessage: message.text, lastMessageTime: message.timestamp, unreadCount: 0 }
        : c
    ));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'maintenant';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  if (selectedConversation) {
    const conversation = conversations.find(c => c.id === selectedConversation);
    
    return (
      <div className="h-full bg-black flex flex-col">
        {/* Header */}
        <div className="pt-12 pb-4 px-6 flex items-center gap-4 bg-black/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
          <button
            onClick={() => setSelectedConversation(null)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-xl">
            {conversation?.userName[0] || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-white text-lg font-semibold">{conversation?.userName}</h2>
            <p className="text-white/50 text-xs">En ligne</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={`max-w-[75%] ${message.isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                {!message.isOwn && (
                  <span className="text-white/50 text-xs mb-1">{message.senderName}</span>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    message.isOwn
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-white backdrop-blur-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
                <span className="text-white/40 text-xs mt-1">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-black/95 backdrop-blur-md border-t border-white/10">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newMessage.trim()) {
                  handleSendMessage();
                }
              }}
              placeholder="Écrire un message..."
              className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <motion.button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.9 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-4 px-6 bg-black/95 backdrop-blur-md border-b border-white/10">
        <h1 className="text-white text-2xl font-bold">Messages</h1>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-white/60 text-lg mb-2">Aucun message</p>
              <p className="text-white/40 text-sm">Tes conversations apparaîtront ici</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {conversations.map((conversation) => (
              <motion.button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-xl flex-shrink-0">
                  {conversation.userName[0]}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-semibold truncate">{conversation.userName}</h3>
                    <span className="text-white/40 text-xs flex-shrink-0 ml-2">
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-white/60 text-sm truncate">{conversation.lastMessage}</p>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
