'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Plus, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { aiService } from '../services/ai.service';
import { ChatMessage, TypingIndicator } from '../components/ai-advisor/ChatMessage';
import { Button } from '../components/ui/Button';
import { AI_SUGGESTED_PROMPTS } from '../utils/constants';
import type { AIMessage } from '../types';

interface Conversation {
  id: string;
  title: string;
  messages: AIMessage[];
  updatedAt: string;
}

let idCounter = 1;
const mkId = () => `msg-${Date.now()}-${idCounter++}`;

export function AIAdvisor() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'c1',
      title: 'Welcome conversation',
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: mkId(),
          role: 'assistant',
          content: `Hello! I'm your ScaleAfrique AI Advisor — trained on African market data and startup growth strategies across Ghana, Nigeria, Kenya, South Africa, and the rest of the continent.\n\nI can help you:\n• Build a marketing strategy tailored to your region\n• Write campaign copy in English, Twi, Hausa, Swahili, and more\n• Analyse which channels work best for your industry\n• Identify growth opportunities in African markets\n\nWhat would you like to work on today?`,
          timestamp: new Date().toISOString(),
        },
      ],
    },
  ]);
  const [activeId, setActiveId] = useState('c1');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const active = conversations.find(c => c.id === activeId)!;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active.messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: AIMessage = { id: mkId(), role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    setConversations(cs => cs.map(c =>
      c.id === activeId
        ? { ...c, messages: [...c.messages, userMsg], title: c.messages.length === 1 ? text.slice(0, 40) : c.title }
        : c
    ));
    setInput('');
    setIsTyping(true);

    try {
      const res = await aiService.chat(text.trim(), activeId);
      const aiMsg: AIMessage = {
        id: mkId(),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toISOString(),
      };
      setConversations(cs => cs.map(c =>
        c.id === activeId ? { ...c, messages: [...c.messages, aiMsg] } : c
      ));
    } catch {
      const errMsg: AIMessage = {
        id: mkId(),
        role: 'assistant',
        content: "I'm sorry, I couldn't connect to the AI service right now. Please check your API key in the settings and try again.",
        timestamp: new Date().toISOString(),
      };
      setConversations(cs => cs.map(c =>
        c.id === activeId ? { ...c, messages: [...c.messages, errMsg] } : c
      ));
    } finally {
      setIsTyping(false);
    }
  };

  const newChat = () => {
    const id = `c${Date.now()}`;
    setConversations(cs => [{
      id,
      title: 'New conversation',
      updatedAt: new Date().toISOString(),
      messages: [{
        id: mkId(), role: 'assistant',
        content: 'Hi! What marketing challenge can I help you tackle today?',
        timestamp: new Date().toISOString(),
      }],
    }, ...cs]);
    setActiveId(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] max-w-6xl mx-auto gap-4">
      {/* Sidebar */}
      <aside className="w-56 flex flex-col gap-2 shrink-0">
        <Button onClick={newChat} fullWidth icon={<Plus size={15} />} variant="outline">
          New Chat
        </Button>
        <div className="flex-1 overflow-y-auto space-y-1">
          {conversations.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={clsx(
                'w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors truncate',
                c.id === activeId ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {c.title}
            </button>
          ))}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
            <Sparkles size={14} className="text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">ScaleAfrique AI Advisor</p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />Online
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {active.messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Suggested prompts */}
        {active.messages.length <= 2 && (
          <div className="px-5 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {AI_SUGGESTED_PROMPTS.slice(0, 4).map(p => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="shrink-0 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-5 pb-4 pt-2 border-t border-gray-100">
          <div className="flex gap-2 items-end bg-gray-50 rounded-xl border border-gray-200 p-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your marketing strategy, content, campaigns..."
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none max-h-28 py-1 px-1"
              style={{ lineHeight: '1.5' }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center shrink-0 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            AI-powered by Claude · Trained on African market data
          </p>
        </div>
      </div>
    </div>
  );
}
