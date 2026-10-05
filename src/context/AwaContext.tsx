// Enregistre ce fichier dans : src/context/AwaContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Si tu utilises react-router
import { supabase } from '../lib/supabase'; // Importe ton client Supabase existant

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AwaContextType {
  messages: Message[];
  sendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  clearChat: () => void;
}

const AwaContext = createContext<AwaContextType | undefined>(undefined);

export const AwaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const location = useLocation(); // Détecte automatiquement sur quelle page se trouve l'agent

  // Fonction pour envoyer un message à la Edge Function Supabase
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Récupération de la session utilisateur pour passer les infos de l'agent si besoin
      const { data: { session } } = await supabase.auth.getSession();

      const { data, error } = await supabase.functions.invoke('awa-brain', {
        body: {
          messages: updatedMessages,
          contextPage: location.pathname, // Donne le chemin (ex: /sinistres, /dashboard)
          agentInfo: {
            email: session?.user?.email,
            id: session?.user?.id
          }
        },
      });

      if (error) throw error;

      if (data && data.text) {
        setMessages([...updatedMessages, { role: 'assistant', content: data.text }]);
      }
    } catch (error) {
      console.error("Erreur de communication avec Awa:", error);
      setMessages([...updatedMessages, { role: 'assistant', content: "Désolée, j'ai rencontré un petit problème de connexion. Peux-tu réessayer ?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <AwaContext.Provider value={{ messages, sendMessage, isLoading, clearChat }}>
      {children}
    </AwaContext.Provider>
  );
};

// Hook personnalisé pour consommer Awa partout facilement
export const useAwa = () => {
  const context = useContext(AwaContext);
  if (!context) {
    throw new Error('useAwa doit être utilisé à l\'intérieur d\'un AwaProvider');
  }
  return context;
};