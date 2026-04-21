'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface PrescriptionData {
  score?: number;
  riskLevel?: 'low' | 'moderate' | 'high';
  medicines?: string[];
}

const quickQuestions = [
  'What is the prescription score?',
  'What are the medicines in this prescription?',
  'Are there any side effects?',
  'How should I take these medicines?',
  'Is this safe for me?',
];

const mockAIResponses: Record<string, string> = {
  'What is the prescription score?':
    '🔍 Your prescription has been analyzed and assigned a score of 7.5/10. This indicates a MODERATE risk level. The prescription contains 3 medications with potential interactions that require monitoring.',
  'What are the medicines in this prescription?':
    '💊 The prescription contains:\n1. Amoxicillin 500mg - Antibiotic for bacterial infections\n2. Paracetamol 500mg - Pain reliever and fever reducer\n3. Vitamin B12 1000mcg - Vitamin supplement',
  'Are there any side effects?':
    '⚠️ Possible side effects include:\n- Amoxicillin: Nausea, diarrhea, allergic reactions\n- Paracetamol: Liver damage if exceeded 4g/day\n- Vitamin B12: Generally safe, rare dizziness\n\nMonitor for symptoms and consult your doctor if issues persist.',
  'How should I take these medicines?':
    '💊 Take Amoxicillin every 8 hours with water (with or without food). Take Paracetamol every 6 hours as needed, maximum 4g/day. Take Vitamin B12 once daily, preferably in morning. Complete full antibiotic course even if you feel better.',
  'Is this safe for me?':
    '✅ This prescription is generally safe, but consult with your doctor about:\n- Allergies to penicillin-based antibiotics\n- Liver or kidney conditions\n- Current medications you are taking\n- Pregnancy status\n\nAlways inform your doctor of all conditions.',
};

export function PrescriptionAIChat({ fileName }: { fileName?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: `Hello! I've analyzed the prescription${fileName ? ` from ${fileName}` : ''}. I can provide you with:\n\n📊 Prescription Score & Risk Assessment\n💊 Detailed medication information\n⚠️ Side effects and precautions\n📋 Dosage and administration guide\n🔬 Drug interactions\n\nAsk me anything about this prescription!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse =
        mockAIResponses[text as keyof typeof mockAIResponses] ||
        `I understand your question about "${text}". Based on the prescription analysis, here's what I found: This is a complex medication interaction that requires professional consultation. I recommend discussing this with your pharmacist or doctor for personalized advice.`;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <Card className="flex flex-col h-full bg-card border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border bg-secondary/30">
        <h3 className="font-semibold text-foreground">🤖 Prescription AI Assistant</h3>
        <p className="text-xs text-muted-foreground mt-1">Instant prescription analysis & guidance</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-muted text-foreground rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground px-4 py-3 rounded-lg rounded-bl-none">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="px-4 py-3 border-t border-border bg-secondary/10">
          <p className="text-xs font-medium text-muted-foreground mb-2">Quick Questions:</p>
          <div className="grid grid-cols-1 gap-2">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="text-left text-xs p-2 rounded bg-secondary hover:bg-secondary/80 text-foreground transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border flex gap-2">
        <Input
          placeholder="Ask about this prescription..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              handleSendMessage(input);
            }
          }}
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          onClick={() => handleSendMessage(input)}
          disabled={isLoading || !input.trim()}
          className="px-4"
        >
          {isLoading ? '...' : 'Send'}
        </Button>
      </div>
    </Card>
  );
}
