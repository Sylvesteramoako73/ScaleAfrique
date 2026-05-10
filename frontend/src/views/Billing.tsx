'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Zap, Crown, Building2, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { billingService, type Plan } from '../services/billing.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

const PLAN_ICONS: Record<string, React.ReactNode> = {
  FREE: <Sparkles size={20} className="text-gray-500" />,
  PRO: <Zap size={20} className="text-amber-500" />,
  AGENCY: <Crown size={20} className="text-purple-500" />,
  ENTERPRISE: <Building2 size={20} className="text-primary-600" />,
};

const PLAN_BORDERS: Record<string, string> = {
  FREE: 'border-gray-200',
  PRO: 'border-amber-300 ring-2 ring-amber-100',
  AGENCY: 'border-purple-300 ring-2 ring-purple-100',
  ENTERPRISE: 'border-primary-300 ring-2 ring-primary-100',
};

export function Billing() {
  const qc = useQueryClient();

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['billing', 'plans'], queryFn: () => billingService.getPlans(), staleTime: 300_000,
  });
  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['billing', 'subscription'], queryFn: () => billingService.getSubscription(), staleTime: 60_000,
  });

  const upgradeMutation = useMutation({
    mutationFn: (planName: string) => billingService.upgradePlan(planName),
    onSuccess: () => { toast.success('Plan updated!'); qc.invalidateQueries({ queryKey: ['billing', 'subscription'] }); },
    onError: () => toast.error('Failed to update plan'),
  });
  const cancelMutation = useMutation({
    mutationFn: () => billingService.cancelSubscription(),
    onSuccess: () => { toast.success('Subscription will cancel at period end'); qc.invalidateQueries({ queryKey: ['billing', 'subscription'] }); },
    onError: () => toast.error('Failed to cancel'),
  });

  const currentPlanName = subscription?.plan?.name ?? 'FREE';

  if (plansLoading || subLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" className="text-primary-600" /></div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Billing & Plans</h2>
        <p className="text-sm text-gray-500 mt-1">Choose the plan that fits your growth stage</p>
      </div>

      {subscription && (
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Current plan: <span className="font-bold text-gray-900">{subscription.plan.displayName}</span></p>
            <p className="text-xs text-gray-400 mt-0.5">
              {subscription.status === 'TRIALING' ? `Trial ends ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}` :
               subscription.cancelAtPeriodEnd ? `Cancels ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}` :
               `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full', subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : subscription.status === 'TRIALING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}>
              {subscription.status}
            </span>
            {subscription.status === 'ACTIVE' && !subscription.cancelAtPeriodEnd && currentPlanName !== 'FREE' && (
              <Button variant="outline" size="sm" loading={cancelMutation.isPending} onClick={() => cancelMutation.mutate()}>Cancel plan</Button>
            )}
          </div>
        </Card>
      )}

      {!plans?.length ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400">No plans available yet. Run the seed script to add plans.</p>
          <code className="mt-2 block text-xs bg-gray-100 rounded-lg px-4 py-2 w-fit mx-auto">cd backend && npx ts-node scripts/seed-plans.ts</code>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan: Plan) => {
            const features: string[] = (() => { try { return JSON.parse(plan.features); } catch { return []; } })();
            const isCurrent = plan.name === currentPlanName;
            const isMostPopular = plan.name === 'PRO';
            return (
              <div key={plan.id} className={clsx('relative flex flex-col rounded-2xl border-2 p-5 bg-white transition-shadow hover:shadow-lg', PLAN_BORDERS[plan.name] ?? 'border-gray-200')}>
                {isMostPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">Most Popular</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-4">
                  {PLAN_ICONS[plan.name]}
                  <span className="font-semibold text-gray-900">{plan.displayName}</span>
                  {isCurrent && <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">Current</span>}
                </div>
                <div className="mb-5">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  {plan.price > 0 && <span className="text-sm text-gray-400">/{plan.interval}</span>}
                </div>
                <ul className="space-y-2 flex-1 mb-5">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                      <Check size={13} className="text-green-500 shrink-0" />
                      {f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={isCurrent ? 'outline' : 'primary'}
                  size="sm"
                  disabled={isCurrent}
                  loading={upgradeMutation.isPending && upgradeMutation.variables === plan.name}
                  onClick={() => { if (!isCurrent) upgradeMutation.mutate(plan.name); }}
                  className="w-full"
                >
                  {isCurrent ? 'Current plan' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <Card className="bg-primary-50 border border-primary-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary-100 rounded-xl mt-0.5"><Zap size={16} className="text-primary-600" /></div>
          <div>
            <p className="text-sm font-semibold text-primary-900">Payments powered by Paystack</p>
            <p className="text-xs text-primary-700 mt-1">Secure card payments across Africa — NGN, GHS, KES, ZAR and more. Mastercard, Visa, Verve, and mobile money supported.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
