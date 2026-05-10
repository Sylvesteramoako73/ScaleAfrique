'use client';

import { useState } from 'react';
import { User, Bell, Link, CreditCard, Shield, Users, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { INDUSTRIES, GROWTH_STAGES, AFRICAN_COUNTRIES } from '../utils/constants';
import api from '../services/api';
import toast from 'react-hot-toast';

type Section = 'profile' | 'startup' | 'notifications' | 'integrations' | 'billing' | 'security' | 'team';

const SECTIONS: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: 'profile', label: 'Profile', icon: <User size={16} /> },
  { key: 'startup', label: 'Startup Profile', icon: <ChevronRight size={16} /> },
  { key: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { key: 'integrations', label: 'Integrations', icon: <Link size={16} /> },
  { key: 'billing', label: 'Billing', icon: <CreditCard size={16} /> },
  { key: 'security', label: 'Security', icon: <Shield size={16} /> },
  { key: 'team', label: 'Team', icon: <Users size={16} /> },
];

const PLANS = [
  { name: 'Starter', price: 0, features: ['3 campaigns/mo', 'Basic analytics', 'Community access'], current: false },
  { name: 'Growth', price: 29, features: ['Unlimited campaigns', 'Advanced analytics', 'AI Advisor', 'Email automation'], current: true },
  { name: 'Scale', price: 99, features: ['Everything in Growth', 'Team seats', 'White-label', 'Dedicated support'], current: false },
];

export function Settings() {
  const { user, setUser } = useAuthStore();
  const [section, setSection] = useState<Section>('profile');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingStartup, setSavingStartup] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const sp = user?.startupProfile;

  const [profileForm, setProfileForm] = useState({ name: user?.name ?? '', avatar: user?.avatar ?? '' });
  const [startupForm, setStartupForm] = useState({
    companyName: sp?.companyName ?? '',
    website: sp?.website ?? '',
    industry: sp?.industry ?? '',
    growthStage: sp?.growthStage ?? 'EARLY',
    country: sp?.country ?? 'GH',
    targetAudience: sp?.targetAudience ?? '',
    monthlyBudget: String(sp?.monthlyBudget ?? ''),
    teamSize: String(sp?.teamSize ?? ''),
  });
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const { data } = await api.put<{ success: boolean; data: typeof user }>('/users/me', {
        name: profileForm.name,
        ...(profileForm.avatar ? { avatar: profileForm.avatar } : {}),
      });
      if (user && data.data) setUser({ ...user, ...data.data });
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
    finally { setSavingProfile(false); }
  };

  const saveStartup = async () => {
    setSavingStartup(true);
    try {
      const { data } = await api.post<{ success: boolean; data: { startupProfile: unknown } }>('/users/me/startup-profile', {
        ...startupForm,
        monthlyBudget: startupForm.monthlyBudget ? Number(startupForm.monthlyBudget) : undefined,
        teamSize: startupForm.teamSize ? Number(startupForm.teamSize) : undefined,
      });
      if (user) setUser({ ...user, startupProfile: data.data.startupProfile as never });
      toast.success('Startup profile updated');
    } catch { toast.error('Failed to update startup profile'); }
    finally { setSavingStartup(false); }
  };

  const savePassword = async () => {
    if (passwordForm.next !== passwordForm.confirm) { toast.error('New passwords do not match'); return; }
    if (passwordForm.next.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSavingPassword(true);
    try {
      await api.post('/auth/change-password', { currentPassword: passwordForm.current, newPassword: passwordForm.next });
      toast.success('Password updated');
      setPasswordForm({ current: '', next: '', confirm: '' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update password';
      toast.error(msg);
    }
    finally { setSavingPassword(false); }
  };

  return (
    <div className="max-w-5xl mx-auto flex gap-6">
      <aside className="w-48 shrink-0">
        <nav className="space-y-1">
          {SECTIONS.map(({ key, label, icon }) => (
            <button key={key} onClick={() => setSection(key)} className={clsx(
              'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left',
              section === key ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
            )}>
              {icon} {label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 space-y-5">
        {section === 'profile' && (
          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-5">Profile</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.[0] ?? 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                {user?.isVerified
                  ? <Badge variant="success" dot className="mt-1">Verified</Badge>
                  : <Badge variant="warning" className="mt-1">Unverified</Badge>}
              </div>
            </div>
            <div className="space-y-4 max-w-md">
              <Input label="Full name" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
              <Input label="Email address" defaultValue={user?.email} type="email" disabled hint="Contact support to change your email" />
              <Input label="Avatar URL (optional)" placeholder="https://example.com/avatar.jpg" value={profileForm.avatar} onChange={e => setProfileForm(f => ({ ...f, avatar: e.target.value }))} />
              <Button loading={savingProfile} onClick={saveProfile}>Save changes</Button>
            </div>
          </Card>
        )}

        {section === 'startup' && (
          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-5">Startup Profile</h3>
            <div className="space-y-4 max-w-md">
              <Input label="Company name" value={startupForm.companyName} onChange={e => setStartupForm(f => ({ ...f, companyName: e.target.value }))} />
              <Input label="Website" value={startupForm.website} placeholder="https://yourcompany.com" onChange={e => setStartupForm(f => ({ ...f, website: e.target.value }))} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select value={startupForm.industry} onChange={e => setStartupForm(f => ({ ...f, industry: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {INDUSTRIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Growth stage</label>
                <select value={startupForm.growthStage} onChange={e => setStartupForm(f => ({ ...f, growthStage: e.target.value as typeof f.growthStage }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {GROWTH_STAGES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select value={startupForm.country} onChange={e => setStartupForm(f => ({ ...f, country: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {AFRICAN_COUNTRIES.map(({ code, name, flag }) => <option key={code} value={code}>{flag} {name}</option>)}
                </select>
              </div>
              <Input label="Team size" type="number" value={startupForm.teamSize} onChange={e => setStartupForm(f => ({ ...f, teamSize: e.target.value }))} />
              <Input label="Monthly budget (USD)" type="number" placeholder="e.g. 2000" value={startupForm.monthlyBudget} onChange={e => setStartupForm(f => ({ ...f, monthlyBudget: e.target.value }))} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target audience</label>
                <textarea value={startupForm.targetAudience} onChange={e => setStartupForm(f => ({ ...f, targetAudience: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px]" placeholder="Who are your customers?" />
              </div>
              <Button loading={savingStartup} onClick={saveStartup}>Save changes</Button>
            </div>
          </Card>
        )}

        {section === 'notifications' && (
          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-5">Notifications</h3>
            <div className="space-y-4 max-w-md">
              {[
                { label: 'Campaign performance reports', desc: 'Weekly summary of all active campaigns' },
                { label: 'AI Advisor insights', desc: 'Get personalized tips delivered to your inbox' },
                { label: 'Automation alerts', desc: 'When automations trigger or fail' },
                { label: 'Community replies', desc: 'When someone replies to your posts' },
                { label: 'Product updates', desc: 'New features and improvements to ScaleAfrique' },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-400 rounded-full peer peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                  </label>
                </div>
              ))}
            </div>
          </Card>
        )}

        {section === 'integrations' && (
          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Integrations</h3>
            <p className="text-sm text-gray-500 mb-5">Connect your channels. Add API keys to the backend <code className="bg-gray-100 px-1 rounded text-xs">.env</code> file to activate.</p>
            <div className="space-y-3 max-w-lg">
              {[
                { name: "Africa's Talking SMS", desc: 'Bulk SMS across 300+ African networks', icon: '📱', envKey: 'AFRICAS_TALKING_API_KEY' },
                { name: 'Facebook / Meta Ads', desc: 'Publish posts and run paid campaigns', icon: '📘', envKey: 'FACEBOOK_APP_ID' },
                { name: 'WhatsApp Business API', desc: 'Automated broadcast messages', icon: '💬', envKey: 'WHATSAPP_ACCESS_TOKEN' },
                { name: 'Google Ads', desc: 'Search and display campaigns', icon: '🔍', envKey: 'GOOGLE_ADS_CLIENT_ID' },
                { name: 'Mailchimp', desc: 'Email lists and campaign sync', icon: '🐒', envKey: 'MAILCHIMP_API_KEY' },
              ].map(({ name, desc, icon, envKey }) => (
                <div key={name} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl">
                  <div className="text-2xl">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{envKey}=your_key</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toast.success(`Add ${envKey} to your .env to activate`)}>
                    Configure
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {section === 'billing' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Billing & Plans</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PLANS.map(plan => (
                <Card key={plan.name} className={clsx(plan.current && 'ring-2 ring-primary-500')}>
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-base font-bold text-gray-900">{plan.name}</h4>
                    {plan.current && <Badge variant="success">Current</Badge>}
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-4">
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    {plan.price > 0 && <span className="text-sm text-gray-500 font-normal">/mo</span>}
                  </p>
                  <ul className="space-y-1.5 mb-5">
                    {plan.features.map(f => (
                      <li key={f} className="text-xs text-gray-600 flex items-center gap-1.5">
                        <span className="text-green-500">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Button variant={plan.current ? 'ghost' : 'primary'} size="sm" fullWidth disabled={plan.current}>
                    {plan.current ? 'Current plan' : 'Upgrade'}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {section === 'security' && (
          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-5">Security</h3>
            <div className="space-y-5 max-w-md">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Change password</h4>
                <Input label="Current password" type="password" placeholder="••••••••" value={passwordForm.current} onChange={e => setPasswordForm(f => ({ ...f, current: e.target.value }))} />
                <Input label="New password" type="password" placeholder="Min. 6 characters" value={passwordForm.next} onChange={e => setPasswordForm(f => ({ ...f, next: e.target.value }))} />
                <Input label="Confirm new password" type="password" placeholder="••••••••" value={passwordForm.confirm} onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))} />
                <Button size="sm" loading={savingPassword} onClick={savePassword}>Update password</Button>
              </div>
            </div>
          </Card>
        )}

        {section === 'team' && (
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">Team</h3>
              <Button size="sm" icon={<Users size={14} />} onClick={() => toast.success('Team invites coming soon on the Scale plan!')}>
                Invite Member
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {user?.name?.[0] ?? 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <Badge variant="success">Admin</Badge>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Team management with multiple seats is available on the Scale plan.</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
