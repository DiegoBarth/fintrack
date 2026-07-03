import { useState, useRef, useEffect } from 'react';
import { askGeminiAdvisor } from '@/api/endpoints/home';
import { Button } from '@/components/ui/Button';
import { Sparkles, Loader2, Send, X } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function GeminiAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMessage = prompt.trim();
    setPrompt('');
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await askGeminiAdvisor(userMessage);

      if (response.success && response.answer) {
        setMessages((prev) => [...prev, { role: 'assistant', content: response.answer! }]);
      } else {
        setError(response.error || 'Não foi possível obter uma resposta no momento.');
      }
    } catch (err) {
      setError('Erro de conexão com o consultor financeiro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-blue-500 dark:text-blue-400 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all relative group"
        title="Consultor Fintrack AI"
        aria-label="Abrir Consultor AI"
      >
        <Sparkles className="h-[18px] w-[18px]" />
        
        <span className="absolute top-full right-0 mt-2 hidden group-hover:block bg-gray-900 text-white text-[11px] px-2 py-1 rounded shadow-md whitespace-nowrap z-50">
          Fintrack AI
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-gray-50 dark:bg-gray-950 w-full max-w-lg h-[80vh] max-h-[600px] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-scale-up"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500 rounded-lg text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    Fintrack AI — Consultor de Gastos
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Online e pronto para ajudar</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar relative">
              {messages.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-gray-500 dark:text-gray-400 space-y-2 pointer-events-none">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-full text-blue-500">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Como posso ajudar suas finanças hoje?</p>
                  <p className="text-xs max-w-xs">Você pode perguntar sobre metas de economia, análise de gastos ou viabilidade de compras.</p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800/60 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/60 p-3 rounded-xl rounded-bl-none flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 shadow-sm">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                    <span>Analisando suas finanças...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 rounded-xl text-xs text-red-600 dark:text-red-400 text-center">
                  {error}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleAsk} className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Quero comprar um item de R$ 800, meu orçamento aguenta?"
                disabled={loading}
                className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
              />
              <Button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="px-3.5 shrink-0 rounded-xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}