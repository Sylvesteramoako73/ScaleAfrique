'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Bot, Send } from 'lucide-react';
import { chatbotService } from '@/services/chatbot.service';

interface Message { role: 'user' | 'assistant'; content: string; streaming?: boolean; }

const getVisitorId = () => {
  if (typeof window === 'undefined') return 'anon';
  let id = localStorage.getItem('sc_vid');
  if (!id) { id = Math.random().toString(36).slice(2); localStorage.setItem('sc_vid', id); }
  return id;
};

export default function WidgetPage() {
  const params = useParams();
  const id = params?.id as string;
  const [bot, setBot] = useState<{ id: string; name: string; greeting: string; primaryColor: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const visitorId = useRef(getVisitorId());

  useEffect(() => {
    chatbotService.getPublic(id).then(b => {
      setBot(b);
      setMessages([{ role: 'assistant', content: b.greeting }]);
    }).catch(() => {});
  }, [id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading || !bot) return;
    const msg = input.trim();
    setInput('');
    setMessages(p => [...p, { role: 'user', content: msg }]);
    setLoading(true);

    // Add empty streaming placeholder
    setMessages(p => [...p, { role: 'assistant', content: '', streaming: true }]);

    try {
      const response = await fetch(`/api/v1/public/chatbots/${bot.id}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId: visitorId.current, message: msg }),
      });

      if (!response.ok || !response.body) throw new Error('Stream failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') break;
          try {
            const { token } = JSON.parse(payload);
            setMessages(p => {
              const copy = [...p];
              copy[copy.length - 1] = { ...copy[copy.length - 1], content: copy[copy.length - 1].content + token };
              return copy;
            });
          } catch { /* ignore malformed */ }
        }
      }

      // Mark streaming done
      setMessages(p => {
        const copy = [...p];
        copy[copy.length - 1] = { ...copy[copy.length - 1], streaming: false };
        return copy;
      });
    } catch {
      setMessages(p => {
        const copy = [...p];
        copy[copy.length - 1] = { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  };

  if (!bot) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-white font-sans">
      <div className="px-4 py-3 flex items-center gap-2 text-white shrink-0" style={{ backgroundColor: bot.primaryColor }}>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><Bot size={16} /></div>
        <div>
          <p className="font-semibold text-sm leading-tight">{bot.name}</p>
          <p className="text-xs opacity-75 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />Online
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'}`}
              style={m.role === 'user' ? { backgroundColor: bot.primaryColor } : {}}
            >
              {m.content}
              {m.streaming && <span className="inline-block w-1.5 h-3.5 bg-gray-400 ml-0.5 animate-pulse rounded-sm" />}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start">
            <div className="bg-white px-3 py-2 rounded-2xl shadow-sm flex gap-1">
              {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-2 border-t border-gray-100 flex gap-2 shrink-0 bg-white">
        <input
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          placeholder="Type a message…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: bot.primaryColor }}
        >
          <Send size={15} />
        </button>
      </div>
      <div className="text-center py-1.5 text-gray-300 text-[10px] bg-white shrink-0">Powered by ScaleAfrique</div>
    </div>
  );
}
