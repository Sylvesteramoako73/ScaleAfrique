'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Sparkles, Check } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { useCreateCampaign } from '../hooks/useCampaigns';
import { aiService } from '../services/ai.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { CAMPAIGN_TYPES, SOCIAL_PLATFORMS, AFRICAN_COUNTRIES, BUDGET_RANGES } from '../utils/constants';
import type { CampaignFormData, CampaignType } from '../types';

const STEPS = ['Basics', 'Audience', 'Content', 'Channels', 'Budget', 'Review'];

const OBJECTIVES = [
  { value: 'brand_awareness', label: 'Brand Awareness', emoji: '📣' },
  { value: 'lead_generation', label: 'Lead Generation', emoji: '🎯' },
  { value: 'sales_conversion', label: 'Sales / Conversion', emoji: '💰' },
  { value: 'customer_retention', label: 'Customer Retention', emoji: '♻️' },
  { value: 'app_installs', label: 'App Installs', emoji: '📱' },
  { value: 'website_traffic', label: 'Website Traffic', emoji: '🌐' },
];

export function CampaignBuilder() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const isEdit = !!id;
  const [step, setStep] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);

  const { mutateAsync: createCampaign, isPending } = useCreateCampaign();

  const [form, setForm] = useState<CampaignFormData & { emailBody?: string; socialCaption?: string }>({
    name: '',
    type: 'EMAIL',
    objective: '',
    description: '',
    channels: [],
    budget: undefined,
    startDate: '',
    endDate: '',
    targeting: { countries: ['GH'], ageMin: 18, ageMax: 45, interests: [] },
    content: {},
    emailBody: '',
    socialCaption: '',
  });

  const set = (key: keyof typeof form, value: unknown) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleAIGenerate = async () => {
    if (!form.objective) { toast.error('Select an objective first'); return; }
    setAiLoading(true);
    try {
      const { content } = await aiService.generateContent(
        form.type,
        `Campaign for ${form.name || 'my startup'}, objective: ${form.objective}, targeting: Ghana and West Africa`
      );
      set('emailBody', content);
      set('socialCaption', content);
      toast.success('AI content generated!');
    } catch {
      toast.error('AI generation failed. Try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload: CampaignFormData = {
        ...form,
        content: { body: form.emailBody, caption: form.socialCaption },
      };
      await createCampaign(payload);
      router.push('/campaigns');
    } catch {
      // error handled in hook
    }
  };

  const canNext = [
    form.name.trim().length > 1 && !!form.type && !!form.objective,
    true,
    true,
    form.channels.length > 0,
    true,
    true,
  ][step];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
          <ChevronLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Campaign' : 'New Campaign'}</h2>
          <p className="text-sm text-gray-500">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={clsx('h-1.5 flex-1 rounded-full transition-all', i <= step ? 'bg-primary-600' : 'bg-gray-200')}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2">
          <Card>
            {/* Step 0: Basics */}
            {step === 0 && (
              <div className="space-y-5">
                <h3 className="font-semibold text-gray-900">Campaign Basics</h3>
                <Input
                  label="Campaign name"
                  placeholder="e.g. Ramadan Sale — WhatsApp Campaign"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CAMPAIGN_TYPES.map(({ value, label, icon }) => (
                      <button
                        key={value}
                        onClick={() => set('type', value as CampaignType)}
                        className={clsx(
                          'flex items-center gap-2 p-3 rounded-xl border-2 text-sm text-left transition-all',
                          form.type === value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <span className="text-xl">{icon}</span>
                        <span className="font-medium text-gray-800">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Objective</label>
                  <div className="grid grid-cols-2 gap-2">
                    {OBJECTIVES.map(({ value, label, emoji }) => (
                      <button
                        key={value}
                        onClick={() => set('objective', value)}
                        className={clsx(
                          'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left transition-all',
                          form.objective === value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        )}
                      >
                        <span>{emoji}</span> {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Audience */}
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="font-semibold text-gray-900">Target Audience</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target countries</label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {AFRICAN_COUNTRIES.map(({ code, name, flag }) => {
                      const selected = ((form.targeting as { countries?: string[] })?.countries ?? []).includes(code);
                      return (
                        <button
                          key={code}
                          onClick={() => {
                            const current = ((form.targeting as { countries?: string[] })?.countries ?? []);
                            set('targeting', {
                              ...(form.targeting ?? {}),
                              countries: selected ? current.filter(c => c !== code) : [...current, code],
                            });
                          }}
                          className={clsx(
                            'flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs transition-all',
                            selected ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          )}
                        >
                          <span>{flag}</span> {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Min age"
                    type="number"
                    value={(form.targeting as { ageMin?: number })?.ageMin ?? 18}
                    onChange={e => set('targeting', { ...(form.targeting ?? {}), ageMin: +e.target.value })}
                  />
                  <Input
                    label="Max age"
                    type="number"
                    value={(form.targeting as { ageMax?: number })?.ageMax ?? 45}
                    onChange={e => set('targeting', { ...(form.targeting ?? {}), ageMax: +e.target.value })}
                  />
                </div>
                <Input
                  label="Interests (comma separated)"
                  placeholder="e.g. fintech, mobile payments, SMEs"
                  onChange={e => set('targeting', {
                    ...(form.targeting ?? {}),
                    interests: e.target.value.split(',').map(s => s.trim()),
                  })}
                />
              </div>
            )}

            {/* Step 2: Content */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Content</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Sparkles size={14} className="text-amber-500" />}
                    loading={aiLoading}
                    onClick={handleAIGenerate}
                  >
                    AI Generate
                  </Button>
                </div>
                {(form.type === 'EMAIL' || form.type === 'MULTI_CHANNEL') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email body</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[140px] resize-y"
                      placeholder="Write your email content, or click AI Generate..."
                      value={form.emailBody}
                      onChange={e => set('emailBody', e.target.value)}
                    />
                  </div>
                )}
                {(form.type === 'SOCIAL' || form.type === 'MULTI_CHANNEL') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Social caption</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px] resize-y"
                      placeholder="Your post caption..."
                      value={form.socialCaption}
                      onChange={e => set('socialCaption', e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Channels */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Channels & Scheduling</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select channels</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SOCIAL_PLATFORMS.map(({ value, label, color }) => {
                      const selected = form.channels.includes(value);
                      return (
                        <button
                          key={value}
                          onClick={() => set('channels', selected
                            ? form.channels.filter(c => c !== value)
                            : [...form.channels, value]
                          )}
                          className={clsx(
                            'flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm transition-all',
                            selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-gray-800 font-medium">{label}</span>
                          {selected && <Check size={14} className="ml-auto text-primary-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Start date"
                    type="date"
                    value={form.startDate}
                    onChange={e => set('startDate', e.target.value)}
                  />
                  <Input
                    label="End date"
                    type="date"
                    value={form.endDate}
                    onChange={e => set('endDate', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Budget */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Budget</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget range</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onChange={e => {
                      const [min] = e.target.value.split('-');
                      set('budget', +min);
                    }}
                  >
                    <option value="">Select budget</option>
                    {BUDGET_RANGES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Custom budget (USD)"
                  type="number"
                  placeholder="e.g. 1500"
                  value={form.budget ?? ''}
                  onChange={e => set('budget', +e.target.value)}
                />
              </div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Review & Launch</h3>
                {[
                  { label: 'Name', value: form.name },
                  { label: 'Type', value: form.type },
                  { label: 'Objective', value: form.objective },
                  { label: 'Channels', value: form.channels.join(', ') || '—' },
                  { label: 'Budget', value: form.budget ? `$${form.budget}` : '—' },
                  { label: 'Start', value: form.startDate || '—' },
                  { label: 'End', value: form.endDate || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-2 text-sm">
                    <span className="w-24 font-medium text-gray-500">{label}</span>
                    <span className="text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-5 border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
                icon={<ChevronLeft size={16} />}
              >
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep(s => s + 1)} disabled={!canNext} iconRight={<ChevronRight size={16} />}>
                  Continue
                </Button>
              ) : (
                <Button onClick={handleSubmit} loading={isPending}>
                  Launch Campaign 🚀
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* AI suggestions panel */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={15} className="text-amber-500" />
              <h4 className="text-sm font-semibold text-gray-900">AI Tips</h4>
            </div>
            <div className="space-y-2.5 text-xs text-gray-600 leading-relaxed">
              <p>• WhatsApp has the highest open rates in Ghana — consider it as your primary channel.</p>
              <p>• Campaigns targeting ages 25–40 in Accra see 2× better conversion for B2C brands.</p>
              <p>• Post between 7–9 PM WAT for maximum social media reach in West Africa.</p>
              <p>• Localising copy in Twi can increase CTR by up to 35% for Ghanaian audiences.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
