"use client";
import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Sparkles } from 'lucide-react';
export default function DataCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { messages, isLoading, append } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  const handleManualSubmit = (e?: React.FormEvent<HTMLFormElement>, overrideValue?: string) => {
    e?.preventDefault();
    const value = overrideValue || inputValue;
    if (!value.trim() || isLoading) return;
    append({ role: 'user', content: value });
    setInputValue('');
  };
  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-slate-900 text-white rounded-full p-4 shadow-xl hover:bg-slate-800 transition-all z-50 flex items-center gap-2 group border border-slate-700 hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-6 h-6 text-emerald-400" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-medium">
            ¡Consúltame sobre tus ventas!
          </span>
        </button>
      )}
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden transform transition-all animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-slate-900 p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Copiloto de Datos</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 mt-10 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-emerald-400" />
                <p className="font-medium text-slate-700">¡Hola! Soy tu Copiloto Inteligente.</p>
                <p className="text-sm">Pregúntame sobre ventas, clientes y el estado actual de Plastigesa.</p>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      handleManualSubmit(undefined, '¿Cuáles fueron las ventas de este mes?');
                    }}
                    className="text-xs bg-white border border-slate-200 p-2 rounded-lg hover:bg-slate-100 text-left transition-colors"
                  >
                    📊 ¿Cuáles fueron las ventas de este mes?
                  </button>
                  <button
                    onClick={() => {
                      handleManualSubmit(undefined, '¿Quiénes son nuestros mejores vendedores de este mes?');
                    }}
                    className="text-xs bg-white border border-slate-200 p-2 rounded-lg hover:bg-slate-100 text-left transition-colors"
                  >
                    🏆 ¿Quiénes son los mejores vendedores de este mes?
                  </button>
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col max-w-[85%] ${m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm ${m.role === 'user'
                    ? 'bg-slate-900 text-white rounded-br-sm'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
                    }`}
                >
                  {/* Render message content */}
                  {m.content && (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  )}
                  {/* Render tool invocations */}
                  {m.toolInvocations?.map((invocation, index) => {
                    if (invocation.state === 'call') {
                      return (
                        <div key={index} className="flex items-center gap-2 mt-2 text-xs text-slate-500 border-l-2 border-emerald-400 pl-2">
                          <Loader2 className="w-3 h-3 animate-spin" /> Consultando Odoo ({invocation.toolName})...
                        </div>
                      );
                    }
                    if (invocation.state === 'result') {
                      return (
                        <div key={index} className="flex items-center gap-2 mt-2 text-xs text-emerald-600 font-medium border-l-2 border-emerald-400 pl-2">
                          ✅ Datos obtenidos ({invocation.toolName})
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex max-w-[85%] mr-auto items-start">
                <div className="px-4 py-2.5 rounded-2xl text-sm bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Preparando respuesta...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Input Area */}
          <form
            onSubmit={handleManualSubmit}
            className="p-3 bg-white border-t border-slate-200 shrink-0"
          >
            <div className="flex gap-2 relative">
              <input
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Pregúntame algo sobre las ventas..."
                className="flex-1 border border-slate-300 rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-1 top-1 bottom-1 bg-slate-900 text-white w-9 rounded-full flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
