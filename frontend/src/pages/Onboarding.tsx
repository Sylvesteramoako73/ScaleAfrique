'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { INDUSTRIES, GROWTH_STAGES, AFRICAN_COUNTRIES, MARKETING_CHANNELS, BUDGET_RANGES } from '../utils/constants';

const STEPS = ['Company', 'Industry', 'Stage', 'Region', 'Goals'];

export function Onboarding() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    companyName: '',
    industry: '',
    growthStage: '',
    country: 'GH',
    region: '',
    monthlyBudget: '',
    channels: [] as string[],
    targetAudience: '',
  });

  const set = (key: keyof typeof form, value: unknown) =>
    setForm(f => ({ ...f, [key]: value }));

  const toggleChannel = (ch: string) =>
    set('channels', form.channels.includes(ch)
      ? form.channels.filter(c => c !== ch)
      : [...form.channels, ch]);

  const canNext = [
    form.companyName.trim().length > 1,
    !!form.industry,
    !!form.growthStage,
    !!form.country,
    form.channels.length > 0,
  ][step];

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { data } = await api.post<{ success: boolean; data: { startupProfile: unknown } }>('/users/onboarding', form);
      if (user) setUser({ ...user, startupProfile: data.data.startupProfile as never });
      toast.success('Profile set up! Generating your strategy...');
      router.push('/dashboard');
    } catch {
      toast.error('Could not save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="flex justify-center mb-8">
          <Logo size={38} textColor="text-white" />
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                i < step ? 'bg-primary-500 text-white' :
                i === step ? 'bg-white text-primary-700 ring-2 ring-primary-400' :
                'bg-white/20 text-white/50'
              )}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={clsx('h-0.5 w-8 rounded', i < step ? 'bg-primary-400' : 'bg-white/20')} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Step 0: Company */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">What's your company called?</h2>
              <p className="text-sm text-gray-500">Tell us your startup or business name.</p>
              <Input
                label="Company name"
                placeholder="e.g. Kofi Tech Solutions"
                value={form.companyName}
                onChange={e => set('companyName', e.target.value)}
                autoFocus
              />
              <Input
                label="What do you do? (optional)"
                placeholder="e.g. We provide mobile payment solutions for SMEs"
                value={form.targetAudience}
                onChange={e => set('targetAudience', e.target.value)}
              />
            </div>
          )}

          {/* Step 1: Industry */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">What's your industry?</h2>
              <p className="text-sm text-gray-500">We'll tailor insights to your sector.</p>
              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {INDUSTRIES.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    onClick={() => set('industry', value)}
                    className={clsx(
                      'flex items-center gap-2 p-3 rounded-xl border-2 text-sm text-left transition-all',
                      form.industry === value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    )}
                  >
                    <span className="text-xl">{icon}</span>
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Growth stage */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">What stage are you at?</h2>
              <p className="text-sm text-gray-500">We'll match strategies to your growth phase.</p>
              <div className="space-y-2">
                {GROWTH_STAGES.map(({ value, label, description }) => (
                  <button
                    key={value}
                    onClick={() => set('growthStage', value)}
                    className={clsx(
                      'w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all',
                      form.growthStage === value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className={clsx(
                      'w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center',
                      form.growthStage === value ? 'border-primary-500' : 'border-gray-300'
                    )}>
                      {form.growthStage === value && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Region */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Where are you based?</h2>
              <p className="text-sm text-gray-500">We'll surface hyper-local market insights for your area.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  value={form.country}
                  onChange={e => set('country', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {AFRICAN_COUNTRIES.map(({ code, name, flag }) => (
                    <option key={code} value={code}>{flag} {name}</option>
                  ))}
                </select>
              </div>
              <Input
                label="City / Region (optional)"
                placeholder="e.g. Accra, Greater Accra"
                value={form.region}
                onChange={e => set('region', e.target.value)}
              />
            </div>
          )}

          {/* Step 4: Goals & budget */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Your marketing goals</h2>
              <p className="text-sm text-gray-500">Select the channels you want to focus on.</p>
              <div className="grid grid-cols-2 gap-2">
                {MARKETING_CHANNELS.map(ch => (
                  <button
                    key={ch}
                    onClick={() => toggleChannel(ch)}
                    className={clsx(
                      'px-3 py-2 rounded-lg border text-xs font-medium text-left transition-all',
                      form.channels.includes(ch)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    )}
                  >
                    {ch}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly marketing budget</label>
                <select
                  value={form.monthlyBudget}
                  onChange={e => set('monthlyBudget', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a range</option>
                  {BUDGET_RANGES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              icon={<ChevronLeft size={16} />}
            >
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext}
                iconRight={<ChevronRight size={16} />}
              >
                Continue
              </Button>
            ) : (
              <Button onClick={handleFinish} loading={loading} disabled={!canNext}>
                Launch my dashboard 🚀
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-white/50 mt-4">
          You can update these details anytime in Settings
        </p>
      </div>
    </div>
  );
}
