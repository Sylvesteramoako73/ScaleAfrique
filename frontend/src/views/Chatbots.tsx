'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Bot, MessageSquare, ToggleLeft, ToggleRight, Code, Copy, ChevronRight, ArrowLeft, Users } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { chatbotService, type Chatbot, type ChatSession } from '../services/chatbot.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardTitle } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';

// ─── Session Log Viewer ────────────────────────────────────────────────────

function SessionLog({ bot, onBack }: { bot: Chatbot; onBack: () => void }) {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['chatbots', bot.id, 'sessions'],
    queryFn: () => chatbotService.getSessions(bot.id),
  });
  const [selected, setSelected] = useState<ChatSession | null>(null);

  if (selected) return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"><ArrowLeft size={14} />Back to sessions</button>
      <Card padding={false}>
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Visitor: {selected.visitorId}</p>
          <p className="text-xs text-gray-400">{new Date(selected.createdAt).toLocaleString()}</p>
        </div>
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {selected.messages.map((m, i) => (
            <div key={i} className={clsx('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={clsx('max-w-xs px-3 py-2 rounded-2xl text-sm', m.role === 'user' ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm')}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"><ArrowLeft size={14} />Back to chatbots</button>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{bot.name} — Sessions</h3>
          <p className="text-sm text-gray-500">{sessions?.length ?? 0} conversations</p>
        </div>
      </div>
      {isLoading ? <div className="flex justify-center py-12"><Spinner size="lg" className="text-primary-600" /></div> : !sessions?.length ? (
        <Card className="text-center py-12">
          <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No conversations yet. Share your widget to start chatting.</p>
        </Card>
      ) : (
        <Card padding={false}>
          <div className="divide-y divide-gray-50">
            {sessions.map((s: ChatSession) => (
              <button key={s.id} onClick={() => setSelected(s)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0"><Users size={16} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Visitor {s.visitorId.slice(0, 8)}</p>
                  <p className="text-xs text-gray-400">{s.messages.length} messages · {new Date(s.updatedAt).toLocaleDateString()}</p>
                </div>
                <ChevronRight size={14} className="text-gray-300 shrink-0" />
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Embed Code ────────────────────────────────────────────────────────────

function EmbedCode({ bot }: { bot: Chatbot }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.scaleafrique.com';
  const code = `<!-- ScaleAfrique Chatbot Widget -->
<script>
  window.ScaleChatConfig = { botId: "${bot.id}", origin: "${origin}" };
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "${origin}/widget.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'scaleafrique-chat'));
</script>`;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">Embed code</p>
        <button onClick={() => { navigator.clipboard.writeText(code); toast.success('Copied!'); }} className="flex items-center gap-1.5 text-xs text-primary-600 hover:underline"><Copy size={12} />Copy</button>
      </div>
      <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-xl overflow-x-auto whitespace-pre-wrap">{code}</pre>
      <p className="text-xs text-gray-400 mt-2">Or embed directly as an iframe: <span className="font-mono">{origin}/widget/{bot.id}</span></p>
    </div>
  );
}

// ─── Bot Editor ────────────────────────────────────────────────────────────

function BotEditor({ bot, onBack, onViewSessions }: { bot: Chatbot; onBack: () => void; onViewSessions: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: bot.name, persona: bot.persona, greeting: bot.greeting, systemPrompt: bot.systemPrompt, primaryColor: bot.primaryColor });
  const [tab, setTab] = useState<'config' | 'embed' | 'preview'>('config');

  // Local chat preview state
  const [previewMessages, setPreviewMessages] = useState<{ role: 'user' | 'assistant'; content: string; streaming?: boolean }[]>([{ role: 'assistant', content: form.greeting }]);
  const [previewInput, setPreviewInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: () => chatbotService.update(bot.id, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['chatbots'] }); toast.success('Saved'); },
    onError: () => toast.error('Failed to save'),
  });

  const toggleMutation = useMutation({
    mutationFn: () => chatbotService.update(bot.id, { isActive: !bot.isActive }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['chatbots'] }); },
  });

  const sendPreview = async () => {
    if (!previewInput.trim() || chatLoading) return;
    const msg = previewInput.trim();
    setPreviewInput('');
    setPreviewMessages(p => [...p, { role: 'user', content: msg }]);
    setChatLoading(true);
    setPreviewMessages(p => [...p, { role: 'assistant', content: '', streaming: true }]);
    try {
      const response = await fetch(`/api/v1/public/chatbots/${bot.id}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId: 'preview-user', message: msg }),
      });
      if (!response.ok || !response.body) throw new Error();
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n'); buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') break;
          try {
            const { token } = JSON.parse(payload);
            setPreviewMessages(p => { const c = [...p]; c[c.length - 1] = { ...c[c.length - 1], content: c[c.length - 1].content + token }; return c; });
          } catch { /* ignore */ }
        }
      }
      setPreviewMessages(p => { const c = [...p]; c[c.length - 1] = { ...c[c.length - 1], streaming: false }; return c; });
    } catch {
      setPreviewMessages(p => { const c = [...p]; c[c.length - 1] = { role: 'assistant', content: '(No API key — add ANTHROPIC_API_KEY to enable AI)' }; return c; });
    } finally { setChatLoading(false); }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"><ArrowLeft size={14} />All chatbots</button>
          <span className="text-gray-300">/</span>
          <h3 className="text-base font-semibold text-gray-900">{bot.name}</h3>
          <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', bot.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>{bot.isActive ? 'Active' : 'Inactive'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => toggleMutation.mutate()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">{bot.isActive ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}{bot.isActive ? 'Disable' : 'Enable'}</button>
          <Button size="sm" variant="outline" icon={<MessageSquare size={13} />} onClick={onViewSessions}>Sessions ({bot._count?.sessions ?? 0})</Button>
          <Button size="sm" loading={updateMutation.isPending} onClick={() => updateMutation.mutate()}>Save changes</Button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {(['config', 'embed', 'preview'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={clsx('px-4 py-2 text-sm font-medium capitalize transition-colors', tab === t ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-800')}>{t === 'embed' ? 'Embed Code' : t}</button>
        ))}
      </div>

      {tab === 'config' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="space-y-4">
            <CardTitle>Identity</CardTitle>
            <Input label="Bot name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Persona</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g. friendly sales assistant" value={form.persona} onChange={e => setForm(p => ({ ...p, persona: e.target.value }))} />
            </div>
            <Input label="Greeting message" value={form.greeting} onChange={e => setForm(p => ({ ...p, greeting: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Widget color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.primaryColor} onChange={e => setForm(p => ({ ...p, primaryColor: e.target.value }))} className="h-9 w-20 rounded border border-gray-300 cursor-pointer" />
                <span className="text-sm text-gray-500 font-mono">{form.primaryColor}</span>
              </div>
            </div>
          </Card>
          <Card className="space-y-3">
            <CardTitle>System Prompt</CardTitle>
            <p className="text-xs text-gray-500">Tell the bot what it knows, how to behave, and what topics to handle. Be specific about your business.</p>
            <textarea rows={10} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" placeholder="You are a helpful assistant for [Your Company]. You help customers with pricing, product info, and general questions. Always be polite and professional..." value={form.systemPrompt} onChange={e => setForm(p => ({ ...p, systemPrompt: e.target.value }))} />
          </Card>
        </div>
      )}

      {tab === 'embed' && (
        <Card><EmbedCode bot={bot} /></Card>
      )}

      {tab === 'preview' && (
        <div className="flex justify-center">
          <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col" style={{ height: 520 }}>
            <div className="px-4 py-3 flex items-center gap-2 text-white" style={{ backgroundColor: form.primaryColor }}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><Bot size={16} /></div>
              <span className="font-semibold text-sm">{form.name}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
              {previewMessages.map((m, i) => (
                <div key={i} className={clsx('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={clsx('max-w-[75%] px-3 py-2 rounded-2xl text-sm', m.role === 'user' ? 'text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm shadow-sm')} style={m.role === 'user' ? { backgroundColor: form.primaryColor } : {}}>
                    {m.content}
                    {m.streaming && <span className="inline-block w-1.5 h-3 bg-gray-400 ml-0.5 animate-pulse rounded-sm" />}
                  </div>
                </div>
              ))}
              {chatLoading && previewMessages[previewMessages.length - 1]?.content === '' && (
                <div className="flex justify-start"><div className="bg-white px-3 py-2 rounded-2xl shadow-sm flex gap-1">{[0,150,300].map(d=><span key={d} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{animationDelay:`${d}ms`}}/>)}</div></div>
              )}
            </div>
            <div className="p-2 border-t border-gray-100 flex gap-2">
              <input className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" placeholder="Type a message…" value={previewInput} onChange={e => setPreviewInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendPreview()} />
              <button onClick={sendPreview} disabled={chatLoading} className="px-3 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50" style={{ backgroundColor: form.primaryColor }}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Chatbots Page ────────────────────────────────────────────────────

export function Chatbots() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Chatbot | null>(null);
  const [viewingSessions, setViewingSessions] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', persona: 'friendly and helpful assistant', greeting: "Hi! How can I help you today?", systemPrompt: '', primaryColor: '#6366f1' });

  const { data: bots, isLoading } = useQuery({
    queryKey: ['chatbots'], queryFn: () => chatbotService.list(), staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: () => chatbotService.create(form),
    onSuccess: bot => {
      qc.invalidateQueries({ queryKey: ['chatbots'] });
      toast.success('Chatbot created');
      setShowCreate(false);
      setEditing(bot);
    },
    onError: () => toast.error('Failed to create'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => chatbotService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['chatbots'] }); toast.success('Deleted'); },
  });

  if (editing && viewingSessions) return <SessionLog bot={editing} onBack={() => setViewingSessions(false)} />;
  if (editing) return <BotEditor bot={editing} onBack={() => { setEditing(null); qc.invalidateQueries({ queryKey: ['chatbots'] }); }} onViewSessions={() => setViewingSessions(true)} />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">AI Chatbots</h2>
          <p className="text-sm text-gray-500">Build and embed AI-powered chat widgets on any website</p>
        </div>
        <Button icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>New chatbot</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" className="text-primary-600" /></div>
      ) : !bots?.length ? (
        <Card className="text-center py-14">
          <p className="text-4xl mb-3">🤖</p>
          <p className="text-base font-semibold text-gray-900 mb-1">Create your first chatbot</p>
          <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">Embed an AI assistant on your website. Conversations are logged and contacts saved to your CRM automatically.</p>
          <Button icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>Create chatbot</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bots.map((bot: Chatbot) => (
            <div key={bot.id} className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-primary-300 hover:shadow-md transition-all group cursor-pointer" onClick={() => setEditing(bot)}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: bot.primaryColor }}>
                  <Bot size={20} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', bot.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>{bot.isActive ? 'Active' : 'Off'}</span>
                  <button onClick={e => { e.stopPropagation(); if (confirm('Delete this chatbot?')) deleteMutation.mutate(bot.id); }} className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={13} /></button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{bot.name}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2 italic">"{bot.greeting}"</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span><MessageSquare size={10} className="inline mr-0.5" />{bot._count?.sessions ?? 0} conversations</span>
                <span className="flex items-center gap-1"><Code size={10} />Embeddable</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Create Chatbot</h3>
            <div className="space-y-3">
              <Input label="Bot name" placeholder="e.g. Sales Assistant, Support Bot" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              <Input label="Greeting" value={form.greeting} onChange={e => setForm(p => ({ ...p, greeting: e.target.value }))} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">System prompt <span className="text-red-500">*</span></label>
                <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="You are a helpful assistant for [Company]. You help customers with..." value={form.systemPrompt} onChange={e => setForm(p => ({ ...p, systemPrompt: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button className="flex-1" loading={createMutation.isPending} onClick={() => { if (form.name && form.systemPrompt) createMutation.mutate(); }}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
