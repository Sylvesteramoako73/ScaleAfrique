'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Zap, Play, Pause, Trash2, ChevronRight, Mail, MessageSquare, Phone, Clock, Tag, BarChart3 } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { automationService } from '../services/automation.service';
import type { Automation, AutomationTrigger, AutomationAction, AutomationTriggerType, AutomationActionType } from '../types';

const TRIGGERS: { value: AutomationTriggerType; label: string; desc: string; icon: string }[] = [
  { value: 'new_signup', label: 'New Signup', desc: 'When a new user registers', icon: '👤' },
  { value: 'campaign_launched', label: 'Campaign Launched', desc: 'When you launch a campaign', icon: '🚀' },
  { value: 'campaign_completed', label: 'Campaign Completed', desc: 'When a campaign ends', icon: '✅' },
  { value: 'no_activity_7d', label: 'Inactive 7 Days', desc: 'Customer hasn\'t engaged in 7 days', icon: '😴' },
  { value: 'purchase', label: 'Purchase Made', desc: 'Customer completes a purchase', icon: '💰' },
  { value: 'cart_abandon', label: 'Cart Abandoned', desc: 'Customer leaves without buying', icon: '🛒' },
];

const ACTIONS: { value: AutomationActionType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'send_email', label: 'Send Email', icon: <Mail size={16} />, color: 'text-blue-600 bg-blue-50' },
  { value: 'send_sms', label: 'Send SMS', icon: <Phone size={16} />, color: 'text-green-600 bg-green-50' },
  { value: 'send_whatsapp', label: 'Send WhatsApp', icon: <MessageSquare size={16} />, color: 'text-emerald-600 bg-emerald-50' },
  { value: 'wait', label: 'Wait / Delay', icon: <Clock size={16} />, color: 'text-gray-600 bg-gray-50' },
  { value: 'add_tag', label: 'Add Tag', icon: <Tag size={16} />, color: 'text-purple-600 bg-purple-50' },
  { value: 'create_campaign', label: 'Create Campaign', icon: <BarChart3 size={16} />, color: 'text-amber-600 bg-amber-50' },
];

const TEMPLATES = [
  {
    name: 'Welcome New Customer',
    description: 'Send a warm welcome sequence to every new signup',
    trigger: { type: 'new_signup' as AutomationTriggerType },
    actions: [
      { type: 'send_email' as AutomationActionType, config: { subject: 'Welcome to {{company}}! 🌍', body: 'Hi {{name}}, welcome aboard! Here\'s how to get started...' }, delay: 0 },
      { type: 'send_whatsapp' as AutomationActionType, config: { message: 'Hi {{name}}! Welcome to {{company}}. Reply HELP anytime.' }, delay: 60 },
    ],
  },
  {
    name: 'Win-Back Inactive Customers',
    description: 'Re-engage customers who haven\'t purchased in 7 days',
    trigger: { type: 'no_activity_7d' as AutomationTriggerType },
    actions: [
      { type: 'send_sms' as AutomationActionType, config: { message: 'Hey {{name}}, we miss you! Use code COMEBACK for 20% off.' }, delay: 0 },
      { type: 'send_email' as AutomationActionType, config: { subject: 'We miss you, {{name}} 👋', body: 'It\'s been a while. Here\'s a special offer just for you...' }, delay: 1440 },
    ],
  },
  {
    name: 'Post-Purchase Upsell',
    description: 'Thank customers and upsell a complementary product',
    trigger: { type: 'purchase' as AutomationTriggerType },
    actions: [
      { type: 'send_whatsapp' as AutomationActionType, config: { message: 'Thank you for your purchase! Your order is confirmed 🎉' }, delay: 0 },
      { type: 'send_email' as AutomationActionType, config: { subject: 'You might also love this...', body: 'Based on your recent purchase, we think you\'d love...' }, delay: 2880 },
    ],
  },
  {
    name: 'Cart Abandonment Recovery',
    description: 'Recover lost sales with a gentle reminder + discount',
    trigger: { type: 'cart_abandon' as AutomationTriggerType },
    actions: [
      { type: 'send_whatsapp' as AutomationActionType, config: { message: 'You left something behind! Complete your order: {{cart_link}}' }, delay: 30 },
      { type: 'send_sms' as AutomationActionType, config: { message: 'Still interested? Get 10% off with code COMEBACK10.' }, delay: 1440 },
    ],
  },
];

function getActionMeta(type: AutomationActionType) {
  return ACTIONS.find(a => a.value === type) ?? ACTIONS[0];
}

function getTriggerMeta(type: AutomationTriggerType) {
  return TRIGGERS.find(t => t.value === type) ?? TRIGGERS[0];
}

type BuilderStep = 'trigger' | 'actions' | 'review';

interface BuilderState {
  name: string;
  description: string;
  trigger: AutomationTrigger | null;
  actions: AutomationAction[];
}

export function Automations() {
  const qc = useQueryClient();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderStep, setBuilderStep] = useState<BuilderStep>('trigger');
  const [builder, setBuilder] = useState<BuilderState>({ name: '', description: '', trigger: null, actions: [] });
  const [addingAction, setAddingAction] = useState(false);

  const { data: automations, isLoading } = useQuery({
    queryKey: ['automations'],
    queryFn: () => automationService.list(),
    staleTime: 30_000,
  });

  const { mutate: createAutomation, isPending: creating } = useMutation({
    mutationFn: () => automationService.create({
      name: builder.name,
      description: builder.description,
      trigger: builder.trigger!,
      actions: builder.actions,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automations'] });
      toast.success('Automation created!');
      setBuilderOpen(false);
      resetBuilder();
    },
    onError: () => toast.error('Failed to create automation'),
  });

  const { mutate: toggleAutomation } = useMutation({
    mutationFn: (id: string) => automationService.toggle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automations'] }),
  });

  const { mutate: deleteAutomation } = useMutation({
    mutationFn: (id: string) => automationService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automations'] });
      toast.success('Automation deleted');
    },
  });

  const resetBuilder = () => {
    setBuilder({ name: '', description: '', trigger: null, actions: [] });
    setBuilderStep('trigger');
  };

  const loadTemplate = (template: typeof TEMPLATES[0]) => {
    setBuilder({
      name: template.name,
      description: template.description,
      trigger: template.trigger,
      actions: template.actions,
    });
    setBuilderStep('review');
    setBuilderOpen(true);
  };

  const addAction = (type: AutomationActionType) => {
    const defaults: Record<AutomationActionType, AutomationAction['config']> = {
      send_email: { subject: '', body: '' },
      send_sms: { message: '' },
      send_whatsapp: { message: '' },
      wait: { minutes: 60 },
      add_tag: { tag: '' },
      create_campaign: { name: '' },
    };
    setBuilder(b => ({
      ...b,
      actions: [...b.actions, { type, config: defaults[type], delay: 0 }],
    }));
    setAddingAction(false);
  };

  const removeAction = (i: number) => {
    setBuilder(b => ({ ...b, actions: b.actions.filter((_, idx) => idx !== i) }));
  };

  const updateActionConfig = (i: number, key: string, value: string | number) => {
    setBuilder(b => {
      const actions = [...b.actions];
      actions[i] = { ...actions[i], config: { ...actions[i].config, [key]: value } };
      return { ...b, actions };
    });
  };

  const activeCount = automations?.filter(a => a.isActive).length ?? 0;
  const totalRuns = automations?.reduce((s, a) => s + (a.stats?.runs ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Automation Workflows</h2>
          <p className="text-sm text-gray-500">Set up IF/THEN triggers to run marketing on autopilot</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => { resetBuilder(); setBuilderOpen(true); }}>
          New Automation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Automations', value: activeCount },
          { label: 'Total Automations', value: automations?.length ?? 0 },
          { label: 'Total Runs', value: totalRuns },
        ].map(({ label, value }) => (
          <Card key={label} className="text-center py-4">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </Card>
        ))}
      </div>

      {/* Templates */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Templates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TEMPLATES.map(t => (
            <button
              key={t.name}
              onClick={() => loadTemplate(t)}
              className="text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-primary-400 hover:shadow-sm transition-all group"
            >
              <div className="text-2xl mb-2">{getTriggerMeta(t.trigger.type).icon}</div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-700">{t.name}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-primary-600">
                Use template <ChevronRight size={12} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Automations list */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Automations</h3>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" className="text-primary-600" /></div>
        ) : !automations?.length ? (
          <Card className="text-center py-12">
            <Zap size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-700">No automations yet</p>
            <p className="text-xs text-gray-500 mt-1 mb-4">Create your first automation or use a template above.</p>
            <Button size="sm" onClick={() => { resetBuilder(); setBuilderOpen(true); }}>Create automation</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {automations.map(auto => (
              <AutomationRow
                key={auto.id}
                automation={auto}
                onToggle={() => toggleAutomation(auto.id)}
                onDelete={() => deleteAutomation(auto.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Builder Modal */}
      <Modal
        open={builderOpen}
        onClose={() => { setBuilderOpen(false); resetBuilder(); }}
        title="Build Automation"
        size="lg"
      >
        <div className="space-y-5">
          {/* Step indicator */}
          <div className="flex gap-2">
            {(['trigger', 'actions', 'review'] as BuilderStep[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={clsx(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                  builderStep === s ? 'bg-primary-600 text-white' :
                  (['trigger', 'actions', 'review'].indexOf(builderStep) > i) ? 'bg-primary-100 text-primary-700' :
                  'bg-gray-100 text-gray-400'
                )}>{i + 1}</div>
                <span className={clsx('text-xs font-medium capitalize', builderStep === s ? 'text-gray-900' : 'text-gray-400')}>
                  {s}
                </span>
                {i < 2 && <div className="flex-1 h-0.5 bg-gray-100" />}
              </div>
            ))}
          </div>

          {/* Name */}
          <Input
            label="Automation name"
            placeholder="e.g. Welcome New Customers"
            value={builder.name}
            onChange={e => setBuilder(b => ({ ...b, name: e.target.value }))}
          />

          {/* Step: Trigger */}
          {builderStep === 'trigger' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">When this happens… (Trigger)</label>
              <div className="grid grid-cols-2 gap-2">
                {TRIGGERS.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setBuilder(b => ({ ...b, trigger: { type: t.value } }))}
                    className={clsx(
                      'flex items-start gap-2 p-3 rounded-xl border-2 text-left transition-all',
                      builder.trigger?.type === t.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.label}</p>
                      <p className="text-xs text-gray-500">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={() => setBuilderStep('actions')} disabled={!builder.trigger} iconRight={<ChevronRight size={15} />}>
                  Next: Add Actions
                </Button>
              </div>
            </div>
          )}

          {/* Step: Actions */}
          {builderStep === 'actions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Then do this… (Actions)</label>
                <Button variant="outline" size="sm" icon={<Plus size={13} />} onClick={() => setAddingAction(true)}>
                  Add Action
                </Button>
              </div>

              {/* Trigger summary */}
              {builder.trigger && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <span className="text-lg">{getTriggerMeta(builder.trigger.type).icon}</span>
                  <span>When: <strong>{getTriggerMeta(builder.trigger.type).label}</strong></span>
                </div>
              )}

              {builder.actions.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-400">Add at least one action</p>
                </div>
              )}

              {builder.actions.map((action, i) => {
                const meta = getActionMeta(action.type);
                return (
                  <div key={i} className="p-3 border border-gray-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={clsx('flex items-center gap-2 text-sm font-medium px-2 py-1 rounded-lg', meta.color)}>
                        {meta.icon} {meta.label}
                      </div>
                      <button onClick={() => removeAction(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {(action.type === 'send_email') && (
                      <div className="space-y-2">
                        <Input placeholder="Email subject" value={String(action.config.subject ?? '')} onChange={e => updateActionConfig(i, 'subject', e.target.value)} />
                        <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[60px]" placeholder="Email body..." value={String(action.config.body ?? '')} onChange={e => updateActionConfig(i, 'body', e.target.value)} />
                      </div>
                    )}
                    {(action.type === 'send_sms' || action.type === 'send_whatsapp') && (
                      <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[60px]" placeholder="Message text... (use {{name}}, {{company}} for personalisation)" value={String(action.config.message ?? '')} onChange={e => updateActionConfig(i, 'message', e.target.value)} />
                    )}
                    {action.type === 'wait' && (
                      <Input type="number" placeholder="Delay in minutes" value={String(action.config.minutes ?? 60)} onChange={e => updateActionConfig(i, 'minutes', Number(e.target.value))} />
                    )}
                    {action.type === 'add_tag' && (
                      <Input placeholder="Tag name" value={String(action.config.tag ?? '')} onChange={e => updateActionConfig(i, 'tag', e.target.value)} />
                    )}
                  </div>
                );
              })}

              {addingAction && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Choose action type:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {ACTIONS.map(a => (
                      <button key={a.value} onClick={() => addAction(a.value)} className={clsx('flex items-center gap-2 p-2.5 rounded-lg border text-sm font-medium transition-all hover:shadow-sm', a.color)}>
                        {a.icon} {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setBuilderStep('trigger')}>Back</Button>
                <Button onClick={() => setBuilderStep('review')} disabled={builder.actions.length === 0} iconRight={<ChevronRight size={15} />}>
                  Review
                </Button>
              </div>
            </div>
          )}

          {/* Step: Review */}
          {builderStep === 'review' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Name</p>
                  <p className="text-sm font-semibold text-gray-900">{builder.name || '(unnamed)'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Trigger</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{builder.trigger ? getTriggerMeta(builder.trigger.type).icon : '?'}</span>
                    <span className="font-medium text-gray-800">{builder.trigger ? getTriggerMeta(builder.trigger.type).label : 'None'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-2">Actions ({builder.actions.length})</p>
                  <div className="space-y-1.5">
                    {builder.actions.map((action, i) => {
                      const meta = getActionMeta(action.type);
                      return (
                        <div key={i} className={clsx('flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg', meta.color)}>
                          {meta.icon}
                          <span className="font-medium">{meta.label}</span>
                          {action.delay ? <span className="ml-auto text-gray-400">after {action.delay < 60 ? `${action.delay}m` : `${action.delay / 60}h`}</span> : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setBuilderStep('actions')}>Back</Button>
                <Button
                  loading={creating}
                  disabled={!builder.name || !builder.trigger || builder.actions.length === 0}
                  onClick={() => createAutomation()}
                  icon={<Zap size={15} />}
                >
                  Activate Automation
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function AutomationRow({
  automation,
  onToggle,
  onDelete,
}: {
  automation: Automation;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const trigger = getTriggerMeta(automation.trigger.type);

  return (
    <Card hover>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-xl shrink-0">
          {trigger.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">{automation.name}</p>
            <Badge variant={automation.isActive ? 'success' : 'default'} dot>
              {automation.isActive ? 'Active' : 'Paused'}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Trigger: {trigger.label} → {automation.actions.length} action{automation.actions.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            {automation.actions.map((action, i) => {
              const meta = getActionMeta(action.type);
              return (
                <div key={i} className={clsx('flex items-center gap-1 text-xs px-1.5 py-0.5 rounded', meta.color)}>
                  {meta.icon}
                  <span>{meta.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="text-right shrink-0 mr-2">
          <p className="text-lg font-bold text-gray-900">{automation.stats?.runs ?? 0}</p>
          <p className="text-xs text-gray-400">runs</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggle}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              automation.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'
            )}
            title={automation.isActive ? 'Pause' : 'Activate'}
          >
            {automation.isActive ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={() => {
              if (window.confirm('Delete this automation?')) onDelete();
            }}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
}
