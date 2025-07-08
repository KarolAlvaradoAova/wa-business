import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState, Chat, Message, Client, Notification, AppAction } from '../types';

// Estado inicial
const initialState: AppState = {
  currentChat: null,
  chats: [],
  messages: {},
  clients: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  notifications: [],
  theme: 'dark',
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_CURRENT_CHAT':
      return {
        ...state,
        currentChat: action.payload,
      };
    case 'ADD_MESSAGE':
      const message = action.payload;
      return {
        ...state,
        messages: {
          ...state.messages,
          [message.chatId]: [
            ...(state.messages[message.chatId] || []),
            message,
          ],
        },
        chats: state.chats.map(chat =>
          chat.id === message.chatId
            ? {
                ...chat,
                lastMessage: message,
                unreadCount: message.senderId !== state.currentChat?.assignedAgentId
                  ? chat.unreadCount + 1
                  : chat.unreadCount,
                updatedAt: message.timestamp,
              }
            : chat
        ),
      };
    case 'UPDATE_CHAT':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload.id ? action.payload : chat
        ),
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    default:
      return state;
  }
};

// Datos mock modernos y realistas
const mockChats: Chat[] = [
  {
    id: 'chat-1',
    clientId: 'client-1',
    clientName: 'María Rodríguez',
    clientPhone: '+52 55 1234 5678',
    clientAvatar: undefined,
    assignedAgentId: 'agent-1',
    lastMessage: {
      id: 'msg-1',
      chatId: 'chat-1',
      senderId: 'client-1',
      content: '¡Hola! Me interesa conocer más sobre sus servicios de consultoría empresarial.',
      type: 'text',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
      isRead: false,
      isDelivered: true,
    },
    unreadCount: 2,
    isActive: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
    updatedAt: new Date(Date.now() - 5 * 60 * 1000),
    tags: ['consultoría', 'nuevo-cliente'],
    priority: 'high',
    status: 'assigned',
  },
  {
    id: 'chat-2',
    clientId: 'client-2',
    clientName: 'Carlos Martínez',
    clientPhone: '+52 55 9876 5432',
    clientAvatar: undefined,
    assignedAgentId: 'agent-1',
    lastMessage: {
      id: 'msg-5',
      chatId: 'chat-2',
      senderId: 'agent-1',
      content: 'Perfecto, le envío la propuesta comercial actualizada en un momento.',
      type: 'text',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
      isRead: true,
      isDelivered: true,
    },
    unreadCount: 0,
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    tags: ['propuesta', 'seguimiento'],
    priority: 'medium',
    status: 'assigned',
  },
  {
    id: 'chat-3',
    clientId: 'client-3',
    clientName: 'Ana López',
    clientPhone: '+52 55 5555 1234',
    clientAvatar: undefined,
    assignedAgentId: 'agent-1',
    lastMessage: {
      id: 'msg-8',
      chatId: 'chat-3',
      senderId: 'client-3',
      content: 'Muchas gracias por la información. ¿Cuándo podríamos agendar una reunión?',
      type: 'text',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      isRead: false,
      isDelivered: true,
    },
    unreadCount: 1,
    isActive: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 día atrás
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    tags: ['reunión', 'programación'],
    priority: 'medium',
    status: 'assigned',
  },
  {
    id: 'chat-4',
    clientId: 'client-4',
    clientName: 'Team Embler',
    clientPhone: '+52 55 0000 0000',
    clientAvatar: undefined,
    assignedAgentId: null,
    lastMessage: {
      id: 'msg-12',
      chatId: 'chat-4',
      senderId: 'system',
      content: 'Actualización semanal del sistema completada. Nuevas funcionalidades disponibles.',
      type: 'system',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
      isRead: false,
      isDelivered: true,
      isFromBot: true,
    },
    unreadCount: 5,
    isActive: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 semana atrás
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    tags: ['sistema', 'notificaciones'],
    priority: 'low',
    status: 'open',
  },
];

const mockMessages: Record<string, Message[]> = {
  'chat-1': [
    {
      id: 'msg-1',
      chatId: 'chat-1',
      senderId: 'client-1',
      content: '¡Hola! Me interesa conocer más sobre sus servicios de consultoría empresarial.',
      type: 'text',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: true,
      isDelivered: true,
    },
    {
      id: 'msg-2',
      chatId: 'chat-1',
      senderId: 'client-1',
      content: 'Específicamente necesito ayuda con optimización de procesos y reducción de costos.',
      type: 'text',
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
      isRead: false,
      isDelivered: true,
    },
  ],
  'chat-2': [
    {
      id: 'msg-3',
      chatId: 'chat-2',
      senderId: 'client-2',
      content: 'Buenos días, quería hacer seguimiento a la propuesta que me enviaron la semana pasada.',
      type: 'text',
      timestamp: new Date(Date.now() - 35 * 60 * 1000),
      isRead: true,
      isDelivered: true,
    },
    {
      id: 'msg-4',
      chatId: 'chat-2',
      senderId: 'agent-1',
      content: 'Buenos días Carlos! Por supuesto, voy a revisar su propuesta y le comparto las actualizaciones.',
      type: 'text',
      timestamp: new Date(Date.now() - 32 * 60 * 1000),
      isRead: true,
      isDelivered: true,
    },
    {
      id: 'msg-5',
      chatId: 'chat-2',
      senderId: 'agent-1',
      content: 'Perfecto, le envío la propuesta comercial actualizada en un momento.',
      type: 'text',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: true,
      isDelivered: true,
    },
  ],
  'chat-3': [
    {
      id: 'msg-6',
      chatId: 'chat-3',
      senderId: 'client-3',
      content: 'Hola, me gustaría saber más detalles sobre el plan de implementación.',
      type: 'text',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isRead: true,
      isDelivered: true,
    },
    {
      id: 'msg-7',
      chatId: 'chat-3',
      senderId: 'agent-1',
      content: 'Claro Ana! El plan incluye 3 fases: análisis inicial, implementación piloto y despliegue completo. Cada fase tiene una duración estimada de 2-3 semanas.',
      type: 'text',
      timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
      isRead: true,
      isDelivered: true,
    },
    {
      id: 'msg-8',
      chatId: 'chat-3',
      senderId: 'client-3',
      content: 'Muchas gracias por la información. ¿Cuándo podríamos agendar una reunión?',
      type: 'text',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
      isDelivered: true,
    },
  ],
};

// Contexto
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Funciones de conveniencia
  selectChat: (chat: Chat) => void;
  sendMessage: (content: string, type?: Message['type']) => void;
  markChatAsRead: (chatId: string) => void;
  searchChats: (query: string) => Chat[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    chats: mockChats,
    messages: mockMessages,
  });

  // Funciones de conveniencia
  const selectChat = (chat: Chat) => {
    dispatch({ type: 'SET_CURRENT_CHAT', payload: chat });
    markChatAsRead(chat.id);
  };

  const sendMessage = (content: string, type: Message['type'] = 'text') => {
    if (!state.currentChat) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      chatId: state.currentChat.id,
      senderId: 'agent-1', // ID del agente actual
      content,
      type,
      timestamp: new Date(),
      isRead: true,
      isDelivered: true,
    };

    dispatch({ type: 'ADD_MESSAGE', payload: message });
  };

  const markChatAsRead = (chatId: string) => {
    const chat = state.chats.find(c => c.id === chatId);
    if (chat && chat.unreadCount > 0) {
      dispatch({
        type: 'UPDATE_CHAT',
        payload: { ...chat, unreadCount: 0 },
      });
    }
  };

  const searchChats = (query: string): Chat[] => {
    if (!query.trim()) return state.chats;
    
    const lowercaseQuery = query.toLowerCase();
    return state.chats.filter(chat =>
      chat.clientName.toLowerCase().includes(lowercaseQuery) ||
      chat.clientPhone.includes(query) ||
      chat.lastMessage?.content.toLowerCase().includes(lowercaseQuery) ||
      chat.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const fullNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: fullNotification });
  };

  const toggleTheme = () => {
    dispatch({
      type: 'SET_THEME',
      payload: state.theme === 'dark' ? 'light' : 'dark',
    });
  };

  const value: AppContextType = {
    state,
    dispatch,
    selectChat,
    sendMessage,
    markChatAsRead,
    searchChats,
    addNotification,
    toggleTheme,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook para usar el contexto
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
}; 