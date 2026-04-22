'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Send, Bot, User, Sparkles, Lightbulb, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function AskAIPage() {
  const { chatHistory, addChatMessage, prescriptions } = useStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    addChatMessage({ role: 'user', content: userMsg });
    setIsTyping(true);

    try {
      const activeMedicines = prescriptions.flatMap(p => p.medicines.map(m => m.name)).join(", ");
      
      const formData = new FormData();
      formData.append('message', userMsg);
      if (activeMedicines) formData.append('context', activeMedicines);

      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        addChatMessage({ role: 'assistant', content: data.reply });
      } else {
        throw new Error(data.detail || "Failed to get response");
      }
    } catch (error: any) {
      addChatMessage({ 
        role: 'assistant', 
        content: `Error: ${error.message}. Please make sure your AI backend is running on port 8000.` 
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 mt-16 max-w-4xl h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-md">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">MediSafe AI Chat</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Powered by your local AI Model</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
                <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20 mx-auto">
                  <Bot className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">How can I help you today?</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                  I am your MediSafe Specialized Assistant. I can help with medication questions, side effects, and health wellness. I will only answer medical-related queries.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {['Can I take this with coffee?', 'What are the side effects?', 'Missed my morning dose', 'Explain these medications'].map(q => (
                    <Button 
                      key={q} 
                      variant="outline" 
                      className="justify-start h-auto py-3 px-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-300 transition-all text-left font-medium rounded-xl group"
                      onClick={() => setInput(q)}
                    >
                      <Lightbulb className="w-4 h-4 mr-2 text-amber-500 shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="truncate">{q}</span>
                    </Button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {chatHistory.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}
                >
                  <div className={`flex gap-4 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-slate-900 dark:bg-slate-800 text-white' : 'bg-gradient-to-br from-teal-400 to-teal-600 text-white'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4 md:w-5 md:h-5" /> : <Bot className="w-4 h-4 md:w-5 md:h-5" />}
                    </div>
                    <div className={`px-5 py-4 rounded-2xl ${msg.role === 'user' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tr-sm' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm rounded-tl-sm text-slate-800 dark:text-slate-200'}`}>
                      <div className="prose prose-sm md:prose-base prose-slate dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-6">
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 shadow-sm rounded-tl-sm flex items-center">
                  <div className="flex gap-1.5 items-center">
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-2 h-2 bg-teal-500 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 bg-teal-500 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 bg-teal-500 rounded-full" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex items-end bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all p-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your AI model anything..."
              className="w-full resize-none bg-transparent py-3 pl-4 pr-24 text-sm md:text-base focus:outline-none scrollbar-hide min-h-[48px] max-h-[160px] dark:text-white"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <Button 
                variant="ghost"
                size="icon" 
                className="rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 w-10 h-10 transition-colors"
                onClick={() => setInput("Explain my medications in simple terms")}
              >
                <Mic className="w-4 h-4" />
              </Button>
              <Button 
                size="icon" 
                className="rounded-xl bg-teal-600 hover:bg-teal-700 w-10 h-10 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
              >
                <Send className="w-4 h-4 ml-0.5" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center mt-3 px-2">
            <p className="text-xs text-slate-400 font-medium">
              Connected to Local AI Backend
            </p>
            <p className="text-[10px] text-slate-400">
              Consult your doctor for medical advice.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
