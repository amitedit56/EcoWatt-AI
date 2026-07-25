import React, { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Bot, Send, User, Sparkles, RefreshCw } from 'lucide-react';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'Hello Amit! I am your EcoWatt AI assistant. How can I help you optimize your energy consumption today?' },
    { id: 2, sender: 'user', text: 'Why is my electricity bill high this month?' },
    { 
      id: 3, 
      sender: 'ai', 
      text: 'Your electricity bill is higher mainly because of increased AC usage (38% of total consumption) and longer evening usage. Try setting AC to 24-25°C.' 
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: messages.length + 1, sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiReply = { 
        id: messages.length + 2, 
        sender: 'ai', 
        text: 'I have logged your request. Based on your usage trends, keeping heavy appliances off during peak hours (6 PM - 10 PM) will reduce your expenses significantly.' 
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 1000);
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-7rem)]">
      <PageHeader 
        title="AI Assistant" 
        subtitle="Chat with your personal energy advisor for recommendations and real-time troubleshooting." 
      />

      <Card className="flex-1 flex flex-col justify-between overflow-hidden p-4 md:p-6">
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex items-start gap-3 max-w-[80%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-emerald-500 text-slate-950 font-bold text-xs' : 'bg-slate-800 border border-slate-700 text-emerald-400'}`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none' : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your power consumption..."
              className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <Sparkles className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
          </div>
          <Button type="submit" className="h-11 px-5">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AIAssistant;