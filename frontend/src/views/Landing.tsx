'use client';

import Link from 'next/link';
import { Bot, Users, BarChart3, Megaphone, CheckCircle, ArrowRight, Globe, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

const FEATURES = [
  {
    icon: <Bot size={22} />, color: 'bg-amber-50 text-amber-600',
    title: 'AI Marketing Advisor',
    desc: 'A personalised AI coach that learns your business and recommends the best channels, budgets, and tactics for your African market.',
  },
  {
    icon: <Globe size={22} />, color: 'bg-blue-50 text-blue-600',
    title: 'Hyper-Local Insights',
    desc: 'Market intelligence tuned to Ghana, Nigeria, Kenya, South Africa and 50+ more markets — with local language support.',
  },
  {
    icon: <Megaphone size={22} />, color: 'bg-primary-50 text-primary-600',
    title: 'Marketing Automation',
    desc: 'Build, schedule and automate email, social media, and ad campaigns across Google, Facebook, WhatsApp, and local platforms.',
  },
  {
    icon: <BarChart3 size={22} />, color: 'bg-purple-50 text-purple-600',
    title: 'Campaign Analytics',
    desc: 'Real-time dashboards showing reach, engagement, and ROI. AI surfaces key insights and tells you exactly what to optimise.',
  },
  {
    icon: <Users size={22} />, color: 'bg-green-50 text-green-600',
    title: 'Founder Community',
    desc: 'Connect with 12,000+ African founders. Share strategies, co-market, access templates, and attend virtual events.',
  },
  {
    icon: <Shield size={22} />, color: 'bg-red-50 text-red-600',
    title: 'Secure & Scalable',
    desc: 'Enterprise-grade security with end-to-end encryption, OAuth, and GDPR compliance. Scales from idea-stage to IPO.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Ama Korantema', title: 'Founder, PayQuick GH', country: '🇬🇭',
    quote: 'ScaleAfrique helped us 4× our customer acquisition in 3 months. The AI advisor recommended WhatsApp campaigns over email — game changer.',
  },
  {
    name: 'Chidi Nwosu', title: 'CEO, LogiFlow Nigeria', country: '🇳🇬',
    quote: 'The hyper-local insights are unreal. Knowing exactly when Lagos audiences are online and what messaging resonates saved us thousands in ad spend.',
  },
  {
    name: 'Zanele Dlamini', title: 'Co-founder, AgroConnect Kenya', country: '🇰🇪',
    quote: 'We used the community to find a co-marketing partner. Together we ran a joint campaign that reached 50,000 farmers across East Africa.',
  },
];

const STATS = [
  { value: '12,000+', label: 'African Startups' },
  { value: '54', label: 'Markets Covered' },
  { value: '3.8×', label: 'Avg. Campaign ROI' },
  { value: '99.9%', label: 'Uptime SLA' },
];

const PLANS = [
  {
    name: 'Starter', price: 'Free', period: '',
    features: ['3 campaigns/month', 'Basic analytics', 'Community access', 'AI advisor (10 msgs/mo)'],
    cta: 'Get started free', primary: false,
  },
  {
    name: 'Growth', price: '$29', period: '/month',
    features: ['Unlimited campaigns', 'Advanced analytics', 'AI advisor (unlimited)', 'Email automation', 'Social scheduling', 'Priority support'],
    cta: 'Start free trial', primary: true,
  },
  {
    name: 'Scale', price: '$99', period: '/month',
    features: ['Everything in Growth', '5 team seats', 'White-label reports', 'API access', 'Dedicated account manager', 'Custom integrations'],
    cta: 'Contact sales', primary: false,
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Profile your startup', desc: 'Tell us your industry, growth stage, region, and budget. 2 minutes to set up.' },
  { step: '02', title: 'Get your strategy', desc: 'Your AI advisor instantly generates a personalised marketing plan for your African market.' },
  { step: '03', title: 'Launch & optimise', desc: 'Build campaigns, automate execution, and watch AI-powered insights improve results continuously.' },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Logo size={32} />
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900">How it works</a>
            <a href="#pricing" className="hover:text-gray-900">Pricing</a>
            <a href="#community" className="hover:text-gray-900">Community</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Get started free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-gray-900 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="text-amber-400">🌍</span> Built specifically for African markets
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl mx-auto">
            Grow Your African Business with{' '}
            <span className="text-amber-400">AI-Powered Marketing</span>
          </h1>
          <p className="text-lg text-gray-300 mt-6 max-w-2xl mx-auto leading-relaxed">
            ScaleAfrique gives startups and SMEs across Africa the tools, insights, and community they need to build winning marketing strategies — starting in Ghana and scaling continent-wide.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Link href="/auth/register">
              <Button size="lg">
                Start for free — no credit card
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                See how it works
              </Button>
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-4">Trusted by 12,000+ startups in 54 African countries</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-700 py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-amber-400">{value}</p>
              <p className="text-sm text-primary-200 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need to market across Africa</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              One platform for AI-driven strategy, automation, analytics, and community — all tuned for African markets.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  {icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Up and running in minutes</h2>
            <p className="text-gray-500 mt-3">Three steps from sign-up to your first AI-powered campaign</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="community" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Loved by founders across Africa</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, title, country, quote }) => (
              <div key={name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed mb-5">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{name} {country}</p>
                    <p className="text-xs text-gray-500">{title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
            <p className="text-gray-500 mt-3">Start free. Upgrade as you grow.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border ${plan.primary ? 'border-primary-500 bg-primary-600 text-white shadow-lg scale-105' : 'border-gray-200 bg-white'}`}
              >
                <h3 className={`text-base font-bold mb-1 ${plan.primary ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className={`text-3xl font-bold ${plan.primary ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.primary ? 'text-primary-200' : 'text-gray-400'}`}>{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className={`text-sm flex items-center gap-2 ${plan.primary ? 'text-primary-100' : 'text-gray-600'}`}>
                      <CheckCircle size={14} className={plan.primary ? 'text-amber-400' : 'text-primary-500'} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register">
                  <Button
                    fullWidth
                    variant={plan.primary ? 'secondary' : 'outline'}
                    className={!plan.primary ? 'border-gray-300' : ''}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-500 py-16 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-3">Ready to grow across Africa?</h2>
          <p className="text-primary-100 mb-8">Join 12,000+ startups using ScaleAfrique to build smarter marketing strategies.</p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" iconRight={<ArrowRight size={18} />}>
              Start free today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size={28} textColor="text-white" />
          <p className="text-xs">© 2026 ScaleAfrique. Built for Africa 🌍</p>
          <div className="flex gap-4 text-xs">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
