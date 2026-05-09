'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Trash2, Globe, EyeOff, ChevronUp, ChevronDown,
  Type, Image, AlignLeft, MousePointer, Minus, FormInput,
  ArrowLeft, Users, Copy, ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { v4 as uuid } from 'uuid';
import { funnelService, type Funnel, type FunnelPage, type Block, type BlockType } from '../services/funnel.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';

// ─── Block Icons & Labels ───────────────────────────────────────────────────

const BLOCK_PALETTE: { type: BlockType; label: string; icon: React.ReactNode; default: Partial<Block> }[] = [
  { type: 'hero', label: 'Hero', icon: <Type size={14} />, default: { title: 'Your Headline Here', subtitle: 'A compelling subheadline that converts.', bgColor: '#1a1a2e', textColor: '#ffffff' } },
  { type: 'text', label: 'Text', icon: <AlignLeft size={14} />, default: { content: 'Add your body copy here.', align: 'left' } },
  { type: 'image', label: 'Image', icon: <Image size={14} />, default: { url: '', alt: 'Image' } },
  { type: 'form', label: 'Form', icon: <FormInput size={14} />, default: { fields: [{ name: 'name', label: 'Full Name', type: 'text', required: true }, { name: 'email', label: 'Email Address', type: 'email', required: true }], submitLabel: 'Submit', successMessage: "Thanks! We'll be in touch." } },
  { type: 'cta', label: 'CTA Button', icon: <MousePointer size={14} />, default: { label: 'Get Started', href: '#', style: 'primary' } },
  { type: 'spacer', label: 'Spacer', icon: <Minus size={14} />, default: { height: 40 } },
];

// ─── Block Renderer (preview + public) ────────────────────────────────────

export function BlockRenderer({ block, onSubmit }: { block: Block; onSubmit?: (data: Record<string, string>) => void }) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (block.type === 'hero') return (
    <div className="py-16 px-8 text-center" style={{ backgroundColor: block.bgColor ?? '#1a1a2e', color: block.textColor ?? '#fff' }}>
      <h1 className="text-4xl font-bold mb-4">{block.title}</h1>
      {block.subtitle && <p className="text-lg opacity-80 max-w-xl mx-auto">{block.subtitle}</p>}
    </div>
  );

  if (block.type === 'text') return (
    <div className={clsx('px-8 py-6 max-w-2xl mx-auto', block.align === 'center' ? 'text-center' : block.align === 'right' ? 'text-right' : 'text-left')}>
      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{block.content}</p>
    </div>
  );

  if (block.type === 'image') return (
    <div className="px-8 py-4 flex justify-center">
      {block.url ? <img src={block.url} alt={block.alt ?? ''} className="max-w-full rounded-xl shadow" /> : <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">No image URL set</div>}
    </div>
  );

  if (block.type === 'form') {
    if (submitted) return (
      <div className="px-8 py-10 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <p className="text-lg font-semibold text-gray-900">{block.successMessage ?? "You're in!"}</p>
      </div>
    );
    return (
      <div className="px-8 py-6 max-w-md mx-auto">
        <div className="space-y-3">
          {(block.fields ?? []).map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}</label>
              {f.type === 'textarea' ? (
                <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData[f.name] ?? ''} onChange={e => setFormData(p => ({ ...p, [f.name]: e.target.value }))} />
              ) : (
                <input type={f.type} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData[f.name] ?? ''} onChange={e => setFormData(p => ({ ...p, [f.name]: e.target.value }))} />
              )}
            </div>
          ))}
        </div>
        <button
          className="mt-4 w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
          onClick={() => { if (onSubmit) { onSubmit(formData); setSubmitted(true); } }}
        >{block.submitLabel ?? 'Submit'}</button>
      </div>
    );
  }

  if (block.type === 'cta') return (
    <div className="px-8 py-6 flex justify-center">
      <a href={block.href ?? '#'} className={clsx('px-8 py-3 rounded-xl font-semibold text-sm transition-colors', block.style === 'secondary' ? 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50' : 'bg-primary-600 hover:bg-primary-700 text-white')}>
        {block.label ?? 'Click Here'}
      </a>
    </div>
  );

  if (block.type === 'spacer') return <div style={{ height: block.height ?? 40 }} />;

  return null;
}

// ─── Block Editor ──────────────────────────────────────────────────────────

function BlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  const set = (patch: Partial<Block>) => onChange({ ...block, ...patch });

  return (
    <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {block.type === 'hero' && <>
        <Input label="Title" value={block.title ?? ''} onChange={e => set({ title: e.target.value })} />
        <Input label="Subtitle" value={block.subtitle ?? ''} onChange={e => set({ subtitle: e.target.value })} />
        <div className="flex gap-3">
          <div className="flex-1"><label className="block text-xs font-medium text-gray-600 mb-1">Background</label><input type="color" value={block.bgColor ?? '#1a1a2e'} onChange={e => set({ bgColor: e.target.value })} className="w-full h-9 rounded cursor-pointer border border-gray-300" /></div>
          <div className="flex-1"><label className="block text-xs font-medium text-gray-600 mb-1">Text Color</label><input type="color" value={block.textColor ?? '#ffffff'} onChange={e => set({ textColor: e.target.value })} className="w-full h-9 rounded cursor-pointer border border-gray-300" /></div>
        </div>
      </>}

      {block.type === 'text' && <>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Content</label><textarea rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={block.content ?? ''} onChange={e => set({ content: e.target.value })} /></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Align</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={block.align ?? 'left'} onChange={e => set({ align: e.target.value as Block['align'] })}>
            <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
          </select>
        </div>
      </>}

      {block.type === 'image' && <>
        <Input label="Image URL" placeholder="https://..." value={block.url ?? ''} onChange={e => set({ url: e.target.value })} />
        <Input label="Alt text" value={block.alt ?? ''} onChange={e => set({ alt: e.target.value })} />
      </>}

      {block.type === 'form' && <>
        <Input label="Submit button label" value={block.submitLabel ?? 'Submit'} onChange={e => set({ submitLabel: e.target.value })} />
        <Input label="Success message" value={block.successMessage ?? ''} onChange={e => set({ successMessage: e.target.value })} />
        <p className="text-xs text-gray-500">Fields: {(block.fields ?? []).map(f => f.label).join(', ')}</p>
      </>}

      {block.type === 'cta' && <>
        <Input label="Button label" value={block.label ?? ''} onChange={e => set({ label: e.target.value })} />
        <Input label="Link URL" placeholder="https://..." value={block.href ?? ''} onChange={e => set({ href: e.target.value })} />
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Style</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={block.style ?? 'primary'} onChange={e => set({ style: e.target.value as 'primary' | 'secondary' })}>
            <option value="primary">Primary (filled)</option><option value="secondary">Secondary (outline)</option>
          </select>
        </div>
      </>}

      {block.type === 'spacer' && (
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Height (px)</label>
          <input type="number" min={8} max={200} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={block.height ?? 40} onChange={e => set({ height: Number(e.target.value) })} />
        </div>
      )}
    </div>
  );
}

// ─── Funnel Editor ─────────────────────────────────────────────────────────

function FunnelEditor({ funnel, onBack }: { funnel: Funnel; onBack: () => void }) {
  const qc = useQueryClient();
  const [activePage, setActivePage] = useState<FunnelPage | null>(funnel.pages?.[0] ?? null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const { data: fresh } = useQuery({
    queryKey: ['funnels', funnel.id],
    queryFn: () => funnelService.get(funnel.id),
    initialData: funnel,
    staleTime: 0,
  });

  const currentFunnel = fresh ?? funnel;
  const pages = currentFunnel.pages ?? [];
  const page = activePage ? pages.find(p => p.id === activePage.id) ?? activePage : pages[0] ?? null;

  const publishMutation = useMutation({
    mutationFn: () => currentFunnel.status === 'PUBLISHED' ? funnelService.unpublish(funnel.id) : funnelService.publish(funnel.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['funnels'] }); toast.success(currentFunnel.status === 'PUBLISHED' ? 'Unpublished' : 'Published!'); },
  });

  const addPageMutation = useMutation({
    mutationFn: () => funnelService.addPage(funnel.id, `Page ${pages.length + 1}`),
    onSuccess: p => { qc.invalidateQueries({ queryKey: ['funnels', funnel.id] }); setActivePage(p); },
  });

  const saveBlocks = useCallback(async (updatedPage: FunnelPage) => {
    setSaving(true);
    try {
      await funnelService.savePage(funnel.id, updatedPage);
      qc.invalidateQueries({ queryKey: ['funnels', funnel.id] });
    } finally { setSaving(false); }
  }, [funnel.id, qc]);

  const updateBlock = (blockId: string, updated: Block) => {
    if (!page) return;
    const updatedPage = { ...page, blocks: page.blocks.map(b => b.id === blockId ? updated : b) };
    setActivePage(updatedPage);
  };

  const addBlock = (type: BlockType) => {
    if (!page) return;
    const palette = BLOCK_PALETTE.find(p => p.type === type)!;
    const newBlock: Block = { id: uuid(), type, ...palette.default } as Block;
    const updatedPage = { ...page, blocks: [...page.blocks, newBlock] };
    setActivePage(updatedPage);
    setSelectedBlockId(newBlock.id);
    saveBlocks(updatedPage);
  };

  const removeBlock = (blockId: string) => {
    if (!page) return;
    const updatedPage = { ...page, blocks: page.blocks.filter(b => b.id !== blockId) };
    setActivePage(updatedPage);
    if (selectedBlockId === blockId) setSelectedBlockId(null);
    saveBlocks(updatedPage);
  };

  const moveBlock = (blockId: string, dir: -1 | 1) => {
    if (!page) return;
    const idx = page.blocks.findIndex(b => b.id === blockId);
    if (idx + dir < 0 || idx + dir >= page.blocks.length) return;
    const blocks = [...page.blocks];
    [blocks[idx], blocks[idx + dir]] = [blocks[idx + dir], blocks[idx]];
    const updatedPage = { ...page, blocks };
    setActivePage(updatedPage);
    saveBlocks(updatedPage);
  };

  const handleBlockChange = (blockId: string, updated: Block) => {
    updateBlock(blockId, updated);
    if (!page) return;
    const updatedPage = { ...page, blocks: page.blocks.map(b => b.id === blockId ? updated : b) };
    saveBlocks(updatedPage);
  };

  const selectedBlock = page?.blocks.find(b => b.id === selectedBlockId);

  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/f/${currentFunnel.slug}`;

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Left: pages + block palette */}
      <div className="w-52 shrink-0 flex flex-col border-r border-gray-100 bg-gray-50">
        <div className="p-3 border-b border-gray-100">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 mb-2"><ArrowLeft size={13} />All funnels</button>
          <p className="text-sm font-semibold text-gray-900 truncate">{currentFunnel.name}</p>
          <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', currentFunnel.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600')}>{currentFunnel.status}</span>
        </div>

        <div className="p-2 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-1.5">Pages</p>
          {pages.map(p => (
            <button key={p.id} onClick={() => { setActivePage(p); setSelectedBlockId(null); }} className={clsx('w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors', page?.id === p.id ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-200')}>
              {p.name}
            </button>
          ))}
          <button onClick={() => addPageMutation.mutate()} className="w-full mt-1 flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"><Plus size={11} />Add page</button>
        </div>

        <div className="p-2 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-1.5">Add block</p>
          {BLOCK_PALETTE.map(item => (
            <button key={item.type} onClick={() => addBlock(item.type)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors">
              {item.icon}<span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Center: canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setPreview(p => !p)} className={clsx('flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors', preview ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-600 hover:border-gray-400')}>
              {preview ? <EyeOff size={13} /> : <Globe size={13} />}{preview ? 'Edit mode' : 'Preview'}
            </button>
            {saving && <span className="text-xs text-gray-400">Saving…</span>}
          </div>
          <div className="flex items-center gap-2">
            {currentFunnel.status === 'PUBLISHED' && (
              <a href={publicUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-primary-600 hover:underline"><ExternalLink size={12} />View live</a>
            )}
            <Button size="sm" icon={currentFunnel.status === 'PUBLISHED' ? <EyeOff size={13} /> : <Globe size={13} />} loading={publishMutation.isPending} onClick={() => publishMutation.mutate()}>
              {currentFunnel.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden min-h-96">
            {!page ? (
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No pages yet</div>
            ) : page.blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <p className="text-sm mb-2">This page is empty</p>
                <p className="text-xs">Add blocks from the left panel</p>
              </div>
            ) : (
              page.blocks.map((block, i) => (
                <div key={block.id} className={clsx('relative group', !preview && 'cursor-pointer', !preview && selectedBlockId === block.id && 'ring-2 ring-primary-400 ring-inset')} onClick={() => !preview && setSelectedBlockId(block.id === selectedBlockId ? null : block.id)}>
                  <BlockRenderer block={block} />
                  {!preview && (
                    <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1 bg-white rounded-lg shadow-md border border-gray-100 p-1">
                      <button onClick={e => { e.stopPropagation(); moveBlock(block.id, -1); }} disabled={i === 0} className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronUp size={13} /></button>
                      <button onClick={e => { e.stopPropagation(); moveBlock(block.id, 1); }} disabled={i === page.blocks.length - 1} className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronDown size={13} /></button>
                      <button onClick={e => { e.stopPropagation(); removeBlock(block.id); }} className="p-1 rounded text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right: block editor */}
      {!preview && (
        <div className="w-64 shrink-0 border-l border-gray-100 overflow-y-auto p-3 bg-white">
          {selectedBlock ? (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Edit: {selectedBlock.type}</p>
              <BlockEditor block={selectedBlock} onChange={b => handleBlockChange(selectedBlock.id, b)} />
            </>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <p className="text-xs">Click a block to edit it</p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Submissions</p>
            <a href={`/funnels/${currentFunnel.id}/submissions`} className="flex items-center gap-2 text-xs text-primary-600 hover:underline"><Users size={12} />View all submissions</a>
            <p className="text-xs text-gray-400 mt-1">Public URL:</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-600 truncate flex-1">/f/{currentFunnel.slug}</span>
              <button onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success('Copied!'); }} className="p-1 rounded text-gray-400 hover:text-gray-700"><Copy size={11} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Funnel List ───────────────────────────────────────────────────────────

export function FunnelBuilder() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Funnel | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const { data: funnels, isLoading } = useQuery({
    queryKey: ['funnels'], queryFn: () => funnelService.list(), staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: () => funnelService.create(newName.trim(), newDesc.trim() || undefined),
    onSuccess: f => {
      qc.invalidateQueries({ queryKey: ['funnels'] });
      toast.success('Funnel created');
      setShowCreate(false); setNewName(''); setNewDesc('');
      setEditing(f);
    },
    onError: () => toast.error('Failed to create funnel'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => funnelService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['funnels'] }); toast.success('Deleted'); },
    onError: () => toast.error('Failed to delete'),
  });

  if (editing) return <FunnelEditor funnel={editing} onBack={() => { setEditing(null); qc.invalidateQueries({ queryKey: ['funnels'] }); }} />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Funnel Builder</h2>
          <p className="text-sm text-gray-500">Build landing pages that capture leads directly into your CRM</p>
        </div>
        <Button icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>New funnel</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" className="text-primary-600" /></div>
      ) : !funnels?.length ? (
        <Card className="text-center py-14">
          <p className="text-4xl mb-3">🚀</p>
          <p className="text-base font-semibold text-gray-900 mb-1">Create your first funnel</p>
          <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">Build beautiful landing pages with lead capture forms. Submissions go straight into your CRM.</p>
          <Button icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>Create funnel</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {funnels.map((f: Funnel) => (
            <div key={f.id} className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-primary-300 hover:shadow-md transition-all group cursor-pointer" onClick={() => setEditing(f)}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">{f.name[0]}</div>
                <div className="flex items-center gap-2">
                  <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', f.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>{f.status}</span>
                  <button onClick={e => { e.stopPropagation(); if (confirm('Delete this funnel?')) deleteMutation.mutate(f.id); }} className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={13} /></button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.name}</h3>
              {f.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{f.description}</p>}
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{f._count?.pages ?? 0} page{(f._count?.pages ?? 0) !== 1 ? 's' : ''}</span>
                <span>·</span>
                <span><Users size={10} className="inline mr-0.5" />{f._count?.submissions ?? 0} leads</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Create Funnel</h3>
            <div className="space-y-3">
              <Input label="Funnel name" placeholder="e.g. Free Ebook Download" value={newName} onChange={e => setNewName(e.target.value)} />
              <Input label="Description (optional)" placeholder="What is this funnel for?" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button className="flex-1" loading={createMutation.isPending} onClick={() => { if (newName.trim()) createMutation.mutate(); }}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
