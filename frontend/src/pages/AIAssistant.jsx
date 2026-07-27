import React, { useState, useRef, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';
import { sendAssistantMessage } from '../services/api';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'Hello! I am your EcoWatt AI assistant. Ask me anything about your energy usage, bills, or how to save power.' },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState('');
  const scrollContainerRef = useRef(null);
  const isSendingRef = useRef(false); // synchronous lock — prevents double-submit before state updates land

  useEffect(() => {
    // Scroll only the chat's own scroll container, never the outer page.
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, thinking]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSendingRef.current) return;
    isSendingRef.current = true;

    const userMessage = { id: Date.now(), sender: 'user', text: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setError('');
    setThinking(true);

    try {
      const data = await sendAssistantMessage(trimmed, messages);
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: data.reply }]);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Could not reach the AI assistant. Make sure the backend is running and GROQ_API_KEY is set.';
      setError(detail);
    } finally {
      setThinking(false);
      isSendingRef.current = false;
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-7rem)]">
      <PageHeader
        title="AI Assistant"
        subtitle="Chat with your personal energy advisor for recommendations and real-time troubleshooting."
      />

      <Card className="flex-1 flex flex-col justify-between overflow-hidden p-4 md:p-6">
        {/* Chat Messages Area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-[80%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-emerald-500 text-slate-950 font-bold text-xs' : 'bg-slate-800 border border-slate-700 text-emerald-400'}`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none' : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-slate-800 border border-slate-700 text-emerald-400">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-slate-800/80 border border-slate-700/60 text-slate-400 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
              {error}
            </div>
          )}

        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your power consumption..."
              disabled={thinking}
              className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-60"
            />
            <Sparkles className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
          </div>
          <Button type="submit" className="h-11 px-5" disabled={thinking}>
            {thinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AIAssistant;
