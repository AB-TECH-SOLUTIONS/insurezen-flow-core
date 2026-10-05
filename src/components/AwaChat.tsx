import React, { useState, useRef, useEffect } from 'react';
import { useAwa } from '../context/AwaContext';

export const AwaChat: React.FC = () => {
  const { messages, sendMessage, isLoading, clearChat } = useAwa();
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas lors de l'arrivée de nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const textToSend = input;
    setInput(''); // On vide l'input immédiatement pour un meilleur ressenti utilisateur (UX)
    await sendMessage(textToSend);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Texte copié dans le presse-papiers ! Prêt à être collé dans Mercure/ORASS ou par WhatsApp.');
  };

  return (
    <>
      {/* Bouton Flottant Fixe en bas à droite de l'écran pour appeler Awa */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-200 z-50 flex items-center space-x-2 animate-bounce"
        >
          <span className="text-xl">✨</span>
          <span className="font-semibold text-sm">Demander à Awa</span>
        </button>
      )}

      {/* Panneau Latéral Coulissant */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-slate-900 text-slate-100 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header de la discussion */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <div>
              <h3 className="font-bold text-emerald-400">Awa — Assistante Native</h3>
              <p className="text-xs text-slate-400">Expertise CIMA & Productivité</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={clearChat}
              title="Effacer la conversation"
              className="text-slate-400 hover:text-rose-400 text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 transition"
            >
              Effacer
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white font-bold text-xl px-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Zone des messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
          {messages.length === 0 && (
            <div className="text-center py-8 text-slate-500 space-y-3">
              <p className="text-3xl">🇨🇲</p>
              <p className="text-sm font-medium text-slate-400">
                Bonjour ! Je suis connectée à votre écran.
              </p>
              <div className="text-xs text-slate-500 text-left bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-2">
                <p className="font-semibold text-emerald-500">Exemples de commandes :</p>
                <p>• "Rédige une relance polie pour la prime auto en retard de M. Ndoumbe."</p>
                <p>• "Prépare les données de cette fiche au format texte pour une saisie rapide sur ORASS."</p>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <span className="text-[10px] text-slate-500 mb-1 font-semibold uppercase tracking-wider">
                {msg.role === 'user' ? 'Vous' : 'Awa'}
              </span>
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm relative group ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                
                {/* Petit bouton pour copier rapidement la réponse d'Awa (Idéal pour coller ailleurs) */}
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(msg.content)}
                    className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 bg-slate-700 hover:bg-slate-600 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded transition duration-150"
                    title="Copier le texte"
                  >
                    Copier
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Indicateur de chargement / Réflexion de l'IA */}
          {isLoading && (
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-slate-500 mb-1 font-semibold uppercase tracking-wider">Awa</span>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none p-3 shadow-sm flex space-x-1 items-center">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulaire de saisie d'un message */}
        <form onSubmit={handleSend} className="p-4 bg-slate-800 border-t border-slate-700 flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Posez votre question à Awa..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
          >
            Envoyer
          </button>
        </form>
      </div>
    </>
  );
};