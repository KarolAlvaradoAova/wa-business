import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface ChatMessage {
  id: string;
  text: string;
  sender: 'client' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

const ClientChat: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '¡Hola! 👋 Soy el asistente virtual de Embler. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simular respuesta del bot
  const simulateBotResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let botResponse = '';
      
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('hola') || lowerMessage.includes('buenas')) {
        botResponse = '¡Hola! 😊 Me da mucho gusto saludarte. ¿Podrías decirme tu nombre para ofrecerte una mejor atención?';
      } else if (lowerMessage.includes('nombre') || lowerMessage.includes('llamo')) {
        botResponse = '¡Mucho gusto! Es un placer conocerte. ¿En qué área te puedo ayudar? Puedo asistirte con:\n\n• Información sobre productos\n• Soporte técnico\n• Preguntas generales\n• Conectarte con un agente';
      } else if (lowerMessage.includes('producto') || lowerMessage.includes('servicio')) {
        botResponse = 'Excelente. Ofrecemos soluciones de WhatsApp Business para empresas:\n\n✅ Gestión profesional de chats\n✅ Chatbots inteligentes\n✅ API oficial de Meta\n✅ Análisis y reportes\n\n¿Te interesa alguna funcionalidad en particular?';
      } else if (lowerMessage.includes('precio') || lowerMessage.includes('costo')) {
        botResponse = 'Para conocer nuestros planes y precios, me gustaría conectarte con uno de nuestros especialistas. ¿Te parece bien si programo una llamada o prefieres que un agente te contacte por este medio?';
      } else if (lowerMessage.includes('agente') || lowerMessage.includes('humano')) {
        botResponse = 'Por supuesto, te voy a conectar con uno de nuestros agentes. Un momento por favor... 👨‍💼\n\n*Nota: En la versión completa, aquí se transferiría la conversación a un agente real.*';
      } else if (lowerMessage.includes('adiós') || lowerMessage.includes('bye')) {
        botResponse = '¡Gracias por contactarnos! Ha sido un placer ayudarte. Si necesitas algo más, no dudes en escribirnos. ¡Que tengas un excelente día! 👋';
      } else {
        botResponse = `Entiendo tu consulta sobre "${userMessage}". Para darte la mejor respuesta, ¿podrías ser un poco más específico? También puedo conectarte directamente con un agente si prefieres. 🤔`;
      }
      
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      }]);
    }, 1500 + Math.random() * 1000); // Simular tiempo de respuesta variable
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'client',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    
    // Simular respuesta del bot
    simulateBotResponse(inputValue);
  };

  const handleQuickResponse = (text: string) => {
    setInputValue(text);
  };

  const quickResponses = [
    "¿Qué servicios ofrecen?",
    "Necesito ayuda con WhatsApp Business",
    "Quiero hablar con un agente",
    "¿Cuáles son los precios?"
  ];

  return (
    <div className="min-h-screen bg-embler-dark flex flex-col">
      {/* Header Fijo */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-embler-gray shadow-sm border-b border-embler-accent p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="p-2 rounded-lg hover:bg-embler-dark/50 transition-colors text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-embler-yellow rounded-full flex items-center justify-center">
                <span className="text-embler-dark font-bold text-lg">E</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Embler Support</h1>
                <div className="flex items-center gap-1 text-sm text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>En línea</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            <span className="bg-embler-yellow/20 text-embler-yellow px-2 py-1 rounded-full text-xs font-medium border border-embler-yellow/30">
              Simulación Cliente
            </span>
          </div>
        </div>
      </div>

      {/* Espaciador para el header fijo */}
      <div className="h-20"></div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-embler-gray shadow-lg border border-embler-accent">
        
        {/* Messages Area - Solo esta parte hace scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100vh - 240px)' }}>
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'client' 
                  ? 'bg-embler-yellow text-embler-dark' 
                  : 'bg-embler-dark text-gray-200'
              }`}>
                <p className="whitespace-pre-line">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'client' ? 'text-embler-dark/70' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-embler-dark text-gray-200 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-embler-yellow rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-embler-yellow rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-embler-yellow rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">escribiendo...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area Fija - Siempre visible en la parte inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-embler-gray border-t border-embler-accent">
        <div className="max-w-4xl mx-auto">
          {/* Quick Responses */}
          {messages.length <= 3 && (
            <div className="p-4 border-b border-embler-accent bg-embler-dark/30">
              <p className="text-sm text-gray-300 mb-2">Respuestas rápidas:</p>
              <div className="flex flex-wrap gap-2">
                {quickResponses.map((response, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickResponse(response)}
                    className="px-3 py-1 bg-embler-gray border border-embler-accent rounded-full text-sm text-gray-300 hover:border-embler-yellow hover:text-embler-yellow transition-colors"
                  >
                    {response}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-4 py-2 bg-embler-dark border border-embler-accent rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-embler-yellow focus:border-transparent"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="px-6 py-2 bg-embler-yellow text-embler-dark font-medium rounded-lg hover:bg-embler-yellow/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Espaciador para el footer fijo */}
      <div className="h-32"></div>

      {/* Footer */}
      <div className="p-4 text-center bg-embler-dark border-t border-embler-accent">
        <p className="text-xs text-gray-400">
          Esta es una simulación del chatbot para desarrollo • No es la experiencia real del cliente
        </p>
      </div>
    </div>
  );
};

export default ClientChat; 