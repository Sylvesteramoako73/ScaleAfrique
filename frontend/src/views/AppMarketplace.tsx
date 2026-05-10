'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

type Category = 'All' | 'CRM' | 'Payments' | 'Email' | 'Analytics' | 'Social' | 'Communication' | 'Storage' | 'Automation';

interface Integration {
  id: number;
  name: string;
  category: Category;
  description: string;
  color: string;
}

const INTEGRATIONS: Integration[] = [
  { id: 1, name: 'Paystack', category: 'Payments', description: 'Accept payments across Africa', color: 'bg-blue-500' },
  { id: 2, name: 'Flutterwave', category: 'Payments', description: 'Pan-African payment gateway', color: 'bg-orange-500' },
  { id: 3, name: 'Mailchimp', category: 'Email', description: 'Email marketing automation', color: 'bg-yellow-500' },
  { id: 4, name: 'Twilio', category: 'Communication', description: 'SMS and voice messaging', color: 'bg-red-500' },
  { id: 5, name: 'Slack', category: 'Communication', description: 'Team messaging', color: 'bg-purple-600' },
  { id: 6, name: 'Google Analytics', category: 'Analytics', description: 'Website traffic insights', color: 'bg-amber-600' },
  { id: 7, name: 'Meta Ads', category: 'Social', description: 'Facebook & Instagram ads', color: 'bg-blue-700' },
  { id: 8, name: 'HubSpot', category: 'CRM', description: 'CRM and sales pipeline', color: 'bg-orange-600' },
  { id: 9, name: 'Zapier', category: 'Automation', description: 'Connect 5000+ apps', color: 'bg-orange-400' },
  { id: 10, name: "Google Drive", category: 'Storage', description: 'Cloud file storage', color: 'bg-green-600' },
  { id: 11, name: "Africa's Talking", category: 'Communication', description: 'SMS for African markets', color: 'bg-red-600' },
  { id: 12, name: 'WhatsApp Business', category: 'Communication', description: 'Customer messaging', color: 'bg-green-500' },
];

const CATEGORIES: Category[] = ['All', 'CRM', 'Payments', 'Email', 'Analytics', 'Social', 'Communication', 'Storage', 'Automation'];

const CATEGORY_COLORS: Record<string, string> = {
  Payments: 'bg-green-100 text-green-700',
  Email: 'bg-yellow-100 text-yellow-700',
  Communication: 'bg-blue-100 text-blue-700',
  Analytics: 'bg-purple-100 text-purple-700',
  Social: 'bg-pink-100 text-pink-700',
  CRM: 'bg-orange-100 text-orange-700',
  Automation: 'bg-amber-100 text-amber-700',
  Storage: 'bg-gray-100 text-gray-700',
};

export function AppMarketplace() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [connected, setConnected] = useState<Record<number, boolean>>({});

  const filtered = INTEGRATIONS.filter((i) => {
    const matchesCategory = activeCategory === 'All' || i.category === activeCategory;
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggle = (id: number, name: string) => {
    setConnected((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) {
        toast.success(`${name} connected!`);
      } else {
        toast(`${name} disconnected`, { icon: '🔌' });
      }
      return next;
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">App Marketplace</h1>
        <p className="text-sm text-gray-500 mt-1">Connect your favorite tools</p>
      </div>

      {/* Search */}
      <Input
        placeholder="Search integrations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search size={15} />}
        className="max-w-sm"
      />

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              activeCategory === c ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No integrations found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((integration) => {
            const isConnected = connected[integration.id] ?? false;
            return (
              <Card key={integration.id} hover>
                <div className="flex items-start gap-3">
                  <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0', integration.color)}>
                    {integration.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{integration.name}</p>
                        <span className={clsx('inline-block px-2 py-0.5 rounded text-xs font-medium mt-0.5', CATEGORY_COLORS[integration.category] ?? 'bg-gray-100 text-gray-600')}>
                          {integration.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 mb-3">{integration.description}</p>
                    <Button
                      size="sm"
                      variant={isConnected ? 'secondary' : 'primary'}
                      onClick={() => toggle(integration.id, integration.name)}
                    >
                      {isConnected ? 'Connected' : 'Connect'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
