'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Calendar, BookOpen, Users, MessageSquare, Heart, Eye, ExternalLink, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { communityService } from '../services/community.service';
import { formatRelativeDate, formatDate } from '../utils/formatters';
import type { CommunityPost, Event } from '../types';

type Tab = 'feed' | 'events' | 'resources' | 'members';

const CATEGORIES = ['All', 'success-story', 'resource', 'collaboration', 'question', 'announcement'];
const EVENT_TYPE_COLORS: Record<string, string> = {
  WEBINAR: 'bg-blue-100 text-blue-700',
  WORKSHOP: 'bg-green-100 text-green-700',
  NETWORKING: 'bg-purple-100 text-purple-700',
};

const FALLBACK_EVENTS: Event[] = [
  {
    id: 'e1', organizerId: 'system', title: 'African Startup Marketing Summit 2026',
    description: 'Join 500+ founders and marketers to learn the latest strategies for scaling in African markets.',
    type: 'WEBINAR', startDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 7 + 7200000).toISOString(),
    isOnline: true, meetingLink: '#', tags: ['marketing', 'startup', 'africa'],
    organizer: { id: 'system', name: 'ScaleAfrique Team', avatar: undefined },
    _count: { attendees: 312 },
  },
  {
    id: 'e2', organizerId: 'system', title: 'WhatsApp Marketing Masterclass for SMEs',
    description: 'Practical 2-hour workshop on building customer communities and driving sales via WhatsApp Business.',
    type: 'WORKSHOP', startDate: new Date(Date.now() + 86400000 * 14).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 14 + 7200000).toISOString(),
    isOnline: true, meetingLink: '#', tags: ['whatsapp', 'workshop', 'sme'],
    organizer: { id: 'system', name: 'ScaleAfrique Community', avatar: undefined },
    _count: { attendees: 98 },
  },
];

const RESOURCES = [
  { id: 'r1', title: 'African Market Entry Playbook 2026', type: 'GUIDE', downloads: 1240, tags: ['market-entry', 'africa'], description: 'Step-by-step guide for entering 10 top African markets.' },
  { id: 'r2', title: 'Social Media Content Calendar Template', type: 'TEMPLATE', downloads: 876, tags: ['social-media', 'template'], description: 'A 30-day Canva-ready content calendar for African brands.' },
  { id: 'r3', title: 'Fintech Customer Acquisition Case Study', type: 'CASE_STUDY', downloads: 643, tags: ['fintech', 'case-study'], description: 'How a fintech startup grew from 0 to 1M users across Africa.' },
  { id: 'r4', title: 'WhatsApp Business API Setup Guide', type: 'GUIDE', downloads: 512, tags: ['whatsapp', 'automation'], description: 'Complete setup guide for WhatsApp Business API integration.' },
];

const MEMBERS = [
  { name: 'Ama Korantema', company: 'PayQuick GH', country: '🇬🇭', role: 'Fintech Founder', posts: 24 },
  { name: 'Chidi Nwosu', company: 'LogiFlow NG', country: '🇳🇬', role: 'Growth Marketer', posts: 18 },
  { name: 'Zanele Dlamini', company: 'AgroConnect KE', country: '🇰🇪', role: 'Product Lead', posts: 12 },
  { name: 'Kofi Mensah', company: 'EduTech GH', country: '🇬🇭', role: 'CEO & Founder', posts: 9 },
  { name: 'Fatima Al-Hassan', company: 'HealthTech EG', country: '🇪🇬', role: 'Marketing Director', posts: 7 },
  { name: 'Tendai Moyo', company: 'RetailPro ZW', country: '🇿🇼', role: 'Startup Advisor', posts: 5 },
];

export function Community() {
  const [tab, setTab] = useState<Tab>('feed');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [postForm, setPostForm] = useState({ title: '', content: '', category: 'question', tags: '' });

  const qc = useQueryClient();

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['community', 'posts', category],
    queryFn: () => communityService.getPosts({ category: category === 'All' ? undefined : category, limit: 20 }),
    staleTime: 30_000,
  });

  const { data: events } = useQuery({
    queryKey: ['community', 'events'],
    queryFn: () => communityService.getEvents(),
    staleTime: 60_000,
  });

  const { mutate: createPost, isPending: creating } = useMutation({
    mutationFn: () => communityService.createPost({
      title: postForm.title,
      content: postForm.content,
      category: postForm.category,
      tags: postForm.tags ? postForm.tags.split(',').map(t => t.trim()) : [],
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community', 'posts'] });
      toast.success('Post published!');
      setNewPostOpen(false);
      setPostForm({ title: '', content: '', category: 'question', tags: '' });
    },
    onError: () => toast.error('Failed to publish post'),
  });

  const { mutate: likePost } = useMutation({
    mutationFn: (id: string) => communityService.likePost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['community', 'posts'] }),
  });

  const posts = (postsData?.posts ?? []).filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  );

  const displayEvents = events?.length ? events : FALLBACK_EVENTS;

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'feed', label: 'Feed', icon: <MessageSquare size={15} /> },
    { key: 'events', label: 'Events', icon: <Calendar size={15} /> },
    { key: 'resources', label: 'Resources', icon: <BookOpen size={15} /> },
    { key: 'members', label: 'Members', icon: <Users size={15} /> },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Community Hub</h2>
          <p className="text-sm text-gray-500">Connect, collaborate, and grow with African founders</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={() => setNewPostOpen(true)}>New Post</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Members', value: '4,200+' },
          { label: 'Posts this month', value: postsData?.total != null ? String(postsData.total) : '—' },
          { label: 'Countries', value: '34' },
        ].map(({ label, value }) => (
          <Card key={label} className="text-center py-3">
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              'flex items-center gap-1.5 flex-1 justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {tab === 'feed' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search posts..."
                className="pl-8 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={clsx(
                  'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                  category === cat ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                )}
              >
                {cat === 'All' ? 'All Posts' : cat.replace('-', ' ')}
              </button>
            ))}
          </div>
          {postsLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" className="text-primary-600" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm font-medium text-gray-700">No posts yet</p>
              <p className="text-xs text-gray-500 mt-1 mb-3">Be the first to share your experience.</p>
              <Button size="sm" onClick={() => setNewPostOpen(true)}>Share something</Button>
            </div>
          ) : (
            posts.map(post => <PostCard key={post.id} post={post} onLike={() => likePost(post.id)} />)
          )}
        </div>
      )}

      {tab === 'events' && (
        <div className="space-y-4">
          {displayEvents.map(event => (
            <Card key={event.id} hover>
              <div className="flex gap-4">
                <div className="shrink-0 w-14 text-center">
                  <p className="text-xs font-medium text-primary-600 uppercase">
                    {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{new Date(event.startDate).getDate()}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-900">{event.title}</h4>
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full shrink-0', EVENT_TYPE_COLORS[event.type])}>
                      {event.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={11} /> {formatDate(event.startDate)}
                    </span>
                    {event.isOnline && <Badge variant="info">Online</Badge>}
                    {event._count?.attendees != null && (
                      <span className="text-xs text-gray-400">{event._count.attendees} registered</span>
                    )}
                  </div>
                </div>
                {event.meetingLink && event.meetingLink !== '#' && (
                  <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="shrink-0">
                    <Button variant="outline" size="sm" iconRight={<ExternalLink size={12} />}>RSVP</Button>
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'resources' && (
        <div className="space-y-3">
          {RESOURCES.map(r => (
            <Card key={r.id} hover>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                  <BookOpen size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{r.title}</h4>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full shrink-0">{r.type}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {r.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded">#{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-gray-900">{r.downloads.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">downloads</p>
                  <Button variant="outline" size="sm" className="mt-2">Download</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'members' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MEMBERS.map(m => (
            <Card key={m.name} hover className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {m.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-gray-900 truncate">{m.name}</p>
                  <span>{m.country}</span>
                </div>
                <p className="text-xs text-gray-500">{m.role} · {m.company}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold text-gray-900">{m.posts}</p>
                <p className="text-xs text-gray-400">posts</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={newPostOpen} onClose={() => setNewPostOpen(false)} title="Create a Post">
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="What's on your mind?"
            value={postForm.title}
            onChange={e => setPostForm(f => ({ ...f, title: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px] resize-y"
              placeholder="Share your experience, ask a question, or start a discussion..."
              value={postForm.content}
              onChange={e => setPostForm(f => ({ ...f, content: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={postForm.category}
              onChange={e => setPostForm(f => ({ ...f, category: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="question">Question</option>
              <option value="success-story">Success Story</option>
              <option value="resource">Resource / Tool</option>
              <option value="collaboration">Looking to Collaborate</option>
              <option value="announcement">Announcement</option>
            </select>
          </div>
          <Input
            label="Tags (comma separated)"
            placeholder="e.g. fintech, ghana, growth"
            value={postForm.tags}
            onChange={e => setPostForm(f => ({ ...f, tags: e.target.value }))}
          />
          <Button
            fullWidth
            loading={creating}
            disabled={!postForm.title.trim() || !postForm.content.trim()}
            onClick={() => createPost()}
          >
            Publish Post
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function PostCard({ post, onLike }: { post: CommunityPost; onLike: () => void }) {
  return (
    <Card hover>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {post.user?.name?.[0] ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900">{post.user?.name}</p>
            {post.user?.startupProfile?.companyName && (
              <span className="text-xs text-gray-400">@ {post.user.startupProfile.companyName}</span>
            )}
            <span className="text-xs text-gray-400 ml-auto">{formatRelativeDate(post.createdAt)}</span>
          </div>
          <h4 className="text-sm font-medium text-gray-900 mt-1">{post.title}</h4>
          <p className="text-xs text-gray-600 mt-1 line-clamp-3 leading-relaxed">{post.content}</p>
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.tags.slice(0, 4).map(tag => (
                <span key={tag} className="text-xs bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded">#{tag}</span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 mt-3">
            <button onClick={onLike} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors">
              <Heart size={13} /> {post.likes}
            </button>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <MessageSquare size={13} /> {post._count?.comments ?? 0}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Eye size={13} /> {post.views}
            </span>
            <span className={clsx(
              'text-xs px-2 py-0.5 rounded-full ml-auto',
              post.category === 'success-story' ? 'bg-green-100 text-green-700' :
              post.category === 'collaboration' ? 'bg-purple-100 text-purple-700' :
              post.category === 'resource' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-600'
            )}>
              {post.category.replace('-', ' ')}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
