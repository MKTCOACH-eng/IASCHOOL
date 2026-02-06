'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bot,
  Send,
  Loader2,
  User,
  ThumbsUp,
  ThumbsDown,
  Star,
  MessageSquare,
  Sparkles,
  X,
  History,
  Plus
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  messageCount: number;
  resolved: boolean;
  rating: number | null;
  createdAt: string;
  messages: Message[];
}

const QUICK_QUESTIONS = [
  '¿Cuándo vence el pago de colegiatura?',
  '¿Cuál es el horario de clases?',
  '¿Cómo puedo justificar una falta?',
  '¿Cuándo son las próximas vacaciones?',
];

export default function ChatbotPage() {
  const { data: session } = useSession() || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userName = session?.user?.name?.split(' ')[0] || 'Usuario';

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chatbot');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/chatbot?conversationId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setConversationId(id);
        setShowHistory(false);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setShowRating(false);
    setRating(0);
    inputRef.current?.focus();
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: content.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Error al enviar mensaje');
      }

      // Obtener el ID de conversación si es nueva
      const newConvId = response.headers.get('X-Conversation-Id');
      if (newConvId && !conversationId) {
        setConversationId(newConvId);
      }

      // Crear mensaje del asistente
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Procesar stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let partialRead = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          partialRead += decoder.decode(value, { stream: true });
          const lines = partialRead.split('\n');
          partialRead = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                // Mostrar opción de calificar después de 3 mensajes
                if (messages.length >= 4) {
                  setShowRating(true);
                }
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  setMessages(prev => {
                    const updated = [...prev];
                    const lastMsg = updated[updated.length - 1];
                    if (lastMsg.role === 'assistant') {
                      lastMsg.content += parsed.content;
                    }
                    return updated;
                  });
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar mensaje. Intenta de nuevo.');
      // Remover mensaje del usuario si falla
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = async (stars: number) => {
    setRating(stars);
    if (!conversationId) return;

    try {
      await fetch('/api/chatbot', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          rating: stars,
          resolved: true
        })
      });
      toast.success('¡Gracias por tu calificación!');
      setShowRating(false);
    } catch (error) {
      console.error('Error rating:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl h-[calc(100vh-180px)]">
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1B4079] to-[#2d5a9e] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Asistente IA School</h1>
                <p className="text-white/80 text-sm">Tu ayudante virtual 24/7</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowHistory(!showHistory);
                  if (!showHistory) fetchConversations();
                }}
                className="text-white hover:bg-white/20"
              >
                <History className="h-4 w-4 mr-1" />
                Historial
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={startNewConversation}
                className="text-white hover:bg-white/20"
              >
                <Plus className="h-4 w-4 mr-1" />
                Nueva
              </Button>
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="absolute right-4 top-48 w-80 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
            <div className="p-3 border-b flex justify-between items-center">
              <h3 className="font-semibold">Conversaciones anteriores</h3>
              <button onClick={() => setShowHistory(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            {conversations.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm">No hay conversaciones aún</p>
            ) : (
              <div className="divide-y">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate flex-1">
                        {conv.messages?.[0]?.content?.slice(0, 40) || 'Conversación'}
                        {(conv.messages?.[0]?.content?.length || 0) > 40 ? '...' : ''}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(conv.createdAt).toLocaleDateString('es-MX')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-[#1B4079]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-10 w-10 text-[#1B4079]" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                ¡Hola {userName}! 👋
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Soy tu asistente virtual. Puedo ayudarte con consultas sobre pagos, tareas, horarios y más.
              </p>
              
              <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
                {QUICK_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(question)}
                    className="text-left p-3 bg-white rounded-lg border hover:border-[#1B4079] hover:shadow-sm transition-all text-sm text-gray-700"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`p-2 rounded-full ${
                    message.role === 'user' 
                      ? 'bg-[#1B4079] text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div className={`max-w-[75%] ${
                    message.role === 'user'
                      ? 'bg-[#1B4079] text-white rounded-2xl rounded-tr-sm'
                      : 'bg-white border rounded-2xl rounded-tl-sm shadow-sm'
                  } px-4 py-3`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'assistant' && message.content && !isLoading && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                        <button className="text-gray-400 hover:text-green-500 transition-colors">
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Escribiendo...</span>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Rating Section */}
        {showRating && (
          <div className="bg-blue-50 border-t border-blue-100 p-3">
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-blue-700">¿Te fue útil esta conversación?</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className={`p-1 ${rating >= star ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500 transition-colors`}
                  >
                    <Star className="h-5 w-5" fill={rating >= star ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowRating(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu pregunta..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="bg-[#1B4079] hover:bg-[#143156]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            El asistente puede cometer errores. Verifica la información importante.
          </p>
        </div>
      </div>
    </div>
  );
}
