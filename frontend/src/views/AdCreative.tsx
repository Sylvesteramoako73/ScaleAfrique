'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Trash2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { adCreativeService, type AdCreative, type AdVariation } from '../services/adcreative.service';

const PLATFORMS = ['Facebook', 'Instagram', 'Twitter/X', 'Google', 'TikTok', 'Email'];
const TONES = ['professional', 'friendly', 'urgent', 'inspirational'];

const platformColors: Record<string, string> = {
  Facebook: 'bg-blue-100 text-blue-700',
  Instagram: 'bg-pink-100 text-pink-700',
  'Twitter/X': 'bg-sky-100 text-sky-700',
  Google: 'bg-yellow-100 text-yellow-700',
  TikTok: 'bg-gray-900 text-white',
  Email: 'bg-green-100 text-green-700',
};

function VariationCard({ v, index }: { v: AdVariation; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700"
      >
        <span>Variation {index + 1}: {v.headline}</span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && (
        <div className="p-4 space-y-3 text-sm">
          {v.hook && <div><span className="font-medium text-gray-500">Hook: </span><span>{v.hook}</span></div>}
          <div><span className="font-medium text-gray-500">Headline: </span><span>{v.headline}</span></div>
          <div><span className="font-medium text-gray-500">Body: </span><span>{v.body}</span></div>
          <div><span className="font-medium text-gray-500">CTA: </span>
            <span className="inline-block bg-primary-50 text-primary-700 px-2 py-0.5 rounded text-xs font-semibold">{v.cta}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SavedCreativeCard({ creative, onDelete }: { creative: AdCreative; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Card hover>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <button onClick={() => setOpen(!open)} className="w-full text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className={clsx('px-2 py-0.5 rounded text-xs font-semibold', platformColors[creative.platform] ?? 'bg-gray-100 text-gray-600')}>
                {creative.platform}
              </span>
              <span className="text-xs text-gray-400">{creative.variations.length} variations</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 truncate">{creative.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{creative.productName}</p>
          </button>
          {open && (
            <div className="mt-3 space-y-2">
              {creative.variations.map((v, i) => <VariationCard key={i} v={v} index={i} />)}
            </div>
          )}
        </div>
        <button onClick={onDelete} className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0">
          <Trash2 size={15} />
        </button>
      </div>
    </Card>
  );
}

export function AdCreative() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    platform: 'Facebook',
    productName: '',
    productDescription: '',
    targetAudience: '',
    tone: 'professional',
    count: 2,
  });
  const [generated, setGenerated] = useState<AdCreative | null>(null);

  const { data: creatives = [], isLoading } = useQuery<AdCreative[]>({
    queryKey: ['ad-creatives'],
    queryFn: adCreativeService.list,
  });

  const generate = useMutation({
    mutationFn: () => adCreativeService.generate({ ...form, count: form.count }),
    onSuccess: (data) => {
      setGenerated(data);
      qc.invalidateQueries({ queryKey: ['ad-creatives'] });
      toast.success('Creatives generated!');
    },
    onError: () => toast.error('Generation failed'),
  });

  const del = useMutation({
    mutationFn: (id: string) => adCreativeService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ad-creatives'] });
      toast.success('Deleted');
    },
  });

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ad Creative Generator</h1>
        <p className="text-sm text-gray-500 mt-1">Generate AI-powered ad copy for any platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — form */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Generate New Creative</CardTitle></CardHeader>
            <div className="space-y-3">
              <Input label="Creative Name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Summer Sale 2025" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={form.platform} onChange={(e) => set('platform', e.target.value)}>
                  {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <Input label="Product Name" value={form.productName} onChange={(e) => set('productName', e.target.value)} placeholder="e.g. AfriShop Pro" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Description</label>
                <textarea
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={3}
                  value={form.productDescription}
                  onChange={(e) => set('productDescription', e.target.value)}
                  placeholder="Describe your product..."
                />
              </div>
              <Input label="Target Audience" value={form.targetAudience} onChange={(e) => set('targetAudience', e.target.value)} placeholder="e.g. African entrepreneurs 25–40" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
                <select className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={form.tone} onChange={(e) => set('tone', e.target.value)}>
                  {TONES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Variations (1–5)</label>
                <input type="number" min={1} max={5} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={form.count} onChange={(e) => set('count', parseInt(e.target.value) || 1)} />
              </div>
              <Button
                fullWidth
                icon={<Sparkles size={15} />}
                loading={generate.isPending}
                disabled={!form.name || !form.productName || !form.productDescription}
                onClick={() => generate.mutate()}
              >
                Generate with AI
              </Button>
            </div>
          </Card>

          {/* Generated result */}
          {generated && (
            <Card>
              <CardHeader><CardTitle>Generated: {generated.name}</CardTitle></CardHeader>
              <div className="space-y-2">
                {generated.variations.map((v, i) => <VariationCard key={i} v={v} index={i} />)}
              </div>
            </Card>
          )}
        </div>

        {/* Right — saved */}
        <div>
          <Card padding={false}>
            <div className="p-5 border-b border-gray-100">
              <CardTitle>Saved Creatives ({creatives.length})</CardTitle>
            </div>
            {isLoading ? (
              <div className="flex justify-center p-8"><Spinner /></div>
            ) : creatives.length === 0 ? (
              <p className="text-center text-gray-400 py-12 text-sm">No saved creatives yet.</p>
            ) : (
              <div className="p-4 space-y-3 max-h-[700px] overflow-y-auto">
                {creatives.map((c) => (
                  <SavedCreativeCard key={c.id} creative={c} onDelete={() => del.mutate(c.id)} />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
