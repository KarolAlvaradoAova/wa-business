import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../context/AuthContext";
import type { Message } from "../types";

// Componente para una burbuja de mensaje individual
const MessageBubble: React.FC<{ 
  message: Message; 
  isOwn: boolean;
  getRelativeTime: (date: Date) => string;
}> = ({ message, isOwn, getRelativeTime }) => {
  const bubbleClass = isOwn 
    ? "self-end bg-embler-yellow text-embler-dark" 
    : message.isFromBot 
      ? "self-start bg-gray-600 text-white border border-gray-500"
      : "self-start bg-embler-accent text-white";

  const timeClass = isOwn 
    ? "text-embler-dark/60" 
    : "text-gray-400";

  return (
    <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm text-sm mb-3 transition-all duration-200 hover:shadow-md ${bubbleClass}`}>
      {/* Indicador de mensaje de bot */}
      {message.isFromBot && (
        <div className="flex items-center gap-1 mb-1 text-xs opacity-75">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
          <span>Asistente IA</span>
        </div>
      )}
      
      {/* Contenido del mensaje */}
      <div className="leading-relaxed">{message.content}</div>
      
      {/* Información del mensaje */}
      <div className={`text-xs mt-2 flex items-center justify-between ${timeClass}`}>
        <span>{getRelativeTime(message.timestamp)}</span>
        
        {/* Indicadores de estado (solo para mensajes propios) */}
        {isOwn && (
          <div className="flex items-center gap-1">
            {message.isDelivered && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {message.isRead && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente principal del panel de chat
const ChatPanel: React.FC = () => {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    currentChat, 
    currentMessages, 
    sendMessage, 
    getRelativeTime,
    isOwnMessage 
  } = useChat();
  
  const { state: authState, logout } = useAuth();

  // Auto-scroll al final cuando llegan nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  // Simular indicador de escritura
  useEffect(() => {
    if (newMessage.trim()) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [newMessage]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat) return;

    sendMessage(newMessage.trim());
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Si no hay chat seleccionado
  if (!currentChat) {
    return (
      <main className="flex-1 flex flex-col h-full bg-gradient-to-br from-embler-dark to-embler-accent relative">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400 max-w-md">
            <svg className="w-24 h-24 mx-auto mb-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">Bienvenido a Embler Chat</h3>
            <p className="text-gray-400">Selecciona una conversación para comenzar a chatear</p>
            {authState.user && (
              <p className="text-sm text-embler-yellow mt-4">
                Conectado como: {authState.user.name}
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Generar iniciales para el avatar del cliente
  const clientInitials = currentChat.clientName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarColor = currentChat.priority === 'high' 
    ? 'bg-red-500' 
    : currentChat.unreadCount > 0 
      ? 'bg-embler-yellow text-embler-dark' 
      : 'bg-gray-500';

  return (
    <main className="flex-1 flex flex-col h-full bg-gradient-to-br from-embler-dark to-embler-accent relative">
      {/* Header del chat */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-embler-accent sticky top-0 bg-embler-accent/90 backdrop-blur-sm z-10 shadow-sm">
        {/* Avatar del cliente */}
        <div className={`w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold ${avatarColor} transition-all hover:scale-105`}>
          {clientInitials}
        </div>
        
        {/* Información del cliente */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white text-lg">{currentChat.clientName}</span>
            
            {/* Indicadores de estado */}
            <div className="flex items-center gap-2">
              {currentChat.status === 'assigned' && (
                <span className="text-xs text-embler-yellow bg-embler-yellow/20 px-2 py-1 rounded-full flex items-center gap-1">
                  <div className="w-2 h-2 bg-embler-yellow rounded-full animate-pulse"></div>
                  Asignado
                </span>
              )}
              
              {currentChat.priority === 'high' && (
                <span className="text-xs text-red-400 bg-red-400/20 px-2 py-1 rounded-full">
                  Alta prioridad
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{currentChat.clientPhone}</span>
            <span>•</span>
            <span>{currentChat.tags.join(', ')}</span>
          </div>
        </div>

        {/* Acciones del header */}
        <div className="flex items-center gap-2">
          {/* Avatar del usuario */}
          {authState.user && (
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-embler-dark/20">
              <div className="w-6 h-6 bg-embler-yellow text-embler-dark rounded-full flex items-center justify-center text-xs font-bold">
                {authState.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <span className="text-white text-sm font-medium hidden sm:inline">
                {authState.user.name.split(' ')[0]}
              </span>
            </div>
          )}
          
          {/* Botón de información */}
          <button className="p-2 rounded-lg hover:bg-embler-dark/20 transition-colors text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          {/* Botón de logout */}
          <button 
            onClick={() => {
              if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                logout();
              }
            }}
            className="p-2 rounded-lg hover:bg-embler-dark/20 transition-colors text-gray-400 hover:text-white group"
            title="Cerrar sesión"
          >
            <svg className="w-5 h-5 group-hover:text-embler-yellow transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 px-6 py-4 flex flex-col gap-1 overflow-y-auto scrollbar-thin scrollbar-thumb-embler-accent scrollbar-track-embler-dark">
        {currentMessages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>No hay mensajes en esta conversación</p>
              <p className="text-sm mt-1">Envía el primer mensaje para comenzar</p>
            </div>
          </div>
        ) : (
          currentMessages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={isOwnMessage(message)}
              getRelativeTime={getRelativeTime}
            />
          ))
        )}
        
        {/* Indicador de escritura */}
        {isTyping && (
          <div className="self-start bg-embler-accent/50 text-white px-4 py-2 rounded-2xl text-sm italic animate-pulse">
            Escribiendo...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <form onSubmit={handleSendMessage} className="flex items-end gap-3 px-6 py-4 border-t border-embler-accent bg-embler-gray/50 backdrop-blur-sm sticky bottom-0">
        {/* Campo de texto */}
        <div className="flex-1 relative">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="w-full px-4 py-3 rounded-xl bg-embler-accent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-embler-yellow transition-all duration-200 resize-none min-h-[3rem] max-h-32"
            rows={1}
          />
          
          {/* Contador de caracteres */}
          <div className="absolute bottom-1 right-2 text-xs text-gray-500">
            {newMessage.length}/1000
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          {/* Botón de archivos */}
          <button
            type="button"
            className="p-3 rounded-xl hover:bg-embler-accent transition-colors text-gray-400 hover:text-white"
            title="Adjuntar archivo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          
          {/* Botón de enviar */}
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-embler-yellow text-embler-dark font-semibold rounded-xl px-6 py-3 hover:bg-embler-yellow/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>Enviar</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </main>
  );
};

export default ChatPanel; 